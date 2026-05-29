import { NextRequest, NextResponse } from "next/server";
import { verifyPaddleSignature } from "@/lib/paddle";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";
import { htmlEscape, notifyTelegram } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function planLabel(planId: string): { emoji: string; text: string } {
  switch (planId) {
    case "premium": return { emoji: "💸", text: "Premium" };
    case "plus":    return { emoji: "💸", text: "Plus" };
    case "basic":   return { emoji: "💸", text: "Basic" };
    case "film_pro":     return { emoji: "🎬", text: "Film Studio Pro" };
    case "film_premium": return { emoji: "🎬", text: "Film Studio Premium" };
    default:        return { emoji: "💸", text: planId };
  }
}

interface PaddleWebhookEvent {
  event_type?: string;
  data?: {
    id?: string;
    custom_data?: { albumSlug?: string; planId?: string } | null;
    details?: { totals?: { grand_total?: string; currency_code?: string } };
    customer?: { email?: string } | null;
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!verifyPaddleSignature(body, signature, secret)) {
    console.error("[paddle webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: PaddleWebhookEvent;
  try {
    event = JSON.parse(body) as PaddleWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // transaction.completed fires once a one-off purchase is fully paid. The
  // success-URL reconcile is the backstop if this delivery is missed.
  if (event.event_type === "transaction.completed") {
    const txn = event.data ?? {};
    const albumSlug = txn.custom_data?.albumSlug;
    const planId = txn.custom_data?.planId;

    if (!albumSlug || !planId || !txn.id) {
      console.error("[paddle webhook] missing custom_data", txn.custom_data);
      return NextResponse.json({ error: "Missing custom_data" }, { status: 400 });
    }

    let applied;
    try {
      applied = await applyPlanToAlbum(albumSlug, planId, txn.id);
    } catch (err) {
      console.error("[paddle webhook] DB update failed:", err);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
    if (!applied) {
      console.error("[paddle webhook] unknown planId:", planId);
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }
    // Duplicate / replayed delivery for a txn we already applied — ack without
    // re-pinging ops or re-extending access.
    if (applied.status === "already_applied") {
      return NextResponse.json({ received: true });
    }

    // Ops ping — fire AFTER the DB update so we don't notify about a payment
    // that didn't apply. grand_total is a string in the smallest unit.
    const cents = Number(txn.details?.totals?.grand_total ?? "0");
    const amount = (cents / 100).toFixed(2);
    const currency = txn.details?.totals?.currency_code ?? "EUR";
    const email = txn.customer?.email ?? "(no email)";
    const { emoji, text } = planLabel(planId);
    await notifyTelegram(
      `${emoji} <b>Plačilo: ${text}</b>\n` +
      `${htmlEscape(email)} · ${amount} ${currency}\n` +
      `Album: <code>${htmlEscape(albumSlug)}</code>`,
    );
  }

  return NextResponse.json({ received: true });
}
