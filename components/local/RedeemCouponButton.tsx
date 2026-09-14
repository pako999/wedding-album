"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RedeemCouponButton({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function redeem() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/local/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        const messages: Record<string, string> = {
          expired: "Kupon je potekel.",
          void: "Kupon je preklican.",
          coupon_not_found: "Kupon ni najden ali ne pripada vašemu lokalu.",
        };
        throw new Error(messages[data.error ?? ""] ?? "Kupona ni bilo mogoče unovčiti.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka pri unovčenju.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={redeem}
        className="w-full rounded-2xl bg-green-600 px-5 py-4 text-base font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Unovčujem…" : "✓ Unovči kupon"}
      </button>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
