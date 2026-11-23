"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { LangCode } from "@/components/LanguageSwitcher";
import { localizedAccountPath } from "@/lib/urls";

// Black Friday 2026 — 30% off every plan. The code row is seeded in
// lib/db/migrations.ts (idempotent). Changing this string alone does NOT
// change what the DB accepts — keep the two in sync.
const DISCOUNT_CODE = "BLACKFRIDAY";
// Bumped from gc_banner_closed so a visitor who dismissed the old WELCOME15
// banner still sees the Black Friday one this session.
const STORAGE_KEY = "gc_bf_banner_closed";

const COPY: Record<LangCode, { text: string; cta: string; copy: string; copied: string }> = {
  sl: {
    text: "🖤 BLACK FRIDAY: −30 % na vse pakete — koda",
    cta: "Izkoristi −30 % →",
    copy: "kopiraj",
    copied: "Kopirano ✓",
  },
  hr: {
    text: "🖤 BLACK FRIDAY: −30 % na sve pakete — kod",
    cta: "Iskoristi −30 % →",
    copy: "kopiraj",
    copied: "Kopirano ✓",
  },
  sr: {
    text: "🖤 BLACK FRIDAY: −30 % na sve pakete — kod",
    cta: "Iskoristi −30 % →",
    copy: "kopiraj",
    copied: "Kopirano ✓",
  },
  de: {
    text: "🖤 BLACK FRIDAY: −30 % auf alle Pakete — Code",
    cta: "−30 % sichern →",
    copy: "kopieren",
    copied: "Kopiert ✓",
  },
  en: {
    text: "🖤 BLACK FRIDAY: −30% on every plan — code",
    cta: "Get −30% →",
    copy: "copy",
    copied: "Copied ✓",
  },
  es: {
    text: "🖤 BLACK FRIDAY: −30 % en todos los planes — código",
    cta: "Consigue −30 % →",
    copy: "copiar",
    copied: "Copiado ✓",
  },
};

export function DiscountBanner({ lang }: { lang: LangCode }) {
  const pathname = usePathname();

  // Language comes from the PATH, not the `lang` prop (see git history): the
  // root layout derives the prop from request headers, absent during static
  // prerender, so localized static pages fell back to "sl". COPY is keyed by
  // exactly the supported languages, so membership doubles as validity.
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  const effectiveLang: LangCode = (seg in COPY ? seg : lang) as LangCode;
  const t = COPY[effectiveLang] ?? COPY.en;
  const [closed, setClosed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(STORAGE_KEY);
  });
  const [copied, setCopied] = useState(false);

  // Hide on checkout/dashboard/affiliate surfaces — a customer already buying
  // doesn't need the acquisition banner.
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
      className="relative flex w-full items-center justify-center gap-3 px-4 py-2.5 text-sm font-semibold text-white"
      style={{ background: "linear-gradient(90deg, #0a0a0a 0%, #171717 50%, #0a0a0a 100%)" }}
    >
      {/* Text + code */}
      <span className="flex flex-wrap items-center justify-center gap-2">
        <span>{t.text}</span>
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFC94D] px-2.5 py-1 font-mono text-xs font-bold text-[#0a0a0a] transition-colors hover:bg-[#ffd666]"
        >
          {DISCOUNT_CODE}
          <span className="font-sans text-[10px] font-semibold opacity-70">
            {copied ? t.copied : t.copy}
          </span>
        </button>
      </span>

      {/* CTA */}
      <Link
        href={localizedAccountPath(effectiveLang, "/dashboard/new")}
        className="hidden whitespace-nowrap text-xs font-bold text-[#FFC94D] underline underline-offset-2 transition-opacity hover:opacity-70 sm:inline-flex"
      >
        {t.cta}
      </Link>

      {/* Close */}
      <button
        onClick={close}
        aria-label="Close"
        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-base leading-none transition-colors hover:bg-white/10"
      >
        ×
      </button>
    </div>
  );
}
