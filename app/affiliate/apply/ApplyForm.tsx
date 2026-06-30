"use client";

import { useState } from "react";
import { affiliateTranslations, type AffiliateLang } from "@/lib/i18n/affiliate-translations";

const LOCALES = [
  { code: "sl", label: "Slovenščina" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "hr", label: "Hrvatski" },
  { code: "sr", label: "Srpski" },
  { code: "es", label: "Español" },
];

interface Props {
  lang: AffiliateLang;
}

export function ApplyForm({ lang }: Props) {
  const t = affiliateTranslations[lang].apply;
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    promotionPlan: "",
    bankIban: "",
    preferredLocale: lang,
    instagramUrl: "",
    facebookUrl: "",
    xUrl: "",
    tiktokUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-extrabold text-[#0F1729] mb-2">{t.successTitle}</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">{t.successBody}</p>
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
        setError(data.error ?? t.errorGeneric);
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError(t.errorGeneric);
      setSubmitting(false);
    }
  }

  const inputClass = "w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:border-[#FFC94D] focus:ring-1 focus:ring-[#FFC94D] transition-colors";
  const req = <span className="text-red-500">*</span>;

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.formName} {req}</label>
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
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.formEmail} {req}</label>
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
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.formWebsite}</label>
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
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.formPromotionPlan} {req}</label>
        <textarea
          required
          rows={5}
          placeholder={t.formPromotionPlaceholder}
          value={form.promotionPlan}
          onChange={(e) => setForm({ ...form, promotionPlan: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB", resize: "vertical" }}
        />
      </div>
      {/* Social media profiles (optional) — using urlSchema placeholders so
          the slot is self-explanatory regardless of language. */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1.5">{SOCIAL_HEADER[lang]}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Instagram</label>
            <input
              type="url"
              placeholder="https://instagram.com/..."
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              className={inputClass}
              style={{ borderColor: "#E5E7EB" }}
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Facebook</label>
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={form.facebookUrl}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              className={inputClass}
              style={{ borderColor: "#E5E7EB" }}
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">X (Twitter)</label>
            <input
              type="url"
              placeholder="https://x.com/..."
              value={form.xUrl}
              onChange={(e) => setForm({ ...form, xUrl: e.target.value })}
              className={inputClass}
              style={{ borderColor: "#E5E7EB" }}
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">TikTok</label>
            <input
              type="url"
              placeholder="https://tiktok.com/@..."
              value={form.tiktokUrl}
              onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
              className={inputClass}
              style={{ borderColor: "#E5E7EB" }}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.formIban}</label>
        <input
          type="text"
          placeholder="SI56 0000 0000 0000 000"
          value={form.bankIban}
          onChange={(e) => setForm({ ...form, bankIban: e.target.value })}
          className={inputClass}
          style={{ borderColor: "#E5E7EB" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.formLocale}</label>
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
        {submitting ? t.formSubmitting : t.formSubmit}
      </button>
    </form>
  );
}

// Not in the central translation registry yet, so spelled out per locale
// here. Keep them short — it's just a section header above the optional
// social profile inputs.
const SOCIAL_HEADER: Record<AffiliateLang, string> = {
  sl: "Profili na družbenih omrežjih (neobvezno)",
  hr: "Profili na društvenim mrežama (neobavezno)",
  sr: "Profili na društvenim mrežama (neobavezno)",
  de: "Social-Media-Profile (optional)",
  en: "Social media profiles (optional)",
  es: "Perfiles en redes sociales (opcional)",
};
