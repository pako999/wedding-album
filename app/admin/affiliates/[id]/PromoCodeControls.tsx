"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DiscountCode } from "@/lib/db/schema";

interface Props {
  affiliateId: string;
  initialPromo: DiscountCode | null;
}

export function PromoCodeControls({ affiliateId, initialPromo }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [promo, setPromo] = useState<DiscountCode | null>(initialPromo);
  const [editing, setEditing] = useState(!initialPromo);
  // Keep as strings so the user can freely edit (see commission-rate input bug fix).
  const [code, setCode] = useState(initialPromo?.code ?? "");
  const [pct, setPct] = useState(String(initialPromo?.percentOff ?? 20));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setError(null);
    const codeTrim = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,30}$/.test(codeTrim)) {
      setError("Koda mora vsebovati 3–30 znakov (A–Z, 0–9).");
      return;
    }
    const pctNum = Number(pct);
    if (!Number.isFinite(pctNum) || pctNum < 1 || pctNum > 100) {
      setError("Popust mora biti med 1 in 100 %.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/promo-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeTrim, percentOff: pctNum }),
      });
      const data = await res.json() as { promo?: DiscountCode; error?: string };
      if (!res.ok || !data.promo) {
        setError(data.error ?? "Napaka pri shranjevanju.");
        setBusy(false);
        return;
      }
      setPromo(data.promo);
      setEditing(false);
      setBusy(false);
      startTransition(() => router.refresh());
    } catch {
      setError("Napaka pri shranjevanju.");
      setBusy(false);
    }
  }

  async function toggleActive(active: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/promo-code`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: active }),
      });
      const data = await res.json() as { promo?: DiscountCode; error?: string };
      if (res.ok && data.promo) setPromo(data.promo);
      setBusy(false);
      startTransition(() => router.refresh());
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold text-[#0F1729]">🎁 Promo koda za stranke</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Koda, ki jo partner deli na družbenih omrežjih. Stranke prejmejo popust,
            partner pa še vedno dobi provizijo. Ob shranjevanju pošljemo partnerju email s podatki.
          </p>
        </div>
      </div>

      {!editing && promo ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <code className="px-3 py-2 rounded-xl font-mono font-extrabold text-[#0F1729] bg-[#FFF9EC] border border-[#FFC94D]/40 text-sm tracking-wider">
              {promo.code}
            </code>
            <span className="text-sm font-bold text-green-700">−{promo.percentOff}%</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${promo.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
              {promo.isActive ? "Aktivna" : "Deaktivirana"}
            </span>
            <span className="text-xs text-gray-400">
              Uporabljena {promo.usedCount}×
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setEditing(true)}
              disabled={busy}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 disabled:opacity-60"
            >
              Uredi
            </button>
            <button
              onClick={() => toggleActive(!promo.isActive)}
              disabled={busy}
              className={`px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-60 ${promo.isActive ? "bg-orange-100 hover:bg-orange-200 text-orange-700" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
            >
              {promo.isActive ? "Deaktiviraj" : "Aktiviraj"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Koda (npr. PATRIK20)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="PATRIK20"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl font-mono uppercase tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Popust (%)</label>
              <input
                type="text"
                inputMode="numeric"
                value={pct}
                onChange={(e) => setPct(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="20"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-[#0F1729] text-white text-xs font-bold disabled:opacity-60"
            >
              {busy ? "Shranjujem…" : promo ? "Shrani spremembe" : "Ustvari kodo + pošlji email"}
            </button>
            {promo && (
              <button
                onClick={() => { setEditing(false); setCode(promo.code); setPct(String(promo.percentOff)); }}
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold disabled:opacity-60"
              >
                Prekliči
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
