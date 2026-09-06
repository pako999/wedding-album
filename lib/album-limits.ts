import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums, userPlanOverrides } from "@/lib/db/schema";

export type AlbumCreationGate =
  | { allowed: true }
  | { allowed: false; mostRecentSlug: string };

type PaidPlan = "basic" | "plus" | "premium";

const PLAN_CONFIG: Record<PaidPlan, {
  maxPhotos: number;
  daysAccess: number;
  filmTier: "free" | "premium";
}> = {
  basic: { maxPhotos: 1_000, daysAccess: 90, filmTier: "free" },
  plus: { maxPhotos: 999_999, daysAccess: 365, filmTier: "free" },
  premium: { maxPhotos: 999_999, daysAccess: 365, filmTier: "premium" },
};

const PLAN_RANK: Record<PaidPlan, number> = { basic: 1, plus: 2, premium: 3 };

export function albumOwnerWhere(userId: string, verifiedOwnerEmails: string[] = []) {
  const emails = [...new Set(verifiedOwnerEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))];
  return emails.length === 0
    ? eq(albums.ownerClerkId, userId)
    : or(
        eq(albums.ownerClerkId, userId),
        inArray(sql<string>`lower(${albums.ownerEmail})`, emails),
      )!;
}

function isAdminGrant(paymentRef: string | null): boolean {
  const ref = paymentRef ?? "";
  return ref.startsWith("admin-grant:") ||
    ref.startsWith("admin-override:") ||
    ref.startsWith("manual_fix") ||
    ref === "comp:influencer" ||
    ref === "comp:sponsor";
}

/**
 * Each paid package belongs to exactly one event/album. A paid album must
 * therefore never unlock extra paid events on the same account.
 *
 * Owners may create another event after their existing event is paid; the
 * new event starts on Free and can be upgraded separately. To prevent Free
 * from becoming an unlimited-event loophole, an account may have only one
 * active Free event at a time.
 */
export async function getAlbumCreationGate(
  userId: string,
  verifiedOwnerEmails: string[] = [],
): Promise<AlbumCreationGate> {
  const ownerWhere = albumOwnerWhere(userId, verifiedOwnerEmails);
  const userAlbums = await db.query.albums.findMany({
    where: ownerWhere,
    orderBy: [desc(albums.createdAt)],
  });

  const now = new Date();
  let accountGrant = await db.query.userPlanOverrides.findFirst({
    where: eq(userPlanOverrides.clerkId, userId),
  }).catch(() => null);

  // Repair historical admin upgrades whose override was incorrectly deleted
  // after updating the then-existing galleries. Only explicit admin/comp
  // grants become account-wide; a normal Mollie purchase remains per event.
  if (!accountGrant) {
    const grantedAlbums = userAlbums
      .filter((album) =>
        album.plan !== "free" &&
        isAdminGrant(album.stripeSessionId) &&
        (album.expiresAt === null || album.expiresAt > now),
      )
      .sort((a, b) => PLAN_RANK[b.plan as PaidPlan] - PLAN_RANK[a.plan as PaidPlan]);
    const strongest = grantedAlbums[0];
    if (strongest) {
      const plan = strongest.plan as PaidPlan;
      const config = PLAN_CONFIG[plan];
      accountGrant = await db
        .insert(userPlanOverrides)
        .values({
          clerkId: userId,
          plan,
          maxPhotos: config.maxPhotos,
          filmTier: config.filmTier,
          daysAccess: config.daysAccess,
          compTag: strongest.stripeSessionId?.startsWith("comp:")
            ? strongest.stripeSessionId
            : null,
        })
        .onConflictDoUpdate({
          target: userPlanOverrides.clerkId,
          set: {
            plan,
            maxPhotos: config.maxPhotos,
            filmTier: config.filmTier,
            daysAccess: config.daysAccess,
          },
        })
        .returning()
        .then((rows) => rows[0] ?? null);
    }
  }

  if (accountGrant && accountGrant.plan !== "free") {
    const expiresAt = accountGrant.daysAccess
      ? new Date(now.getTime() + accountGrant.daysAccess * 24 * 60 * 60 * 1000)
      : null;
    // A verified-email match means this is the same owner under a recreated
    // Clerk identity. Consolidate those rows so later queries see one account.
    if (verifiedOwnerEmails.length > 0) {
      await db
        .update(albums)
        .set({ ownerClerkId: userId, ownerEmail: verifiedOwnerEmails[0] })
        .where(ownerWhere);
    }

    // Self-heal galleries created while the historical account grant was
    // missing. This fixes the owner immediately on their next create attempt.
    await db
      .update(albums)
      .set({
        plan: accountGrant.plan,
        maxPhotos: accountGrant.maxPhotos,
        filmTier: accountGrant.filmTier,
        expiresAt,
        stripeSessionId: accountGrant.compTag ?? `admin-override:${userId}`,
      })
      .where(and(ownerWhere, eq(albums.plan, "free")));
    return { allowed: true };
  }

  if (userAlbums.length === 0) return { allowed: true };

  const activeFreeAlbum = userAlbums.find(
    (album) =>
      album.plan === "free" &&
      (album.expiresAt === null || album.expiresAt > now),
  );

  if (activeFreeAlbum) {
    return { allowed: false, mostRecentSlug: activeFreeAlbum.slug };
  }

  return { allowed: true };
}
