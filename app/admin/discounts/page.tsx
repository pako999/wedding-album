import { DiscountManager, type DiscountRow } from "./DiscountManager";
import { listDiscounts, paddleConfigured } from "@/lib/paddle";

export const dynamic = "force-dynamic";

async function safeList(): Promise<DiscountRow[]> {
  if (!paddleConfigured()) return [];
  try {
    const discounts = await listDiscounts(50);
    return discounts.map((d) => ({
      id: d.id,
      code: d.code ?? "—",
      active: d.status === "active",
      type: d.type === "percentage" ? "percent" : "amount",
      amount: Number(d.amount),
      currency: d.currency_code ?? "EUR",
      maxRedemptions: d.usage_limit ?? null,
      timesUsed: d.times_used ?? 0,
      expiresAt: d.expires_at ?? null,
    }));
  } catch (err) {
    console.error("[admin discounts] paddle list failed:", err);
    return [];
  }
}

export default async function AdminDiscounts() {
  const codes = await safeList();
  const configured = paddleConfigured();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[#0F1729]">Kode za popust</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paddle popusti — gostje jih vnesejo med plačilom v Paddle checkoutu.
        </p>
      </header>

      {!configured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>PADDLE_API_KEY ni nastavljen.</strong> Brez tega ne morem brati ali ustvariti kod.
        </div>
      )}

      <DiscountManager initialCodes={codes} configured={configured} />
    </div>
  );
}
