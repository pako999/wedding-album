"use client";

import { useState } from "react";
import type { LangCode } from "@/components/LanguageSwitcher";

const DISCOUNT_CODE = "WELCOME15";
const STORAGE_KEY = "gc_banner_closed";

const COPY: Record<LangCode, { text: string; cta: string; copied: string }> = {
  sl: {
    text: "🎉 Samo zdaj: 15 % popust na prvi paket — koda",
    cta: "Vzamem popust →",
    copied: "Kopirano ✓",
  },
  hr: {
    text: "🎉 Samo sada: 15 % popusta na prvi paket — kod",
    cta: "Uzimam popust →",
    copied: "Kopirano ✓",
  },
  sr: {
    text: "🎉 Samo sada: 15 % popusta na prvi paket — kod",
    cta: "Uzimam popust →",
    copied: "Kopirano ✓",
  },
  de: {
    text: "🎉 Nur jetzt: 15 % Rabatt auf das erste Paket — Code",
    cta: "Rabatt sichern →",
    copied: "Kopiert ✓",
  },
  en: {
    text: "🎉 Only now: 15% off your first plan — code",
    cta: "Get discount →",
    copied: "Copied ✓",
  },
  es: {
    text: "🎉 Solo ahora: 15 % en tu primer plan — código",
    cta: "Quiero el descuento →",
    copied: "¡Copiado ✓",
  },
};

export function DiscountBanner({ lang }: { lang: LangCode }) {
  const t = COPY[lang] ?? COPY.en;
  const [closed, setClosed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(STORAGE_KEY);
  });
  const [copied, setCopied] = useState(false);

  if (closed) return null;

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setClosed(true);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#0F1729] relative"
      style={{ background: "linear-gradient(90deg, #FFD966 0%, #FFC94D 60%, #F0B429 100%)" }}
    >
      {/* Text + code */}
      <span className="flex items-center gap-2 flex-wrap justify-center">
        <span>{t.text}</span>
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 bg-[#0F1729] text-[#FFC94D] font-mono font-bold text-xs px-2.5 py-1 rounded-lg hover:bg-[#1a2540] transition-colors"
        >
          {DISCOUNT_CODE}
          <span className="text-[10px] font-sans font-semibold opacity-70">
            {copied ? t.copied : "copy"}
          </span>
        </button>
      </span>

      {/* CTA */}
      <a
        href="/dashboard/new"
        className="hidden sm:inline-flex items-center text-xs font-bold underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap"
      >
        {t.cta}
      </a>

      {/* Close */}
      <button
        onClick={close}
        aria-label="Close"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors text-base leading-none"
      >
        ×
      </button>
    </div>
  );
}
