import { SITE_URL } from "@/lib/urls";
import { NextRequest, NextResponse } from "next/server";
import { getPayment, isPaidStatus, isRefundedStatus, mollieConfigured } from "@/lib/mollie";
import { markStandOrderPaid } from "@/lib/stand-orders";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";
import { markConversionPaid } from "@/lib/referral/attribution";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";
import { sendAdminPaymentEmail, sendAffiliateCommissionEmail, sendAdminAffiliateSaleEmail } from "@/lib/email/notifications";
import { incrementDiscountUsage } from "@/lib/discount";
import { db } from "@/lib/db";
import { affiliates, affiliateCommissions, affiliateClicks, albums, cardBilling } from "@/lib/db/schema";
import { eq, sql, and, isNull } from "drizzle-orm";
import {
  claimWebhookEvent,
  releaseWebhookEvent,
  maybePruneWebhookReceipts,
} from "@/lib/webhook-idempotency";

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

/**
 * Run one retryable webhook side effect exactly once across serverless
 * instances. If the action throws, release its claim so Mollie's next retry
 * can try again. A successful action keeps the receipt permanently (90-day
 * retention in webhook-idempotency.ts).
 */
async function runPaymentAction(
  action: string,
  paymentId: string,
  fn: () => Promise<unknown>,
): Promise<boolean> {
  let claimed: boolean;
  try {
    claimed = await claimWebhookEvent(`mollie:${action}`, paymentId);
  } catch (err) {
    console.error(`[mollie webhook] cannot claim ${action}:`, err);
    return false;
  }

  if (!claimed) return true;

  try {
    await fn();
    return true;
  } catch (err) {
    console.error(`[mollie webhook] ${action} failed:`, err);
    await releaseWebhookEvent(`mollie:${action}`, paymentId).catch((releaseErr) =>
      console.error(`[mollie webhook] could not release ${action} claim:`, releaseErr),
    );
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!mollieConfigured()) {
    return NextResponse.json({ error: "Mollie not configured" }, { status: 503 });
  }

  // Mollie webhooks are not signed. Authenticity comes from fetching the
  // supplied transaction id from Mollie's authenticated API and trusting only
  // the status + metadata returned by Mollie, never fields from this request.
  const body = await req.text();
  const params = new URLSearchParams(body);
  const paymentId = params.get("id")?.trim() ?? "";

  if (!/^tr_[A-Za-z0-9]+$/.test(paymentId)) {
    console.error("[mollie webhook] missing/invalid payment id");
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let payment;
  try {
    payment = await getPayment(paymentId);
  } catch (err) {
    console.error("[mollie webhook] failed to fetch payment:", err);
    return NextResponse.json({ error: "Payment fetch failed" }, { status: 500 });
  }

  // Mollie fires webhooks for every status change. Refunded/charged-back
  // payments only need affiliate clawback; unpaid states are acknowledged.
  const refunded = isRefundedStatus(payment.status) ||
    (parseFloat(payment.amountRefunded?.value ?? "0") > 0);
  if (refunded) {
    try {
      await clawbackAffiliateCommission(paymentId);
      return NextResponse.json(
        { received: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (err) {
      // Do not acknowledge a failed clawback. Mollie will retry and the
      // transition below is idempotent.
      console.error("[mollie webhook] commission clawback failed:", err);
      return NextResponse.json({ error: "Refund reconciliation failed" }, { status: 500 });
    }
  }

  if (!isPaidStatus(payment.status)) {
    return NextResponse.json(
      { received: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const albumSlug = payment.metadata?.albumSlug;
  const planId = payment.metadata?.planId;

  if (!albumSlug || !planId) {
    console.error("[mollie webhook] missing metadata", payment.metadata);
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  // Migration-safe retry marker. Why this exists in addition to the per-action
  // receipts below:
  //   - first webhook handled by THIS code: marker is new; if plan becomes
  //     applied we run actions and retries can finish any failed ones;
  //   - payment already processed by the OLD code before this deploy: marker
  //     is new but plan is already_applied, so we stop here and do not resend
  //     old customer/admin notifications or increment historical counters.
  let firstSeenByRetrySafeFlow: boolean;
  try {
    firstSeenByRetrySafeFlow = await claimWebhookEvent("mollie:paid-flow-v2", paymentId);
  } catch (err) {
    console.error("[mollie webhook] idempotency store unavailable:", err);
    return NextResponse.json({ error: "Webhook store unavailable" }, { status: 503 });
  }

  let applied;
  try {
    applied = await applyPlanToAlbum(albumSlug, planId, paymentId);
  } catch (err) {
    console.error("[mollie webhook] DB update failed:", err);
    if (firstSeenByRetrySafeFlow) {
      await releaseWebhookEvent("mollie:paid-flow-v2", paymentId).catch(() => {});
    }
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  if (!applied) {
    console.error("[mollie webhook] unknown planId:", planId);
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  if (applied.status === "already_applied" && firstSeenByRetrySafeFlow) {
    // Historical payment from before the retry-safe flow was deployed.
    return NextResponse.json(
      { received: true, legacyAlreadyProcessed: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  let retryNeeded = false;

  // ── Meta Conversions API ────────────────────────────────────────────────
  // Same payment id is also the browser Pixel event id, so Meta can dedupe
  // browser + server. The receipt additionally prevents repeated CAPI calls.
  const metaOk = await runPaymentAction("meta-purchase", paymentId, async () => {
    const buyerAlbum = await db.query.albums.findFirst({
      columns: { ownerEmail: true, notifyEmail: true },
      where: eq(albums.slug, albumSlug),
    });
    await sendPurchaseEvent({
      eventId: paymentId,
      email: buyerAlbum?.notifyEmail ?? buyerAlbum?.ownerEmail ?? null,
      value: Number(payment.amount.value),
      currency: payment.amount.currency,
      contentName: planLabel(planId).text,
      eventSourceUrl: SITE_URL,
      clientIp: req.headers.get("x-vercel-forwarded-for")
        ?? req.headers.get("x-forwarded-for")
        ?? null,
      clientUserAgent: req.headers.get("user-agent") ?? null,
    });
  });
  if (!metaOk) {
    // Analytics must never hold up fulfilment/webhook acknowledgement.
    console.warn("[mollie webhook] meta purchase action will not block payment fulfilment");
  }

  // ── Physical stand order ────────────────────────────────────────────────
  if (payment.metadata?.tableStands === "1") {
    const standOk = await runPaymentAction("stand-order-paid", paymentId, async () => {
      await markStandOrderPaid(payment.id);
    });
    if (!standOk) retryNeeded = true;
  }

  // ── Discount usage ──────────────────────────────────────────────────────
  // This increments a counter, so it MUST have its own receipt. Retrying it
  // blindly would double-count the same sale.
  if (payment.metadata?.discountCodeId) {
    const discountOk = await runPaymentAction("discount-usage", paymentId, async () => {
      await incrementDiscountUsage(payment.metadata!.discountCodeId!);
    });
    if (!discountOk) retryNeeded = true;
  }

  // Guest-referral conversion is internally idempotent; retry until it lands.
  try {
    const buyer = await db.query.albums.findFirst({
      columns: { ownerClerkId: true },
      where: eq(albums.slug, albumSlug),
    });
    if (buyer?.ownerClerkId) await markConversionPaid(buyer.ownerClerkId);
  } catch (err) {
    console.warn("[mollie webhook] referral conversion mark-paid failed:", err);
    retryNeeded = true;
  }

  // ── Affiliate commission ────────────────────────────────────────────────
  // createAffiliateCommission has its own unique payment guard. Do not swallow
  // a transient DB failure anymore; a webhook retry can safely finish it.
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
        promoCode: payment.metadata?.discountCodeId ? null : null,
        discountCodeId: payment.metadata?.discountCodeId ?? null,
      });
    } catch (err) {
      console.error("[mollie webhook] affiliate commission failed:", err);
      retryNeeded = true;
    }
  }

  const amount = parseFloat(payment.amount.value).toFixed(2);
  const currency = payment.amount.currency;
  const { emoji, text } = planLabel(planId);

  // Billing captured at checkout — include it in the Telegram ping.
  let billingLines = "";
  try {
    const b = await db.query.cardBilling.findFirst({
      where: eq(cardBilling.molliePaymentId, paymentId),
    });
    if (b) {
      billingLines =
        `\n👤 <b>Podatki za račun:</b>\n` +
        `Ime: ${htmlEscape(b.name ?? "—")}` +
        (b.companyName ? `\nPodjetje: ${htmlEscape(b.companyName)}` : "") +
        (b.phone ? `\nTel: ${htmlEscape(b.phone)}` : "") +
        (b.email ? `\nEmail: ${htmlEscape(b.email)}` : "") +
        `\nNaslov: ${htmlEscape(b.address ?? "—")}, ${htmlEscape(b.postalCode ?? "")} ${htmlEscape(b.city ?? "")}` +
        (b.taxId ? `\nDavčna: ${htmlEscape(b.taxId)}` : "");
    }
  } catch {
    // Best-effort display data; payment fulfilment does not depend on it.
  }

  const telegramOk = await runPaymentAction("telegram-payment", paymentId, async () => {
    const sent = await notifyTelegram(
      `${emoji} <b>Plačilo: ${text}</b>\n` +
      `${amount} ${currency}\n` +
      `Album: <code>${htmlEscape(albumSlug)}</code>` +
      billingLines,
    );
    if (!sent) throw new Error("Telegram provider returned false");
  });
  if (!telegramOk) retryNeeded = true;

  const adminEmailOk = await runPaymentAction("admin-payment-email", paymentId, async () => {
    await sendAdminPaymentEmail({
      albumSlug,
      planId,
      amount,
      currency,
      paymentId,
      method: payment.method ?? null,
    });
  });
  if (!adminEmailOk) retryNeeded = true;

  await maybePruneWebhookReceipts();

  if (retryNeeded) {
    // Plan activation is already safe/idempotent. Returning 500 asks Mollie to
    // retry only the side effects whose individual claims were released.
    return NextResponse.json(
      { error: "Payment applied; reconciliation incomplete" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { received: true },
    { headers: { "Cache-Control": "no-store" } },
  );
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
  // because `albums.ownerEmail` is often null:
  //   1. Clerk userId match.
  //   2. ownerEmail / notifyEmail vs affiliate email.
  //   3. Live Clerk lookup by ownerClerkId as a last resort.
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
      // Clerk unavailable — fall through with the two cheaper checks above.
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

  await db.update(affiliates).set({
    totalConversions: sql`${affiliates.totalConversions} + 1`,
    totalEarningsCents: sql`${affiliates.totalEarningsCents} + ${commissionAmountCents}`,
    pendingBalanceCents: sql`${affiliates.pendingBalanceCents} + ${commissionAmountCents}`,
    updatedAt: new Date(),
  }).where(eq(affiliates.id, affiliate.id));

  await db.update(affiliateClicks).set({
    convertedMolliePaymentId: params.molliePaymentId,
    convertedAt: new Date(),
  }).where(
    and(
      eq(affiliateClicks.affiliateId, affiliate.id),
      isNull(affiliateClicks.convertedMolliePaymentId),
    ),
  ).catch(() => {});

  let promoCode: string | null = null;
  if (params.discountCodeId) {
    const dc = await db.query.discountCodes.findFirst({
      where: eq(import_discountCodes.id, params.discountCodeId),
    }).catch(() => null);
    if (dc && dc.affiliateId === affiliate.id) promoCode = dc.code;
  }

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

import { albums as import_albums, discountCodes as import_discountCodes } from "@/lib/db/schema";

/**
 * Reverse an affiliate commission when a paid order is later refunded or
 * charged back. Handles both pending and approved commissions.
 */
async function clawbackAffiliateCommission(molliePaymentId: string) {
  const found = await db.query.affiliateCommissions.findFirst({
    where: eq(affiliateCommissions.molliePaymentId, molliePaymentId),
  });
  if (!found) return;
  if (found.status !== "pending" && found.status !== "approved") return;

  const previousStatus = found.status;
  const reversed = await db.update(affiliateCommissions).set({
    status: "cancelled",
    cancelledAt: new Date(),
    cancelReason: "refund",
  }).where(and(
    eq(affiliateCommissions.id, found.id),
    eq(affiliateCommissions.status, previousStatus),
  )).returning();
  if (reversed.length === 0) return;

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
