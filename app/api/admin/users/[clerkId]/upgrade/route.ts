import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, userPlanOverrides } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin";
import { sendAccountUpgradedEmail } from "@/lib/email/notifications";

type EmailLang = "sl" | "hr" | "sr" | "de" | "en" | "es";
const SUPPORTED_LANGS: EmailLang[] = ["sl", "hr", "sr", "de", "en", "es"];

function pickLang(meta: unknown): EmailLang {
  if (meta && typeof meta === "object") {
    const raw = (meta as Record<string, unknown>).lang;
    if (typeof raw === "string" && (SUPPORTED_LANGS as string[]).includes(raw)) {
      return raw as EmailLang;
    }
  }
  return "sl";
}

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[clerkId]/upgrade  body: { plan }
 *
 * Manual admin override — applies a plan to a user IMMEDIATELY:
 *
 *   • If the user already has albums → bulk-update every album to the
 *     chosen plan (limits, expiry, comp tag).
 *
 *   • If the user has zero albums → create a placeholder album owned
 *     by them with the chosen plan applied. The owner can rename it
 *     from their dashboard. This is what makes the upgrade visible
 *     and useful instantly instead of "waiting" forever.
 *
 *   • Plan === "free" wipes any pending override and (if albums exist)
 *     downgrades them. It does NOT create a placeholder album for a
 *     0-album user — there is nothing to do, they are already free.
 *
 * Also maintains user_plan_overrides as a fallback: if Clerk lookup
 * fails or the placeholder create errors, the override still gets
 * written so the user's first real album inherits the plan.
 *
 * Pseudo-plans:
 *   influencer / sponsor → effective premium, stamped with comp: tag.
 */
type AdminPlan = "free" | "basic" | "plus" | "premium" | "influencer" | "sponsor";

const PLAN_CONFIG: Record<AdminPlan, {
  effectivePlan: "free" | "basic" | "plus" | "premium";
  maxPhotos: number;
  daysAccess: number | null;
  compTag?: "comp:influencer" | "comp:sponsor";
  filmTier: "free" | "pro" | "premium";
}> = {
  free:       { effectivePlan: "free",    maxPhotos: 20,      daysAccess: 30,  filmTier: "free"    },
  basic:      { effectivePlan: "basic",   maxPhotos: 1000,    daysAccess: 90,  filmTier: "free"    },
  plus:       { effectivePlan: "plus",    maxPhotos: 999_999, daysAccess: 365, filmTier: "free"    },
  premium:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, filmTier: "premium" },
  influencer: { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:influencer", filmTier: "premium" },
  sponsor:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:sponsor",    filmTier: "premium" },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clerkId } = await params;
  const body = await req.json().catch(() => ({}));
  const newPlan = body.plan as AdminPlan | undefined;
  if (!newPlan || !PLAN_CONFIG[newPlan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const config = PLAN_CONFIG[newPlan];
  const expiresAt = config.daysAccess
    ? new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000)
    : null;
  const sessionIdUpdate = config.compTag ? { stripeSessionId: config.compTag } : {};

  // Fetch the Clerk user up-front so we can both populate the
  // placeholder album AND notify them by email.
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId).catch(() => null);
  const ownerEmail   = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
  const firstName    = clerkUser?.firstName ?? null;
  const emailLang    = pickLang(clerkUser?.publicMetadata);

  // 1) Bulk-update any existing albums.
  const updated = await db
    .update(albums)
    .set({
      plan: config.effectivePlan,
      maxPhotos: config.maxPhotos,
      filmTier: config.filmTier,
      expiresAt: expiresAt ?? undefined,
      ...sessionIdUpdate,
    })
    .where(eq(albums.ownerClerkId, clerkId))
    .returning({ slug: albums.slug });

  // 2) If the user had zero albums AND the plan is non-free, create
  //    a placeholder so the upgrade applies immediately.
  let created: string | null = null;
  if (updated.length === 0 && newPlan !== "free") {
    try {
      const firstLast = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim();
      const coupleName = firstLast || ownerEmail?.split("@")[0] || "Moja prva galerija";
      const suffix = Math.random().toString(36).slice(2, 6);
      const baseSlug = slugify(coupleName) || "galerija";
      const slug = `${baseSlug}-${suffix}`;

      const today = new Date().toISOString().slice(0, 10);
      const inserted = await db
        .insert(albums)
        .values({
          slug,
          ownerClerkId: clerkId,
          ownerEmail,
          eventType: "wedding",
          coupleName,
          weddingDate: today,
          // Published so the URL works the moment the owner gets the
          // upgrade email; they can change visibility later from the
          // dashboard. Plan + limits are already applied, the gallery
          // is just empty until they (or guests) upload anything.
          isPublished: true,
          plan: config.effectivePlan,
          maxPhotos: config.maxPhotos,
          filmTier: config.filmTier,
          expiresAt: expiresAt ?? undefined,
          stripeSessionId: config.compTag ?? `admin-grant:${clerkId}`,
          moderationEnabled: false,
        })
        .returning({ slug: albums.slug });
      created = inserted[0]?.slug ?? null;
    } catch (err) {
      console.warn("[admin/users/upgrade] placeholder album create failed:", err);
    }
  }

  // 3) Maintain the user-level override.
  //    - "free" -> wipe any pending override (cancels a queued upgrade)
  //    - If we already materialized the upgrade this call (via a
  //      placeholder or existing album update), also wipe the override:
  //      it's already applied, no point queueing "next gallery" too.
  //    - Only WRITE the override when we couldn't materialize the upgrade
  //      (placeholder creation failed AND user had no existing albums).
  //      That's the true "waiting for their first gallery" state.
  let overrideSaved = false;
  try {
    const materialized = created !== null || updated.length > 0;
    if (newPlan === "free" || materialized) {
      await db.delete(userPlanOverrides).where(eq(userPlanOverrides.clerkId, clerkId));
    } else {
      await db
        .insert(userPlanOverrides)
        .values({
          clerkId,
          plan: config.effectivePlan,
          maxPhotos: config.maxPhotos,
          filmTier: config.filmTier,
          daysAccess: config.daysAccess,
          compTag: config.compTag ?? null,
        })
        .onConflictDoUpdate({
          target: userPlanOverrides.clerkId,
          set: {
            plan: config.effectivePlan,
            maxPhotos: config.maxPhotos,
            filmTier: config.filmTier,
            daysAccess: config.daysAccess,
            compTag: config.compTag ?? null,
          },
        });
      overrideSaved = true;
    }
  } catch (err) {
    console.warn("[admin/users/upgrade] override write failed (run /api/migrate?):", err);
  }

  // 4) Notify the user by email — best-effort, never blocks the response.
  let emailed = false;
  if (newPlan !== "free" && ownerEmail) {
    try {
      await sendAccountUpgradedEmail({
        to: ownerEmail,
        firstName,
        plan: config.effectivePlan as "basic" | "plus" | "premium",
        placeholderSlug: created ?? updated[0]?.slug ?? null,
        lang: emailLang,
      });
      emailed = true;
    } catch (err) {
      console.warn("[admin/users/upgrade] notify email failed:", err);
    }
  }

  return NextResponse.json({
    updated: updated.length,
    created,
    slugs: updated.map((x) => x.slug),
    overrideSaved,
    emailed,
  });
}
