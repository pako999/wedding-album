import type { Metadata } from "next";
import { ApplyForm } from "./ApplyForm";
import { affiliateTranslations, type AffiliateLang } from "@/lib/i18n/affiliate-translations";

/** Shared renderer used by /affiliate/apply (SL master) and the 5
 *  localized variants (/{lang}/affiliate/apply). Pass the lang in;
 *  this component pulls every string from the central registry. */
export function AffiliateApplyView({ lang }: { lang: AffiliateLang }) {
  const t = affiliateTranslations[lang].apply;

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9820A] mb-3">
            {t.badge}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F1729] mb-3">
            {t.headingLine1}<br />
            {t.headingLine2}
          </h1>
          <p className="text-base text-gray-500 max-w-lg mx-auto">
            {t.subheading}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {t.benefits.map((b) => (
            <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-2xl mb-2">{BENEFIT_ICONS[b.title.split(" ")[0]] ?? "✨"}</div>
              <p className="font-bold text-[#0F1729] text-sm mb-1">{b.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-[#0F1729] mb-1">{t.formTitle}</h2>
          <p className="text-sm text-gray-500 mb-6">{t.formSubtitle}</p>
          <ApplyForm lang={lang} />
        </div>
      </div>
    </div>
  );
}

export function affiliateApplyMetadata(lang: AffiliateLang): Metadata {
  const t = affiliateTranslations[lang].apply;
  const localizedPath = lang === "sl" ? "/affiliate/apply" : `/${lang}/affiliate/apply`;
  return {
    title: t.pageTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `https://www.guestcam.si${localizedPath}`,
      languages: {
        sl: "https://www.guestcam.si/affiliate/apply",
        hr: "https://www.guestcam.si/hr/affiliate/apply",
        sr: "https://www.guestcam.si/sr/affiliate/apply",
        de: "https://www.guestcam.si/de/affiliate/apply",
        en: "https://www.guestcam.si/en/affiliate/apply",
        es: "https://www.guestcam.si/es/affiliate/apply",
        "x-default": "https://www.guestcam.si/affiliate/apply",
      },
    },
    robots: { index: true, follow: true },
  };
}

// Picks an emoji icon for each benefit based on a leading-word lookup.
// Avoids touching the translation registry shape — registry only carries
// title+body strings, and the icon is decorative.
const BENEFIT_ICONS: Record<string, string> = {
  "20%":     "💰",
  "20 %":    "💰",
  "60-dnevni":  "🍪",
  "60-day":     "🍪",
  "60-Tage":    "🍪",
  "60-dnevni…": "🍪",
  "Cookie":    "🍪",
  "Hitro":     "💳",
  "Fast":      "💳",
  "Schnelle":  "💳",
  "Brzo":      "💳",
  "Brza":      "💳",
  "Pagos":     "💳",
  "Lastna":    "📊",
  "Own":       "📊",
  "Eigenes":   "📊",
  "Vlastiti":  "📊",
  "Tvoj":      "📊",
  "Vaš":       "📊",
  "Panel":     "📊",
};
