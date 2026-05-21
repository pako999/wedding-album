import { DiscountManager } from "./DiscountManager";

export const dynamic = "force-dynamic";

interface PromotionCode {
  id: string;
  code: string;
  active: boolean;
  coupon: {
    id: string;
    percent_off: number | null;
    amount_off: number | null;
    currency: string | null;
    duration: string;
    name: string | null;
  };
  max_redemptions: number | null;
  times_redeemed: number;
  expires_at: number | null;
}

async function listPromotionCodes(): Promise<PromotionCode[]> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return [];
  const res = await fetch("https://api.stripe.com/v1/promotion_codes?limit=50&expand[]=data.coupon", {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export default async function AdminDiscounts() {
  const codes = await listPromotionCodes();
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Kode za popust</h1>
        <p className="text-sm text-gray-500 mt-1">
          Stripe promotion codes — gostje jih vnesejo med plačilom v Stripe Checkout.
        </p>
      </header>

      {!stripeConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>STRIPE_SECRET_KEY ni nastavljen.</strong> Brez tega ne morem brati ali ustvariti kod.
        </div>
      )}

      <DiscountManager initialCodes={codes} stripeConfigured={stripeConfigured} />
    </div>
  );
}
