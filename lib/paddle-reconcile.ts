import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PLAN_CONFIG: Record<string, { maxPhotos: number; daysAccess: number }> = {
  basic:   { maxPhotos: 1000,    daysAccess: 90  }, // 3 months
  plus:    { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
  premium: { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
};

/**
 * Apply a paid plan / film tier to an album.
 *
 * `paymentRef` is stored in the `stripe_session_id` column (a generic payment
 * reference that historically also held Stripe cs_… and Paddle txn_… IDs).
 *
 * Idempotent: if the album already carries this exact payment ref, returns
 * "already_applied" without writing — duplicate or replayed webhooks won't
 * push expiresAt forward again.
 */
export async function applyPlanToAlbum(
  albumSlug: string,
  planId: string,
  paymentRef: string,
): Promise<{ plan: string; status: "applied" | "already_applied" } | null> {
  const existing = await db.query.albums.findFirst({
    where: eq(albums.slug, albumSlug),
  });
  if (existing && existing.stripeSessionId === paymentRef) {
    return { plan: existing.plan, status: "already_applied" };
  }

  if (planId === "film_pro" || planId === "film_premium") {
    const filmTier = planId === "film_pro" ? "pro" : "premium";
    await db
      .update(albums)
      .set({ filmTier: filmTier as "pro" | "premium", stripeSessionId: paymentRef })
      .where(eq(albums.slug, albumSlug));
    return { plan: filmTier, status: "applied" };
  }

  const config = PLAN_CONFIG[planId];
  if (!config) return null;

  const expiresAt = new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000);
  const filmTierUpdate = planId === "premium" ? { filmTier: "premium" as const } : {};

  await db
    .update(albums)
    .set({
      plan: planId as "basic" | "plus" | "premium",
      stripeSessionId: paymentRef,
      maxPhotos: config.maxPhotos,
      expiresAt,
      ...filmTierUpdate,
    })
    .where(eq(albums.slug, albumSlug));

  return { plan: planId, status: "applied" };
}
