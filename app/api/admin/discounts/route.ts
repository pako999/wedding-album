import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createDiscount, paddleConfigured, PaddleError } from "@/lib/paddle";

export const dynamic = "force-dynamic";

/**
 * Create a Paddle discount (redeemable code).
 *
 * Body: { code: string, type: "percent" | "amount", amount: number,
 *         maxRedemptions: number | null, expiresInDays: number | null }
 *
 * Paddle discounts are enabled_for_checkout, so guests enter the code inside
 * the Paddle.js overlay. One discount object carries the code directly (no
 * separate coupon + promotion-code step like Stripe had).
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!paddleConfigured()) {
    return NextResponse.json({ error: "Paddle ni konfiguriran" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  const type = body.type === "amount" ? "flat" : "percentage";
  const amount = Number(body.amount);
  const maxRedemptions = body.maxRedemptions === null || body.maxRedemptions === undefined
    ? null
    : Number(body.maxRedemptions);
  const expiresInDays = body.expiresInDays === null || body.expiresInDays === undefined
    ? null
    : Number(body.expiresInDays);

  if (!/^[A-Z0-9-]{3,}$/.test(code)) {
    return NextResponse.json(
      { error: "Koda mora imeti vsaj 3 znake (A–Z, 0–9, −)" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Neveljaven znesek" }, { status: 400 });
  }
  if (type === "percentage" && amount > 100) {
    return NextResponse.json({ error: "Odstotek ne sme presegati 100" }, { status: 400 });
  }

  try {
    const discount = await createDiscount({
      code,
      type,
      amount,
      currency: "EUR",
      description: code,
      maxRedemptions,
      expiresInDays,
    });
    return NextResponse.json({ id: discount.id, code: discount.code });
  } catch (err) {
    const msg = err instanceof PaddleError ? err.message : err instanceof Error ? err.message : "Napaka";
    console.error("[admin/discounts] paddle discount create failed:", err);
    return NextResponse.json({ error: `Paddle: ${String(msg).slice(0, 200)}` }, { status: 502 });
  }
}
