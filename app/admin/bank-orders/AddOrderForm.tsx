"use client";

import { useState } from "react";
import { addManualOrder } from "./actions";

const PLAN_PRICES: Record<string, number> = { basic: 39, plus: 49, premium: 79 };

export function AddOrderForm() {
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [looking, setLooking]     = useState(false);
  const [email, setEmail]         = useState("");
  const [billingName, setBillingName] = useState("");
  const [planId, setPlanId]       = useState("premium");
  const [hint, setHint]           = useState<string | null>(null);

  async function lookupAlbum(slug: string) {
    if (!slug.trim()) return;
    setLooking(true);
    setHint(null);
    try {
      const res = await fetch(`/api/admin/album-lookup?slug=${encodeURIComponent(slug.trim())}`);
      if (res.ok) {
        const data = await res.json() as { email: string | null; clerkName: string | null; coupleName: string; plan: string };
        if (data.email) setEmail(data.email);
        if (data.clerkName) setBillingName(data.clerkName);
        if (data.plan && data.plan !== "free") setPlanId(data.plan);
        setHint(`${data.coupleName}${data.email ? ` · ${data.email}` : " · email ni najden v Clerk"}`);
      } else {
        setHint("Galerija ni najdena");
      }
    } catch {
      setHint("Napaka pri iskanju");
    } finally {
      setLooking(false);
    }
  }

  function reset() {
    setOpen(false);
    setEmail("");
    setBillingName("");
    setPlanId("premium");
    setHint(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await addManualOrder(fd);
    setSaving(false);
    reset();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-[#0F1729] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2540] transition-colors"
      >
        + Dodaj ročno
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-[#0F1729]">Ročni vnos naročila</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">

        {/* Slug with lookup */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Slug galerije *</label>
          <div className="flex gap-2">
            <input
              name="albumSlug" required placeholder="ana-jt2k"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]"
              onBlur={(e) => lookupAlbum(e.target.value)}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                lookupAlbum(input.value);
              }}
              disabled={looking}
              className="px-3 py-2 text-xs font-semibold bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {looking ? "…" : "Poišči"}
            </button>
          </div>
          {hint && (
            <p className={`mt-1 text-xs ${hint.includes("ni najdena") || hint.includes("Napaka") ? "text-red-500" : "text-green-700 font-medium"}`}>
              {hint}
            </p>
          )}
        </div>

        {/* Email — pre-filled by lookup */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Email stranke *</label>
          <input
            name="email" type="email" required placeholder="stranka@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]"
          />
        </div>

        {/* Package */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Paket *</label>
          <select
            name="planId" required value={planId} onChange={(e) => setPlanId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]"
          >
            <option value="basic">Basic — 39€</option>
            <option value="plus">Plus — 49€</option>
            <option value="premium">Premium — 79€</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ime in priimek</label>
          <input name="billingName" placeholder="Ana Novak"
            value={billingName} onChange={(e) => setBillingName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Naziv podjetja (neobvezno)</label>
          <input name="billingCompanyName" placeholder="d.o.o. / s.p."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email za račun</label>
          <input name="billingEmail" type="email" placeholder="racuni@podjetje.si"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ulica in hišna številka</label>
          <input name="billingAddress" placeholder="Dunajska cesta 1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Poštna številka in kraj</label>
          <input name="billingCity" placeholder="1000 Ljubljana"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Davčna številka</label>
          <input name="billingTaxId" placeholder="SI12345678"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9820A]" />
        </div>

        <div className="col-span-2 flex gap-2 justify-end pt-1">
          <button type="button" onClick={reset}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            Prekliči
          </button>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-[#C9820A] text-white text-sm font-semibold rounded-lg hover:bg-[#b57008] disabled:opacity-50 transition-colors">
            {saving ? "Shranjujem…" : "Shrani"}
          </button>
        </div>
      </form>
    </div>
  );
}
