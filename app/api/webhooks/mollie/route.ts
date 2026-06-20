import { NextRequest, NextResponse } from "next/server";
import { getPayment, isPaidStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";
import { sendAdminPaymentEmail } from "@/lib/email/notifications";

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
