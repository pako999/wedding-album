import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Create a Stripe coupon + promotion code in one shot.
 *
 * Body: { code: string, type: "percent" | "amount", amount: number,
 *         maxRedemptions: number | null, expiresInDays: number | null }
 *
 * Implementation note — why raw REST instead of the Stripe SDK:
 *
 * The Stripe Node SDK at v22 wraps the coupon reference under a
 * `promotion: { type: "coupon", coupon }` object on PromotionCode
 * create — that shape only lands on the wire if the account's
 * default API version is recent enough. Older accounts (most of
 * ours pre-2025) reject it with `parameter_unknown: promotion`
 * and the create silently fails from the admin UI.
 *
 * The documented stable form-encoded params (`coupon=<id>`) work on
 * every Stripe account regardless of pinned API version. So we
 * post them directly, leaving the SDK out of this hot path. We
 * still surface Stripe's error message back to the admin so any
 * future surprise is visible in the UI, not lost in a console.
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

  // Stripe requires promotion-code strings to be 3..500 chars, alnum + `-`.
  if (!/^[A-Z0-9-]{3,500}$/.test(code)) {
    return NextResponse.json(
      { error: "Koda mora imeti vsaj 3 znake (A–Z, 0–9, −)" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Neveljaven znesek" }, { status: 400 });
  }
  if (type === "percent" && amount > 100) {
    return NextResponse.json({ error: "Odstotek ne sme presegati 100" }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  // ── 1) Coupon ─────────────────────────────────────────────────────────
  const couponForm = new URLSearchParams();
  couponForm.set("duration", "once");
  couponForm.set("name", code);
  if (type === "percent") {
    couponForm.set("percent_off", String(amount));
  } else {
    couponForm.set("amount_off", String(Math.round(amount * 100)));
    couponForm.set("currency", "eur");
  }

  const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
    method: "POST",
    headers,
    body: couponForm.toString(),
  });
  const couponJson = await couponRes.json().catch(() => null);
  if (!couponRes.ok || !couponJson?.id) {
    const msg = couponJson?.error?.message ?? `HTTP ${couponRes.status}`;
    console.error("[admin/discounts] coupon create failed:", couponJson);
    return NextResponse.json({ error: `Stripe coupon: ${String(msg).slice(0, 200)}` }, { status: 502 });
  }

  // ── 2) Promotion code (customer-facing string) ────────────────────────
  // Documented stable form: top-level `coupon` parameter. This is what
  // every Stripe API version since 2019 accepts.
  const promoForm = new URLSearchParams();
  promoForm.set("coupon", couponJson.id);
  promoForm.set("code", code);
  if (maxRedemptions && maxRedemptions > 0) {
    promoForm.set("max_redemptions", String(maxRedemptions));
  }
  if (expiresInDays && expiresInDays > 0) {
    const exp = Math.floor((Date.now() + expiresInDays * 86_400_000) / 1000);
    promoForm.set("expires_at", String(exp));
  }

  const promoRes = await fetch("https://api.stripe.com/v1/promotion_codes", {
    method: "POST",
    headers,
    body: promoForm.toString(),
  });
  const promoJson = await promoRes.json().catch(() => null);
  if (!promoRes.ok || !promoJson?.id) {
    const msg = promoJson?.error?.message ?? `HTTP ${promoRes.status}`;
    console.error("[admin/discounts] promo create failed:", promoJson);
    return NextResponse.json(
      { error: `Stripe promotion code: ${String(msg).slice(0, 200)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ id: promoJson.id, code: promoJson.code });
}
