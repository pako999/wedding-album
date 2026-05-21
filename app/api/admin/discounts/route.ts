import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Create a Stripe coupon + promotion code in one shot.
 * Body: { code: string, type: "percent" | "amount", amount: number,
 *         maxRedemptions: number | null, expiresInDays: number | null }
 *
 * Uses the official Stripe SDK (rather than raw HTTP) so parameter
 * names track whatever Stripe-Version the SDK pins. A previous raw
 * HTTP version hit "parameter_unknown: coupon" because the default
 * API version the account was on didn't accept the bare /v1 params.
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
  const maxRedemptions = body.maxRedemptions === null || body.maxRedemptions === undefined
    ? null
    : Number(body.maxRedemptions);
  const expiresInDays = body.expiresInDays === null || body.expiresInDays === undefined
    ? null
    : Number(body.expiresInDays);

  if (code.length < 3) return NextResponse.json({ error: "Koda mora imeti vsaj 3 znake" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Neveljaven znesek" }, { status: 400 });
  }

  const stripe = new Stripe(key);

  // 1) Create the underlying coupon
  let coupon: Stripe.Coupon;
  try {
    const couponParams: Stripe.CouponCreateParams = {
      duration: "once",
      name: code,
      ...(type === "percent"
        ? { percent_off: amount }
        : { amount_off: Math.round(amount * 100), currency: "eur" }),
    };
    coupon = await stripe.coupons.create(couponParams);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Stripe coupon: ${msg.slice(0, 200)}` }, { status: 502 });
  }

  // 2) Create the promotion code (the human-readable string customers type)
  try {
    const promoParams: Stripe.PromotionCodeCreateParams = {
      coupon: coupon.id,
      code,
      ...(maxRedemptions ? { max_redemptions: maxRedemptions } : {}),
      ...(expiresInDays
        ? { expires_at: Math.floor((Date.now() + expiresInDays * 86_400_000) / 1000) }
        : {}),
    };
    const promo = await stripe.promotionCodes.create(promoParams);
    return NextResponse.json({ id: promo.id, code: promo.code });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Stripe promotion code: ${msg.slice(0, 200)}` }, { status: 502 });
  }
}
