import { NextRequest, NextResponse } from "next/server";
import { getPayment, isPaidStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";
import { sendAdminPaymentEmail, sendAffiliateCommissionEmail } from "@/lib/email/notifications";
import { incrementDiscountUsage } from "@/lib/discount";
import { db } from "@/lib/db";
import { affiliates, affiliateCommissions, affiliateClicks } from "@/lib/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function planLabel(planId: string): { emoji: string; text: string } {
  switch (planId) {
    case "premium":      return { emoji: "💸", text: "Premium" };
    case "plus":         return { emoji: "💸", text: "Plus" };
    case "basic":        return { emoji: "💸", text: "Basic" };
    case "film_pro":     return { emoji: "🎬", text: "Film Studio Pro" };
    case "film_premium": return { emoji: "🎬", text: "Film Studio Premium" };
    default:             return { emoji: "💸", text: planId };
  }
}

export async function POST(req: NextRequest) {
  if (!mollieConfigured()) {
    return NextResponse.json({ error: "Mollie not configured" }, { status: 503 });
  }

  // Mollie sends application/x-www-form-urlencoded with id=tr_xxxx
  const body = await req.text();
  const params = new URLSearchParams(body);
  const paymentId = params.get("id");

  if (!paymentId) {
    console.error("[mollie webhook] missing payment id");
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("[mollie webhook] failed to fetch payment:", err);
    return NextResponse.json({ error: "Payment fetch failed" }, { status: 500 });
  }

  // Mollie fires webhooks for every status change; only act on paid
  if (!isPaidStatus(payment.status)) {
    return NextResponse.json({ received: true });
  }

  const albumSlug = payment.metadata?.albumSlug;
  const planId = payment.metadata?.planId;

  if (!albumSlug || !planId) {
    console.error("[mollie webhook] missing metadata", payment.metadata);
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  let applied;
  try {
    applied = await applyPlanToAlbum(albumSlug, planId, paymentId);
  } catch (err) {
    console.error("[mollie webhook] DB update failed:", err);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  if (!applied) {
    console.error("[mollie webhook] unknown planId:", planId);
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  if (applied.status === "already_applied") {
    return NextResponse.json({ received: true });
  }

  // Increment discount usage counter if a code was used
  if (payment.metadata?.discountCodeId) {
    await incrementDiscountUsage(payment.metadata.discountCodeId).catch(() => {});
  }

  // ── Affiliate commission ────────────────────────────────────────────────
  // If the customer arrived via a partner link, we created the Mollie
  // payment with an affiliateRef in metadata (see /api/checkout). Now
  // that the payment is paid, create a pending commission. The lock
  // period (14 days) protects us from refund clawbacks.
  const affiliateRef = payment.metadata?.affiliateRef;
  if (affiliateRef) {
    try {
      await createAffiliateCommission({
        affiliateRef,
        molliePaymentId: paymentId,
        albumSlug,
        planId,
        customerEmail: null,
        orderAmountCents: Math.round(parseFloat(payment.amount.value) * 100),
        orderCurrency: payment.amount.currency.toUpperCase(),
      });
    } catch (err) {
      console.error("[mollie webhook] affiliate commission failed:", err);
    }
  }

  const amount = parseFloat(payment.amount.value).toFixed(2);
  const currency = payment.amount.currency;
  const { emoji, text } = planLabel(planId);

  await Promise.all([
    notifyTelegram(
      `${emoji} <b>Plačilo: ${text}</b>\n` +
      `${amount} ${currency}\n` +
      `Album: <code>${htmlEscape(albumSlug)}</code>`,
    ),
    sendAdminPaymentEmail({
      albumSlug,
      planId,
      amount,
      currency,
      paymentId,
      method: payment.method ?? null,
    }),
  ]);

  return NextResponse.json({ received: true });
}

const LOCK_DAYS = Number(process.env.AFFILIATE_COMMISSION_LOCK_DAYS ?? 14);

async function createAffiliateCommission(params: {
  affiliateRef: string;
  molliePaymentId: string;
  albumSlug: string;
  planId: string;
  customerEmail: string | null;
  orderAmountCents: number;
  orderCurrency: string;
}) {
  // Idempotency: if a commission for this Mollie payment already exists
  // (webhook fired twice), skip. The unique index on mollie_payment_id
  // is the ultimate guard; this is just to avoid noisy console errors.
  const existing = await db.query.affiliateCommissions.findFirst({
    where: eq(affiliateCommissions.molliePaymentId, params.molliePaymentId),
  });
  if (existing) return;

  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.referralCode, params.affiliateRef),
  });
  if (!affiliate || affiliate.status !== "active") return;

  // Fraud check: block self-referral by email match. The order's customer
  // email is on `albums.ownerEmail` once the plan is applied.
  const album = await db.query.albums.findFirst({
    where: eq(import_albums.slug, params.albumSlug),
  });
  const customerEmail = album?.notifyEmail ?? album?.ownerEmail ?? null;
  if (customerEmail && customerEmail.toLowerCase() === affiliate.email.toLowerCase()) {
    console.warn(`[affiliate] self-referral blocked: ${affiliate.email} on ${params.molliePaymentId}`);
    return;
  }

  const commissionAmountCents = Math.round(
    (params.orderAmountCents * affiliate.commissionRate) / 100,
  );
  const lockUntil = new Date(Date.now() + LOCK_DAYS * 24 * 60 * 60 * 1000);

  const [commission] = await db.insert(affiliateCommissions).values({
    affiliateId: affiliate.id,
    molliePaymentId: params.molliePaymentId,
    albumSlug: params.albumSlug,
    customerEmail,
    orderDescription: planLabel(params.planId).text,
    orderCurrency: params.orderCurrency,
    orderAmountCents: params.orderAmountCents,
    commissionRate: affiliate.commissionRate,
    commissionAmountCents,
    status: "pending",
    lockUntil,
  }).returning();

  // Bump affiliate stats atomically.
  await db.update(affiliates).set({
    totalConversions: sql`${affiliates.totalConversions} + 1`,
    totalEarningsCents: sql`${affiliates.totalEarningsCents} + ${commissionAmountCents}`,
    pendingBalanceCents: sql`${affiliates.pendingBalanceCents} + ${commissionAmountCents}`,
    updatedAt: new Date(),
  }).where(eq(affiliates.id, affiliate.id));

  // Mark the latest unconverted click for this affiliate as the source.
  // Best-effort — if there's no click row (e.g. user typed the URL with
  // ?ref=... directly without going through /api/affiliate/track), we
  // just skip silently.
  await db.update(affiliateClicks).set({
    convertedMolliePaymentId: params.molliePaymentId,
    convertedAt: new Date(),
  }).where(
    and(
      eq(affiliateClicks.affiliateId, affiliate.id),
      isNull(affiliateClicks.convertedMolliePaymentId),
    ),
  ).catch(() => {});

  // Send the commission notification email. Failure must not break the webhook.
  await sendAffiliateCommissionEmail({
    to: affiliate.email,
    name: affiliate.name,
    locale: affiliate.preferredLocale,
    commissionAmountCents,
    orderAmountCents: params.orderAmountCents,
    commissionRate: affiliate.commissionRate,
    orderDescription: planLabel(params.planId).text,
    lockUntil,
  }).catch((err) => console.error("[affiliate commission email] failed:", err));

  await db.update(affiliateCommissions).set({
    emailSentAt: new Date(),
  }).where(eq(affiliateCommissions.id, commission.id)).catch(() => {});
}

// We import albums dynamically inside the helper to avoid loading it at module
// init time when the webhook is cold. Trick to keep the helper self-contained.
import { albums as import_albums } from "@/lib/db/schema";
