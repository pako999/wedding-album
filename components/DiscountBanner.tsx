"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // Language comes from the PATH, not the `lang` prop.
  //
  // The root layout derives that prop from request headers, which don't
  // exist while a route is statically prerendered — so every localized
  // static page (/es, /en, /de/blog …) fell back to "sl" and rendered
  // this banner in Slovenian regardless of the page around it. The
  // pathname is correct under both static and dynamic rendering.
  // COPY is keyed by exactly the supported languages, so membership in
  // it doubles as the validity check; anything else (/blog, /contact —
  // the Slovenian routes) falls back to the prop.
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  const effectiveLang: LangCode = (seg in COPY ? seg : lang) as LangCode;
  const t = COPY[effectiveLang] ?? COPY.en;
  const [closed, setClosed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(STORAGE_KEY);
  });
  const [copied, setCopied] = useState(false);

  // Live path check — the root layout doesn't re-render on client-side
  // navigation, so this banner can persist onto the checkout/dashboard.
  // Hide it there: a customer on the upgrade page is already buying.
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    /\/affiliate(?:\/|$)/.test(pathname)
  ) return null;

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
      <Link
        href="/dashboard/new"
        className="hidden sm:inline-flex items-center text-xs font-bold underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap"
      >
        {t.cta}
      </Link>

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
