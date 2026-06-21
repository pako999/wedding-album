"use client";

import { useState } from "react";

const LOCALES = [
  { code: "sl", label: "Slovenščina" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "hr", label: "Hrvatski" },
  { code: "sr", label: "Srpski" },
  { code: "es", label: "Español" },
];

export function ApplyForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    promotionPlan: "",
    paypalEmail: "",
    preferredLocale: "sl",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-extrabold text-[#0F1729] mb-2">Prijava prejeta!</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Hvala za prijavo. Pregledali jo bomo in vam odgovorili v 2 delovnih dneh na vaš e-poštni naslov.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/affiliate/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Prišlo je do napake.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Prišlo je do napake. Prosimo, poskusite znova.");
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#FFC94D] focus:ring-1 focus:ring-[#FFC94D] transition-colors";

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ime in priimek <span className="text-red-500">*</span></label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-poštni naslov <span className="text-red-500">*</span></label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vaša spletna stran (neobvezno)</label>
        <input
          type="url"
          placeholder="https://..."
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kako nameravate promovirati GuestCam? <span className="text-red-500">*</span></label>
        <textarea
          required
          rows={5}
          placeholder="Opišite vašo publiko, kanale (blog, Instagram, YouTube...) in strategijo promocije."
          value={form.promotionPlan}
          onChange={(e) => setForm({ ...form, promotionPlan: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB", resize: "vertical" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">PayPal e-pošta za izplačila (neobvezno)</label>
        <input
          type="email"
          value={form.paypalEmail}
          onChange={(e) => setForm({ ...form, paypalEmail: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jezik za obvestila</label>
        <select
          value={form.preferredLocale}
          onChange={(e) => setForm({ ...form, preferredLocale: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB" }}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: "#FFC94D", color: "#0F1729" }}
      >
        {submitting ? "Pošiljam…" : "Pošlji prijavo"}
      </button>
    </form>
  );
}
