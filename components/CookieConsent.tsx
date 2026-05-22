"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import type { LangCode } from "@/components/LanguageSwitcher";

/**
 * Google Consent Mode v2 + GDPR cookie banner.
 *
 * Why this exists:
 * - Google Ads + Google Analytics require Consent Mode v2 for EEA
 *   traffic since March 2024. Without it, tags fire with default-denied
 *   consent and conversion / remarketing data drops out.
 * - GDPR/PECR require explicit opt-in for non-strictly-necessary cookies.
 *   Visitors must be able to Accept, Reject, or customise their choice,
 *   and revisit their choice later.
 *
 * What we ship:
 * - A `gtag('consent', 'default', …)` call inlined as `beforeInteractive`
 *   so it runs BEFORE any Google tag could ever load. All non-necessary
 *   categories default to 'denied'. `security_storage` defaults to
 *   'granted' (strictly necessary by Google's classification).
 * - The banner reads/writes a versioned JSON consent record in
 *   localStorage. On subsequent visits the banner stays hidden but we
 *   re-issue the same `gtag('consent', 'update', …)` so any Google tag
 *   sees the saved choice immediately.
 * - Three primary actions: Accept all, Reject all, Customise (per-
 *   category toggles).
 * - A global `window.openCookieConsent()` so footer "Cookie settings"
 *   links can re-open the banner.
 *
 * What's NOT included here (deferred until you actually wire up GA/Ads):
 * - The Google Tag (gtag.js or GTM) script itself. Once you set up GA4
 *   or Google Ads, drop the tag in app/layout.tsx and it'll
 *   automatically pick up the consent signals from this component.
 * - IAB TCF — Guestcam isn't running an ad auction, so the simple
 *   Google Consent Mode integration is enough.
 */

type ConsentCategory =
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "analytics_storage"
  | "functionality_storage"
  | "personalization_storage"
  | "security_storage";

type ConsentValue = "granted" | "denied";
interface ConsentRecord {
  _v: 2;
  timestamp: number;
  ad_storage:               ConsentValue;
  ad_user_data:             ConsentValue;
  ad_personalization:       ConsentValue;
  analytics_storage:        ConsentValue;
  functionality_storage:    ConsentValue;
  personalization_storage:  ConsentValue;
  security_storage:         ConsentValue;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    openCookieConsent?: () => void;
  }
}

const COOKIE_KEY = "guestcam_consent_v2";

const DEFAULT_DENIED: ConsentRecord = {
  _v: 2,
  timestamp: 0,
  ad_storage:               "denied",
  ad_user_data:             "denied",
  ad_personalization:       "denied",
  analytics_storage:        "denied",
  functionality_storage:    "denied",
  personalization_storage:  "denied",
  security_storage:         "granted",
};

const ALL_GRANTED = (now: number): ConsentRecord => ({
  _v: 2,
  timestamp: now,
  ad_storage:               "granted",
  ad_user_data:             "granted",
  ad_personalization:       "granted",
  analytics_storage:        "granted",
  functionality_storage:    "granted",
  personalization_storage:  "granted",
  security_storage:         "granted",
});

// ─── Localised copy ─────────────────────────────────────────────────────────

interface Copy {
  title: string;
  body: string;
  acceptAll: string;
  rejectAll: string;
  customise: string;
  save: string;
  policyLink: string;
  required: string;
  categories: {
    necessary:       { name: string; desc: string };
    analytics:       { name: string; desc: string };
    ads:             { name: string; desc: string };
    personalization: { name: string; desc: string };
  };
}

const COPY: Record<LangCode, Copy> = {
  sl: {
    title: "Piškotki in zasebnost",
    body: "Uporabljamo piškotke za delovanje strani in — z vašim soglasjem — za analitiko in oglaševanje. Lahko sprejmete vse, zavrnete vse ali izberete posamično.",
    acceptAll: "Sprejmi vse", rejectAll: "Zavrni vse", customise: "Prilagodi",
    save: "Shrani izbiro", policyLink: "Več v politiki piškotkov", required: "Obvezno",
    categories: {
      necessary:       { name: "Nujno potrebni",  desc: "Za prijavo in osnovno delovanje. Vedno aktivni." },
      analytics:       { name: "Analitika",       desc: "Anonimna statistika obiska (Google Analytics)." },
      ads:             { name: "Oglaševanje",     desc: "Personalizirani Google Ads in merjenje konverzij." },
      personalization: { name: "Personalizacija", desc: "Zapomni si vaše nastavitve (jezik, prikaz)." },
    },
  },
  hr: {
    title: "Kolačići i privatnost",
    body: "Koristimo kolačiće za rad stranice i — uz vaš pristanak — za analitiku i oglašavanje. Možete prihvatiti sve, odbiti sve ili odabrati pojedinačno.",
    acceptAll: "Prihvati sve", rejectAll: "Odbij sve", customise: "Prilagodi",
    save: "Spremi izbor", policyLink: "Više u politici kolačića", required: "Obvezno",
    categories: {
      necessary:       { name: "Nužno potrebni",  desc: "Za prijavu i osnovni rad. Uvijek aktivni." },
      analytics:       { name: "Analitika",       desc: "Anonimna statistika posjeta (Google Analytics)." },
      ads:             { name: "Oglašavanje",     desc: "Personalizirani Google Ads i mjerenje konverzija." },
      personalization: { name: "Personalizacija", desc: "Zapamti vaše postavke (jezik, prikaz)." },
    },
  },
  sr: {
    title: "Kolačići i privatnost",
    body: "Koristimo kolačiće za rad sajta i — uz vašu saglasnost — za analitiku i reklamiranje. Možete prihvatiti sve, odbiti sve ili izabrati pojedinačno.",
    acceptAll: "Prihvati sve", rejectAll: "Odbij sve", customise: "Prilagodi",
    save: "Sačuvaj izbor", policyLink: "Više u politici kolačića", required: "Obavezno",
    categories: {
      necessary:       { name: "Neophodni",       desc: "Za prijavu i osnovni rad. Uvek aktivni." },
      analytics:       { name: "Analitika",       desc: "Anonimna statistika poseta (Google Analytics)." },
      ads:             { name: "Reklamiranje",    desc: "Personalizovani Google Ads i merenje konverzija." },
      personalization: { name: "Personalizacija", desc: "Zapamti vaša podešavanja (jezik, prikaz)." },
    },
  },
  de: {
    title: "Cookies und Datenschutz",
    body: "Wir verwenden Cookies für die Funktion der Seite und — mit Ihrer Einwilligung — für Analyse und Werbung. Sie können alle akzeptieren, alle ablehnen oder einzeln auswählen.",
    acceptAll: "Alle akzeptieren", rejectAll: "Alle ablehnen", customise: "Anpassen",
    save: "Auswahl speichern", policyLink: "Mehr in der Cookie-Richtlinie", required: "Erforderlich",
    categories: {
      necessary:       { name: "Notwendig",         desc: "Für Login und Grundfunktionen. Immer aktiv." },
      analytics:       { name: "Analyse",           desc: "Anonyme Besuchsstatistik (Google Analytics)." },
      ads:             { name: "Werbung",           desc: "Personalisierte Google Ads und Conversion-Messung." },
      personalization: { name: "Personalisierung",  desc: "Merkt sich Ihre Einstellungen (Sprache, Anzeige)." },
    },
  },
  en: {
    title: "Cookies and privacy",
    body: "We use cookies to run the site and — with your consent — for analytics and advertising. Accept all, reject all, or choose individually.",
    acceptAll: "Accept all", rejectAll: "Reject all", customise: "Customise",
    save: "Save choices", policyLink: "More in the cookie policy", required: "Required",
    categories: {
      necessary:       { name: "Strictly necessary", desc: "Sign-in and core functionality. Always on." },
      analytics:       { name: "Analytics",          desc: "Anonymous visitor statistics (Google Analytics)." },
      ads:             { name: "Advertising",        desc: "Personalised Google Ads and conversion measurement." },
      personalization: { name: "Personalisation",    desc: "Remember your preferences (language, display)." },
    },
  },
  es: {
    title: "Cookies y privacidad",
    body: "Utilizamos cookies para que el sitio funcione y — con tu consentimiento — para analítica y publicidad. Acepta todas, rechaza todas o elige individualmente.",
    acceptAll: "Aceptar todas", rejectAll: "Rechazar todas", customise: "Personalizar",
    save: "Guardar elección", policyLink: "Más en la política de cookies", required: "Obligatorio",
    categories: {
      necessary:       { name: "Estrictamente necesarias", desc: "Inicio de sesión y funcionamiento. Siempre activas." },
      analytics:       { name: "Analítica",                desc: "Estadísticas anónimas de visitas (Google Analytics)." },
      ads:             { name: "Publicidad",               desc: "Anuncios personalizados de Google Ads y medición de conversiones." },
      personalization: { name: "Personalización",          desc: "Recuerda tus preferencias (idioma, presentación)." },
    },
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function readSaved(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed._v !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(record: ConsentRecord) {
  try { localStorage.setItem(COOKIE_KEY, JSON.stringify(record)); } catch {}
}

function gtagConsentUpdate(record: ConsentRecord) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer!.push(arguments);
    } as typeof window.gtag;
  }
  window.gtag("consent", "update", {
    ad_storage:              record.ad_storage,
    ad_user_data:            record.ad_user_data,
    ad_personalization:      record.ad_personalization,
    analytics_storage:       record.analytics_storage,
    functionality_storage:   record.functionality_storage,
    personalization_storage: record.personalization_storage,
    security_storage:        record.security_storage,
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CookieConsent({ lang }: { lang: LangCode }) {
  const t = COPY[lang] ?? COPY.en;
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [choices, setChoices] = useState<ConsentRecord>(DEFAULT_DENIED);

  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setChoices(saved);
      gtagConsentUpdate(saved);
    } else {
      setOpen(true);
    }
    window.openCookieConsent = () => {
      const cur = readSaved();
      if (cur) setChoices(cur);
      setShowDetails(true);
      setOpen(true);
    };
    return () => {
      delete window.openCookieConsent;
    };
  }, []);

  const decide = (record: ConsentRecord) => {
    persist(record);
    gtagConsentUpdate(record);
    setChoices(record);
    setOpen(false);
    setShowDetails(false);
  };

  const acceptAll = () => decide(ALL_GRANTED(Date.now()));
  const rejectAll = () => decide({ ...DEFAULT_DENIED, timestamp: Date.now() });
  const saveCustom = () => decide({ ...choices, timestamp: Date.now() });

  return (
    <>
      {/* Consent Mode v2 default — runs BEFORE any Google tag.
          beforeInteractive guarantees this is in <head> before gtag.js
          could load. wait_for_update=500ms lets the saved-choice
          update arrive before Google sends pings. */}
      <Script id="consent-mode-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'denied',
            personalization_storage: 'denied',
            security_storage: 'granted',
            wait_for_update: 500
          });
        `}
      </Script>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-[100] bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-5"
        >
          <h2 className="font-serif text-base font-bold text-[#0F1729] mb-2">{t.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">{t.body}</p>

          {showDetails && (
            <div className="mb-4 space-y-2 max-h-64 overflow-y-auto pr-1">
              <CategoryRow
                name={t.categories.necessary.name}
                desc={t.categories.necessary.desc}
                checked
                disabled
                badge={t.required}
              />
              <CategoryRow
                name={t.categories.analytics.name}
                desc={t.categories.analytics.desc}
                checked={choices.analytics_storage === "granted"}
                onChange={(on) =>
                  setChoices((c) => ({ ...c, analytics_storage: on ? "granted" : "denied" }))
                }
              />
              <CategoryRow
                name={t.categories.ads.name}
                desc={t.categories.ads.desc}
                checked={
                  choices.ad_storage === "granted" &&
                  choices.ad_user_data === "granted" &&
                  choices.ad_personalization === "granted"
                }
                onChange={(on) =>
                  setChoices((c) => ({
                    ...c,
                    ad_storage:         on ? "granted" : "denied",
                    ad_user_data:       on ? "granted" : "denied",
                    ad_personalization: on ? "granted" : "denied",
                  }))
                }
              />
              <CategoryRow
                name={t.categories.personalization.name}
                desc={t.categories.personalization.desc}
                checked={
                  choices.personalization_storage === "granted" &&
                  choices.functionality_storage   === "granted"
                }
                onChange={(on) =>
                  setChoices((c) => ({
                    ...c,
                    personalization_storage: on ? "granted" : "denied",
                    functionality_storage:   on ? "granted" : "denied",
                  }))
                }
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center justify-end">
            {!showDetails && (
              <button
                onClick={() => setShowDetails(true)}
                className="text-xs font-semibold text-gray-600 hover:text-[#0F1729] underline mr-auto"
              >
                {t.customise}
              </button>
            )}
            <button
              onClick={rejectAll}
              className="px-3 py-2 text-xs font-semibold text-[#0F1729] border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {t.rejectAll}
            </button>
            {showDetails ? (
              <button
                onClick={saveCustom}
                className="px-4 py-2 text-xs font-bold rounded-lg text-[#0F1729]"
                style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)" }}
              >
                {t.save}
              </button>
            ) : (
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-xs font-bold rounded-lg text-[#0F1729]"
                style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)" }}
              >
                {t.acceptAll}
              </button>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-3">
            <a href={lang === "sl" ? "/cookies" : `/${lang}/cookies`} className="hover:text-[#C9820A]">
              {t.policyLink} →
            </a>
          </p>
        </div>
      )}
    </>
  );
}

function CategoryRow({
  name,
  desc,
  checked,
  disabled,
  badge,
  onChange,
}: {
  name: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  badge?: string;
  onChange?: (on: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0F1729]">
          {name}
          {badge && (
            <span className="ml-2 inline-block text-[9px] uppercase tracking-wider font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
              {badge}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={name}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-[#FFC94D]" : "bg-gray-200"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
