import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Create a Stripe coupon + promotion code in one shot.
 * Body: { code: string, type: "percent" | "amount", amount: number,
 *         maxRedemptions: number | null, expiresInDays: number | null }
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Stripe ni konfiguriran" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  const type = body.type === "amount" ? "amount" : "percent";
  const amount = Number(body.amount);
  const maxRedemptions = body.maxRedemptions === null ? null : Number(body.maxRedemptions);
  const expiresInDays = body.expiresInDays === null ? null : Number(body.expiresInDays);

  if (code.length < 3) return NextResponse.json({ error: "Koda mora imeti vsaj 3 znake" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Neveljaven znesek" }, { status: 400 });
  }

  // 1) Create the underlying coupon
  const couponBody = new URLSearchParams({
    duration: "once",
    name: code,
  });
  if (type === "percent") {
    couponBody.set("percent_off", String(amount));
  } else {
    couponBody.set("amount_off", String(Math.round(amount * 100)));
    couponBody.set("currency", "eur");
  }

  const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: couponBody.toString(),
  });
  if (!couponRes.ok) {
    const err = await couponRes.text();
    return NextResponse.json({ error: `Stripe coupon: ${err.slice(0, 200)}` }, { status: 502 });
  }
  const coupon = await couponRes.json();

  // 2) Create the promotion code (the human-readable string customers type)
  const promoBody = new URLSearchParams({
    coupon: coupon.id,
    code,
  });
  if (maxRedemptions) promoBody.set("max_redemptions", String(maxRedemptions));
  if (expiresInDays) {
    const expiresAt = Math.floor((Date.now() + expiresInDays * 86_400_000) / 1000);
    promoBody.set("expires_at", String(expiresAt));
  }

  const promoRes = await fetch("https://api.stripe.com/v1/promotion_codes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: promoBody.toString(),
  });
  if (!promoRes.ok) {
    const err = await promoRes.text();
    return NextResponse.json({ error: `Stripe promotion code: ${err.slice(0, 200)}` }, { status: 502 });
  }
  const promo = await promoRes.json();

  return NextResponse.json({ id: promo.id, code: promo.code });
}
