import Stripe from "stripe";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Server-side reconciliation: given a Stripe Checkout Session ID
 * (provided via success_url after a successful payment), verify the
 * session is actually paid and apply the plan upgrade to the matching
 * album. This is a backstop for missed webhooks — if the webhook
 * already ran, this is a no-op (idempotent on stripeSessionId).
 *
 * Returns the applied plan when an upgrade was performed, "already_applied"
 * if the album was already on the right plan with this session id, or
 * a failure reason otherwise.
 */
export async function reconcileStripeSession(
  sessionId: string,
  expectedAlbumSlug: string,
): Promise<
  | { ok: true; plan: string; status: "applied" | "already_applied" }
  | { ok: false; reason: string }
> {
  if (!sessionId || !expectedAlbumSlug) {
    return { ok: false, reason: "missing-params" };
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, reason: "stripe-not-configured" };

  const stripe = new Stripe(key);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[reconcile] stripe retrieve failed:", err);
    return { ok: false, reason: "stripe-fetch-failed" };
  }

  // Must be a successful payment for the same album the URL claims
  if (session.payment_status !== "paid") {
    return { ok: false, reason: `unpaid-session:${session.payment_status}` };
  }
  const slugFromMeta = session.metadata?.albumSlug;
  const planId = session.metadata?.planId;
  if (!slugFromMeta || slugFromMeta !== expectedAlbumSlug || !planId) {
    return { ok: false, reason: "metadata-mismatch" };
  }

  // Idempotency: if the album already has this exact session id stored,
  // we've already processed it.
  const existing = await db.query.albums.findFirst({
    where: eq(albums.slug, expectedAlbumSlug),
  });
  if (!existing) return { ok: false, reason: "album-not-found" };
  if (existing.stripeSessionId === sessionId) {
    return { ok: true, plan: existing.plan, status: "already_applied" };
  }

  // Apply the upgrade — same shape as the webhook handler
  if (planId === "film_pro" || planId === "film_premium") {
    const filmTier = planId === "film_pro" ? "pro" : "premium";
    await db
      .update(albums)
      .set({ filmTier: filmTier as "pro" | "premium", stripeSessionId: sessionId })
      .where(eq(albums.slug, expectedAlbumSlug));
    return { ok: true, plan: filmTier, status: "applied" };
  }

  const PLAN_CONFIG: Record<string, { maxPhotos: number; daysAccess: number }> = {
    basic:   { maxPhotos: 1000,    daysAccess: 90  },
    plus:    { maxPhotos: 999_999, daysAccess: 365 },
    premium: { maxPhotos: 999_999, daysAccess: 365 },
  };
  const config = PLAN_CONFIG[planId];
  if (!config) return { ok: false, reason: `unknown-plan:${planId}` };

  const expiresAt = new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000);
  const filmTierUpdate = planId === "premium" ? { filmTier: "premium" as const } : {};

  await db
    .update(albums)
    .set({
      plan: planId as "basic" | "plus" | "premium",
      stripeSessionId: sessionId,
      maxPhotos: config.maxPhotos,
      expiresAt,
      ...filmTierUpdate,
    })
    .where(eq(albums.slug, expectedAlbumSlug));

  return { ok: true, plan: planId, status: "applied" };
}
