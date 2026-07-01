"use client";

import Link from "next/link";
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
  /** The language of the current page. Highlighted in the menu. */
  current: LangCode;
  /** Map of lang code → absolute or relative URL for that language's equivalent of the page. */
  languages: Partial<Record<LangCode, string>>;
  /** Optional accessible label. */
  ariaLabel?: string;
}

/**
 * Compact dropdown language switcher with flag emojis. Click-outside and
 * Escape close the menu. Use in any site header by passing the current
 * language and a map of language → URL (typically your hreflang map).
 */
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
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
          {current}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[200px] z-50"
        >
          {ORDER.map((lang) => {
            const url = languages[lang];
            if (!url) return null;
            const isCurrent = lang === current;
            return (
              <Link
                key={lang}
                href={url}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2 text-sm transition-colors ${
                  isCurrent
                    ? "font-semibold text-[#0F1729] bg-[#FFF9EC]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="text-base leading-none">{LANG_META[lang].flag}</span>
                <span>{LANG_META[lang].label}</span>
                {isCurrent && (
                  <svg
                    className="w-3.5 h-3.5 ml-auto text-[#C9820A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Per-language homepage URLs. The Slovenian homepage lives at `/`;
 * every other language has its own minimal landing page at `/<lang>`.
 */
export const HOME_HREFLANG: Record<LangCode, string> = {
  sl: "https://www.guestcam.si/",
  hr: "https://www.guestcam.si/hr",
  sr: "https://www.guestcam.si/sr",
  de: "https://www.guestcam.si/de",
  en: "https://www.guestcam.si/en",
  es: "https://www.guestcam.si/es",
};

/**
 * Canonical hreflang map for the six wedding-guide landing pages.
 * Exported so guide pages and the homepage can share one source of truth.
 */
export const GUIDE_HREFLANG: Record<LangCode, string> = {
  sl: "https://www.guestcam.si/sl/qr-koda-poroka",
  hr: "https://www.guestcam.si/hr/qr-kod-vjencanje",
  sr: "https://www.guestcam.si/sr/qr-kod-vencanje",
  de: "https://www.guestcam.si/de/hochzeitsfotos-sammeln",
  en: "https://www.guestcam.si/en/wedding-photo-sharing",
  es: "https://www.guestcam.si/es/fotos-boda-qr",
};

/** Hreflang map for the "alternatives / comparison" landing pages. */
export const ALTERNATIVES_HREFLANG: Record<LangCode, string> = {
  sl: "https://www.guestcam.si/sl/alternative-aplikacije",
  hr: "https://www.guestcam.si/hr/alternativne-aplikacije",
  sr: "https://www.guestcam.si/sr/alternativne-aplikacije",
  de: "https://www.guestcam.si/de/alternativen",
  en: "https://www.guestcam.si/en/alternatives",
  es: "https://www.guestcam.si/es/alternativas",
};
