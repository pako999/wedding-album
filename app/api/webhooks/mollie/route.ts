import { NextRequest, NextResponse } from "next/server";
import { getPayment, isPaidStatus, isRefundedStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";
import { markConversionPaid } from "@/lib/referral/attribution";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";
import { sendAdminPaymentEmail, sendAffiliateCommissionEmail, sendAdminAffiliateSaleEmail } from "@/lib/email/notifications";
import { incrementDiscountUsage } from "@/lib/discount";
import { db } from "@/lib/db";
import { affiliates, affiliateCommissions, affiliateClicks, albums } from "@/lib/db/schema";
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

  // Mollie fires webhooks for every status change. We act on three:
  //   • paid          → apply plan + create affiliate commission
  //   • refunded /
  //     charged_back  → clawback any affiliate commission
  //   • partial refund (status stays "paid" but amountRefunded > 0)
  //                   → also clawback (treated as full cancel for simplicity)
  const refunded = isRefundedStatus(payment.status) ||
    (parseFloat(payment.amountRefunded?.value ?? "0") > 0);
  if (refunded) {
    await clawbackAffiliateCommission(paymentId).catch((err) =>
      console.error("[mollie webhook] commission clawback failed:", err),
    );
    return NextResponse.json({ received: true });
  }

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

  // ── Meta Conversions API: server-side Purchase (dedupes with browser) ──
  // Fired here — AFTER the applyPlanToAlbum idempotency guard, so a
  // webhook replay for the same tr_… never re-sends. Uses payment.id as
  // event_id — the browser Pixel's Purchase (fired from
  // AlbumAdminPanel.tsx on the Mollie return) uses album.stripeSessionId
  // as its eventID, which is set to this same payment.id by
  // applyPlanToAlbum. Meta collapses the pair on shared event_id.
  //
  // Note on GDPR: the browser Pixel is Cookiebot-gated (marketing
  // consent). This server-side send fires unconditionally on a
  // completed transaction the user explicitly initiated, which is the
  // industry norm for e-commerce measurement. If we later add a
  // documented policy of blocking all marketing signals without
  // consent, gate this call on a consent-at-checkout flag.
  try {
    const buyerAlbum = await db.query.albums.findFirst({
      columns: { ownerEmail: true, notifyEmail: true },
      where: eq(albums.slug, albumSlug),
    });
    await sendPurchaseEvent({
      eventId:        paymentId,
      email:          buyerAlbum?.notifyEmail ?? buyerAlbum?.ownerEmail ?? null,
      value:          Number(payment.amount.value),
      currency:       payment.amount.currency,
      contentName:    planLabel(planId).text,
      eventSourceUrl: "https://www.guestcam.si",
      clientIp:       req.headers.get("x-vercel-forwarded-for")
                        ?? req.headers.get("x-forwarded-for")
                        ?? null,
      clientUserAgent: req.headers.get("user-agent") ?? null,
    });
  } catch (err) {
    // sendPurchaseEvent already swallows its own errors, but wrap
    // here too so any read-side hiccup can't break the webhook.
    console.error("[mollie webhook] meta-capi send failed:", err);
  }

  // Increment discount usage counter if a code was used
  if (payment.metadata?.discountCodeId) {
    await incrementDiscountUsage(payment.metadata.discountCodeId).catch(() => {});
  }

  // Guest-referral: mark the conversion as paid so K-factor reporting
  // picks it up. Idempotent — markConversionPaid only flips the first
  // unpaid row for this Clerk id. Best-effort.
  try {
    const buyer = await db.query.albums.findFirst({
      columns: { ownerClerkId: true },
      where: eq(albums.slug, albumSlug),
    });
    if (buyer?.ownerClerkId) await markConversionPaid(buyer.ownerClerkId);
  } catch (err) {
    console.warn("[mollie webhook] referral conversion mark-paid failed:", err);
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
        promoCode: payment.metadata?.discountCodeId ? null : null, // resolved inside helper from discountCodeId
        discountCodeId: payment.metadata?.discountCodeId ?? null,
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
  promoCode?: string | null;
  discountCodeId?: string | null;
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

  // Fraud check: block self-referral. We check three independent signals
  // because `albums.ownerEmail` is often null (the create-album flow
  // doesn't always populate it, see Codex review on PR #97):
  //   1. Clerk userId match — most reliable when the affiliate has signed in.
  //   2. ownerEmail / notifyEmail vs affiliate email — covers external affiliates.
  //   3. Live Clerk lookup by ownerClerkId — last resort, catches the common
  //      case where the buyer is logged in but ownerEmail wasn't persisted.
  const album = await db.query.albums.findFirst({
    where: eq(import_albums.slug, params.albumSlug),
  });
  const customerEmail = album?.notifyEmail ?? album?.ownerEmail ?? null;
  let isSelf = false;
  if (affiliate.clerkUserId && album?.ownerClerkId === affiliate.clerkUserId) {
    isSelf = true;
  } else if (customerEmail && customerEmail.toLowerCase() === affiliate.email.toLowerCase()) {
    isSelf = true;
  } else if (album?.ownerClerkId) {
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const user = await client.users.getUser(album.ownerClerkId);
      const emails = (user.emailAddresses ?? []).map((e) => e.emailAddress.toLowerCase());
      if (emails.includes(affiliate.email.toLowerCase())) isSelf = true;
    } catch {
      // Clerk unavailable — fall through with isSelf=false, we still have
      // the two cheaper checks above.
    }
  }
  if (isSelf) {
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

  // If a discount code was used and it belongs to this affiliate, pull its
  // code string so we can surface it in the admin notification.
  let promoCode: string | null = null;
  if (params.discountCodeId) {
    const dc = await db.query.discountCodes.findFirst({
      where: eq(import_discountCodes.id, params.discountCodeId),
    }).catch(() => null);
    if (dc && dc.affiliateId === affiliate.id) promoCode = dc.code;
  }

  // Fire the two notification emails in parallel. Both are best-effort.
  await Promise.all([
    sendAffiliateCommissionEmail({
      to: affiliate.email,
      name: affiliate.name,
      locale: affiliate.preferredLocale,
      commissionAmountCents,
      orderAmountCents: params.orderAmountCents,
      commissionRate: affiliate.commissionRate,
      orderDescription: planLabel(params.planId).text,
      lockUntil,
    }).catch((err) => console.error("[affiliate commission email] failed:", err)),
    sendAdminAffiliateSaleEmail({
      affiliateId: affiliate.id,
      affiliateName: affiliate.name,
      affiliateEmail: affiliate.email,
      referralCode: affiliate.referralCode,
      orderAmountCents: params.orderAmountCents,
      commissionAmountCents,
      commissionRate: affiliate.commissionRate,
      albumSlug: params.albumSlug,
      planName: planLabel(params.planId).text,
      promoCode,
    }).catch((err) => console.error("[admin affiliate sale email] failed:", err)),
  ]);

  await db.update(affiliateCommissions).set({
    emailSentAt: new Date(),
  }).where(eq(affiliateCommissions.id, commission.id)).catch(() => {});
}

// We import albums dynamically inside the helper to avoid loading it at module
// init time when the webhook is cold. Trick to keep the helper self-contained.
import { albums as import_albums, discountCodes as import_discountCodes } from "@/lib/db/schema";

/**
 * Reverse an affiliate commission when a paid order is later refunded or
 * charged back. Handles both pending and approved commissions: pending
 * → just cancel + drain pendingBalance; approved → cancel + drain
 * availableBalance (the funds were already promised but never actually
 * paid out yet, so this is safe; paid commissions are left alone and
 * need a manual decision because we've already wired money out).
 */
async function clawbackAffiliateCommission(molliePaymentId: string) {
  const found = await db.query.affiliateCommissions.findFirst({
    where: eq(affiliateCommissions.molliePaymentId, molliePaymentId),
  });
  if (!found) return;
  if (found.status !== "pending" && found.status !== "approved") return;

  const previousStatus = found.status;

  // Atomic transition: the WHERE includes the previous status, so a
  // concurrent cron run that flipped pending → approved between our read
  // and write will lose the race here, returning no rows. That keeps the
  // balance deduction below in lockstep with the actual status the
  // commission was in.
  const reversed = await db.update(affiliateCommissions).set({
    status: "cancelled",
    cancelledAt: new Date(),
    cancelReason: "refund",
  }).where(and(
    eq(affiliateCommissions.id, found.id),
    eq(affiliateCommissions.status, previousStatus),
  )).returning();
  if (reversed.length === 0) return;

  // Drain ONLY the balance bucket that actually held this commission's
  // money. Subtracting from both — as the first cut did — could
  // underpay an affiliate who had unrelated approved sales sitting in
  // availableBalanceCents while a still-pending sale was being refunded.
  if (previousStatus === "approved") {
    await db.update(affiliates).set({
      availableBalanceCents: sql`GREATEST(0, ${affiliates.availableBalanceCents} - ${found.commissionAmountCents})`,
      updatedAt: new Date(),
    }).where(eq(affiliates.id, found.affiliateId));
  } else {
    await db.update(affiliates).set({
      pendingBalanceCents: sql`GREATEST(0, ${affiliates.pendingBalanceCents} - ${found.commissionAmountCents})`,
      updatedAt: new Date(),
    }).where(eq(affiliates.id, found.affiliateId));
  }

  console.log(
    `[affiliate] commission ${found.id} (${previousStatus}) clawed back on refund of ${molliePaymentId}`,
  );
}
