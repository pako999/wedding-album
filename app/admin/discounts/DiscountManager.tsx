"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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

interface Props {
  initialCodes: PromotionCode[];
  stripeConfigured: boolean;
}

export function DiscountManager({ initialCodes, stripeConfigured }: Props) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // create form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [amount, setAmount] = useState<number>(10);
  const [maxRedemptions, setMaxRedemptions] = useState<number | "">("");
  const [expiresInDays, setExpiresInDays] = useState<number | "">("");

  const create = () => {
    setError(null);
    startTransition(async () => {
      const payload = {
        code: code.trim().toUpperCase(),
        type: discountType,
        amount,
        maxRedemptions: maxRedemptions === "" ? null : Number(maxRedemptions),
        expiresInDays: expiresInDays === "" ? null : Number(expiresInDays),
      };
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Napaka" }));
        setError(msg || "Napaka pri ustvarjanju");
        return;
      }
      setCode("");
      router.refresh();
    });
  };

  const disable = (id: string) => {
    if (!confirm("Onemogočiti to kodo? Stripe je trajno deaktivira.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/discounts/${id}/disable`, { method: "POST" });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Napaka" }));
        setError(msg || "Napaka pri onemogočanju");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Create form */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-[#0F1729] mb-4">Ustvari novo kodo</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Koda</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="POROKA20"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg uppercase tracking-wide focus:outline-none focus:border-[#FFC94D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tip</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "amount")}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FFC94D]"
            >
              <option value="percent">% popust</option>
              <option value="amount">€ popust</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {discountType === "percent" ? "Odstotek" : "Znesek"}
            </label>
            <input
              type="number"
              min={1}
              max={discountType === "percent" ? 100 : 1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FFC94D]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max unovčitev</label>
            <input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="∞"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FFC94D]"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Veljavnost (dni)</label>
            <input
              type="number"
              min={1}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="brez poteka"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FFC94D]"
            />
          </div>
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={create}
              disabled={busy || !stripeConfigured || code.length < 3}
              className="w-full px-4 py-2 bg-[#FFC94D] text-[#0F1729] font-semibold text-sm rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {busy ? "Ustvarjam…" : "Ustvari kodo"}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        <p className="text-xs text-gray-400 mt-3">
          Stripe ustvari kupon + promotion code. Koda velja za vse pakete (Basic / Plus / Premium).
        </p>
      </section>

      {/* List */}
      <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
              <th className="px-4 py-3 font-medium">Koda</th>
              <th className="px-4 py-3 font-medium">Popust</th>
              <th className="px-4 py-3 font-medium">Unovčitve</th>
              <th className="px-4 py-3 font-medium">Poteče</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {initialCodes.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-mono font-semibold text-[#0F1729]">{c.code}</td>
                <td className="px-4 py-3 text-gray-700">
                  {c.coupon.percent_off
                    ? `${c.coupon.percent_off}%`
                    : c.coupon.amount_off
                      ? `${(c.coupon.amount_off / 100).toFixed(0)}${(c.coupon.currency || "eur").toUpperCase() === "EUR" ? "€" : c.coupon.currency}`
                      : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {c.times_redeemed} / {c.max_redemptions ?? "∞"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {c.expires_at ? new Date(c.expires_at * 1000).toLocaleDateString("sl-SI") : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded ${
                    c.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.active ? "aktivno" : "neaktivno"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {c.active && (
                    <button
                      onClick={() => disable(c.id)}
                      disabled={busy}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40"
                    >
                      Onemogoči
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {initialCodes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  Še ni kod. Ustvari prvo zgoraj.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
