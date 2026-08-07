import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const PLAN_CONFIG: Record<string, { maxPhotos: number; daysAccess: number }> = {
  basic:   { maxPhotos: 1000,    daysAccess: 90  }, // 3 months
  plus:    { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
  premium: { maxPhotos: 999_999, daysAccess: 730 }, // 2 years
};

/**
 * Apply a paid plan / film tier to an album.
 *
 * `paymentRef` is stored in the `stripe_session_id` column (a generic payment
 * reference that historically also held Stripe cs_… and Paddle txn_… IDs).
 *
 * Idempotent: returns "already_applied" without writing when the album ALREADY
 * carries this payment ref AND the target effect is already present (plan
 * upgraded / film tier granted).
 *
 * CRITICAL: the guard must NOT be `stripeSessionId === paymentRef` alone.
 * Checkout pre-writes the payment id onto the album BEFORE payment (so the
 * return page can reconcile). With the id-only guard, the first real webhook
 * saw a matching id while the plan was still `free` and returned
 * "already_applied" — so the plan was NEVER upgraded and paid customers stayed
 * on free. The guard now also requires the effect to be in place.
 */
export async function applyPlanToAlbum(
  albumSlug: string,
  planId: string,
  paymentRef: string,
): Promise<{ plan: string; status: "applied" | "already_applied" } | null> {
  const existing = await db.query.albums.findFirst({
    where: eq(albums.slug, albumSlug),
  });

  // "Already applied" = same payment ref AND the intended effect is present:
  //  • film purchase → filmTier already at the target tier
  //  • plan purchase → plan already the target plan
  // A duplicate/replayed webhook hits this and no-ops; the first webhook
  // after a checkout-prewritten id does NOT (plan is still free), so it
  // applies correctly.
  if (existing && existing.stripeSessionId === paymentRef) {
    const filmTarget =
      planId === "film_pro" ? "pro" : planId === "film_premium" ? "premium" : null;
    const alreadyApplied = filmTarget
      ? existing.filmTier === filmTarget
      : existing.plan === planId;
    if (alreadyApplied) {
      return { plan: existing.plan, status: "already_applied" };
    }
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
