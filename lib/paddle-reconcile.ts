import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTransaction, isPaidStatus, PaddleError } from "@/lib/paddle";

const PLAN_CONFIG: Record<string, { maxPhotos: number; daysAccess: number }> = {
  basic:   { maxPhotos: 1000,    daysAccess: 90  }, // 3 months
  plus:    { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
  premium: { maxPhotos: 999_999, daysAccess: 365 }, // 1 year
};

/**
 * Apply a paid plan / film tier to an album. Shared by the webhook and the
 * success-URL reconcile so the two paths never drift.
 *
 * `paymentRef` (the Paddle txn id) is stored in the `stripe_session_id` column,
 * which is now a *generic* payment reference (also holds Stripe `cs_…` history
 * and `comp:` / `manual_` admin sentinels). Setting the same fields twice is a
 * no-op, so this is safe to call from both the webhook and the reconcile.
 *
 * Returns the applied plan label, or null when planId is unknown.
 */
export async function applyPlanToAlbum(
  albumSlug: string,
  planId: string,
  paymentRef: string,
): Promise<{ plan: string } | null> {
  if (planId === "film_pro" || planId === "film_premium") {
    const filmTier = planId === "film_pro" ? "pro" : "premium";
    await db
      .update(albums)
      .set({ filmTier: filmTier as "pro" | "premium", stripeSessionId: paymentRef })
      .where(eq(albums.slug, albumSlug));
    return { plan: filmTier };
  }

  const config = PLAN_CONFIG[planId];
  if (!config) return null;

  const expiresAt = new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000);
  // Premium also unlocks Film Studio — keep filmTier in sync.
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

  return { plan: planId };
}

/**
 * Server-side reconciliation: given a Paddle transaction id (from the
 * Paddle.js `checkout.completed` redirect), verify the transaction is paid and
 * apply the upgrade to the matching album. Backstop for missed webhooks —
 * idempotent on the stored payment reference.
 */
export async function reconcilePaddleTransaction(
  transactionId: string,
  expectedAlbumSlug: string,
): Promise<
  | { ok: true; plan: string; status: "applied" | "already_applied" }
  | { ok: false; reason: string }
> {
  if (!transactionId || !expectedAlbumSlug) {
    return { ok: false, reason: "missing-params" };
  }
  if (!process.env.PADDLE_API_KEY) {
    return { ok: false, reason: "paddle-not-configured" };
  }

  let txn;
  try {
    txn = await getTransaction(transactionId);
  } catch (err) {
    const reason = err instanceof PaddleError ? `paddle-fetch-failed:${err.status}` : "paddle-fetch-failed";
    console.error("[reconcile] paddle retrieve failed:", err);
    return { ok: false, reason };
  }

  if (!isPaidStatus(txn.status)) {
    return { ok: false, reason: `unpaid-transaction:${txn.status}` };
  }
  const slugFromMeta = txn.custom_data?.albumSlug;
  const planId = txn.custom_data?.planId;
  if (!slugFromMeta || slugFromMeta !== expectedAlbumSlug || !planId) {
    return { ok: false, reason: "metadata-mismatch" };
  }

  // Idempotency: if the album already carries this exact txn id, we're done.
  const existing = await db.query.albums.findFirst({
    where: eq(albums.slug, expectedAlbumSlug),
  });
  if (!existing) return { ok: false, reason: "album-not-found" };
  if (existing.stripeSessionId === transactionId) {
    return { ok: true, plan: existing.plan, status: "already_applied" };
  }

  const applied = await applyPlanToAlbum(expectedAlbumSlug, planId, transactionId);
  if (!applied) return { ok: false, reason: `unknown-plan:${planId}` };

  return { ok: true, plan: applied.plan, status: "applied" };
}
