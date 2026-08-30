"use client";

import { SITE_URL } from "@/lib/urls";
import { SERBIAN_GUESTCAM_ORIGIN } from "@/lib/site-domains";
import { useState, useEffect, useRef } from "react";

export type LangCode = "sl" | "hr" | "sr" | "en" | "de" | "es";

const LANG_META: Record<LangCode, { flag: string; label: string }> = {
  sl: { flag: "🇸🇮", label: "Slovenščina" },
  hr: { flag: "🇭🇷", label: "Hrvatski" },
  sr: { flag: "🇷🇸", label: "Srpski" },
  en: { flag: "🇬🇧", label: "English" },
  de: { flag: "🇩🇪", label: "Deutsch" },
  es: { flag: "🇪🇸", label: "Español" },
};

const ORDER: LangCode[] = ["sl", "hr", "sr", "en", "de", "es"];

interface Props {
  current: LangCode;
  languages: Partial<Record<LangCode, string>>;
  ariaLabel?: string;
}

export function LanguageSwitcher({ current, languages, ariaLabel }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const meta = LANG_META[current];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel ?? "Change language"}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
      >
        <span className="text-base leading-none">{meta.flag}</span>
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">{current}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[200px] z-50">
          {ORDER.map((lang) => {
            const url = languages[lang];
            if (!url) return null;
            const isCurrent = lang === current;
            return (
              <a
                key={lang}
                href={url}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2 text-sm transition-colors ${isCurrent ? "font-semibold text-[#0F1729] bg-[#FFF9EC]" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span className="text-base leading-none">{LANG_META[lang].flag}</span>
                <span>{LANG_META[lang].label}</span>
                {isCurrent && (
                  <svg className="w-3.5 h-3.5 ml-auto text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const HOME_HREFLANG: Record<LangCode, string> = {
  sl: `${SITE_URL}/`,
  hr: `${SITE_URL}/hr`,
  sr: `${SERBIAN_GUESTCAM_ORIGIN}/`,
  de: `${SITE_URL}/de`,
  en: `${SITE_URL}/en`,
  es: `${SITE_URL}/es`,
};

export const BLOG_HREFLANG: Record<LangCode, string> = {
  sl: `${SITE_URL}/blog`,
  hr: `${SITE_URL}/hr/blog`,
  sr: `${SERBIAN_GUESTCAM_ORIGIN}/sr/blog`,
  de: `${SITE_URL}/de/blog`,
  en: `${SITE_URL}/en/blog`,
  es: `${SITE_URL}/es/blog`,
};

export const GUIDE_HREFLANG: Record<LangCode, string> = {
  sl: `${SITE_URL}/sl/qr-koda-poroka`,
  hr: `${SITE_URL}/hr/qr-kod-vjencanje`,
  sr: `${SERBIAN_GUESTCAM_ORIGIN}/sr/qr-kod-vencanje`,
  de: `${SITE_URL}/de/hochzeitsfotos-sammeln`,
  en: `${SITE_URL}/en/wedding-photo-sharing`,
  es: `${SITE_URL}/es/fotos-boda-qr`,
};

export const ALTERNATIVES_HREFLANG: Record<LangCode, string> = {
  sl: `${SITE_URL}/sl/alternative-aplikacije`,
  hr: `${SITE_URL}/hr/alternativne-aplikacije`,
  sr: `${SERBIAN_GUESTCAM_ORIGIN}/sr/alternativne-aplikacije`,
  de: `${SITE_URL}/de/alternativen`,
  en: `${SITE_URL}/en/alternatives`,
  es: `${SITE_URL}/es/alternativas`,
};
