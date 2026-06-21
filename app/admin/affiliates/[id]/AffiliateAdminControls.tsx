"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Affiliate } from "@/lib/db/schema";

export function AffiliateAdminControls({ affiliate }: { affiliate: Affiliate }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rate, setRate] = useState(affiliate.commissionRate);
  const [notes, setNotes] = useState(affiliate.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Napaka (${res.status})`);
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Napaka pri shranjevanju.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-bold text-[#0F1729]">Upravljanje</h2>

      <div className="flex flex-wrap gap-2">
        {affiliate.status !== "active" && (
          <button
            onClick={() => patch({ status: "active" }, "Odobri tega partnerja in pošlji welcome email?")}
            disabled={pending}
            className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold disabled:opacity-60"
          >
            ✅ Odobri
          </button>
        )}
        {affiliate.status !== "suspended" && (
          <button
            onClick={() => patch({ status: "suspended" }, "Ustavi tega partnerja?")}
            disabled={pending}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold disabled:opacity-60"
          >
            ⏸ Ustavi
          </button>
        )}
        {affiliate.status !== "rejected" && (
          <button
            onClick={() => patch({ status: "rejected" }, "Zavrni tega partnerja?")}
            disabled={pending}
            className="px-3.5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold disabled:opacity-60"
          >
            ✗ Zavrni
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Provizija (%)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl"
            />
            <button
              onClick={() => patch({ commissionRate: rate })}
              disabled={pending || rate === affiliate.commissionRate}
              className="px-3 py-2 rounded-xl bg-[#0F1729] text-white text-xs font-bold disabled:opacity-50"
            >
              Shrani
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Interne opombe (admin)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl"
            />
            <button
              onClick={() => patch({ notes })}
              disabled={pending || notes === (affiliate.notes ?? "")}
              className="px-3 py-2 rounded-xl bg-[#0F1729] text-white text-xs font-bold disabled:opacity-50"
            >
              Shrani
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
