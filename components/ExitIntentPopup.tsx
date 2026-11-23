"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { LangCode } from "@/components/LanguageSwitcher";
import { localizedAccountPath } from "@/lib/urls";

// Black Friday 2026 — 30% off every plan. Code row seeded in
// lib/db/migrations.ts; keep this string in sync with it.
const DISCOUNT_CODE = "BLACKFRIDAY";
// Bumped from gc_exit_seen so a visitor who already saw the WELCOME15 popup
// still gets the Black Friday one once this session.
const STORAGE_KEY = "gc_exit_bf_seen";
const MIN_TIME_MS = 8000; // show only after 8 s on page

interface Copy {
  eyebrow: string;
  heading: string;
  body: string;
  codeLabel: string;
  cta: string;
  dismiss: string;
  copied: string;
}

const COPY: Record<LangCode, Copy> = {
  sl: {
    eyebrow: "🖤 Black Friday — samo še do ponedeljka",
    heading: "Počakajte! −30 % na vse pakete.",
    body: "Črni petek: uporabite kodo pri nakupu in prihranite 30 % na katerem koli paketu. Ponudba se izteče.",
    codeLabel: "Vaša Black Friday koda:",
    cta: "Izkoristim −30 %",
    dismiss: "Ne, hvala",
    copied: "Kopirano ✓",
  },
  hr: {
    eyebrow: "🖤 Black Friday — samo do ponedjeljka",
    heading: "Čekajte! −30 % na sve pakete.",
    body: "Crni petak: upotrijebite kod pri kupnji i uštedite 30 % na bilo kojem paketu. Ponuda uskoro istječe.",
    codeLabel: "Vaš Black Friday kod:",
    cta: "Uzimam −30 %",
    dismiss: "Ne, hvala",
    copied: "Kopirano ✓",
  },
  sr: {
    eyebrow: "🖤 Black Friday — samo do ponedeljka",
    heading: "Čekajte! −30 % na sve pakete.",
    body: "Crni petak: iskoristite kod pri kupovini i uštedite 30 % na bilo kom paketu. Ponuda uskoro ističe.",
    codeLabel: "Vaš Black Friday kod:",
    cta: "Uzimam −30 %",
    dismiss: "Ne, hvala",
    copied: "Kopirano ✓",
  },
  de: {
    eyebrow: "🖤 Black Friday — nur bis Montag",
    heading: "Moment! −30 % auf alle Pakete.",
    body: "Black Friday: Code beim Kauf eingeben und 30 % auf jedes Paket sparen. Das Angebot läuft bald ab.",
    codeLabel: "Ihr Black-Friday-Code:",
    cta: "−30 % sichern",
    dismiss: "Nein, danke",
    copied: "Kopiert ✓",
  },
  en: {
    eyebrow: "🖤 Black Friday — only until Monday",
    heading: "Wait! −30% on every plan.",
    body: "Black Friday: use the code at checkout and save 30% on any plan. Offer ends soon.",
    codeLabel: "Your Black Friday code:",
    cta: "Get −30%",
    dismiss: "No, thanks",
    copied: "Copied ✓",
  },
  es: {
    eyebrow: "🖤 Black Friday — solo hasta el lunes",
    heading: "¡Espera! −30 % en todos los planes.",
    body: "Black Friday: usa el código al pagar y ahorra un 30 % en cualquier plan. La oferta termina pronto.",
    codeLabel: "Tu código Black Friday:",
    cta: "Conseguir −30 %",
    dismiss: "No, gracias",
    copied: "¡Copiado ✓",
  },
};

export function ExitIntentPopup({ lang }: { lang: LangCode }) {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  const effectiveLang = (seg in COPY ? seg : lang) as LangCode;
  const t = COPY[effectiveLang] ?? COPY.en;
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Suppressed on dashboard / checkout / album / affiliate pages — the
    // exit-intent discount is a MARKETING nudge; a customer already on the
    // upgrade page is committed to buying and shouldn't be handed a code.
    const isSuppressedPath = (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/api") ||
      p.startsWith("/admin") ||
      /\/affiliate(?:\/|$)/.test(p);

    if (isSuppressedPath(window.location.pathname)) return;

    const timer = setTimeout(() => {
      readyRef.current = true;
    }, MIN_TIME_MS);

    const onMouseLeave = (e: MouseEvent) => {
      if (!readyRef.current) return;
      // Re-check the LIVE path: the root layout doesn't re-run on client-
      // side navigation, so this component can persist from a marketing
      // page onto the checkout page. Never fire once the user has moved
      // to a suppressed path.
      if (isSuppressedPath(window.location.pathname)) return;
      if (e.clientY <= 2) {
        setVisible(true);
        readyRef.current = false; // fire only once
      }
    };

    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — user can copy manually
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 41, 0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div
        className="relative rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ background: "linear-gradient(160deg, #171717 0%, #0a0a0a 100%)" }}
      >
        {/* Gold top strip */}
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(90deg, #F0B429 0%, #FFC94D 50%, #FFD966 100%)" }}
        />

        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors text-lg leading-none"
        >
          ×
        </button>

        <div className="px-8 pt-6 pb-8">
          {/* Eyebrow */}
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFC94D] mb-3">
            {t.eyebrow}
          </span>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-bold text-white leading-tight mb-3">
            {t.heading}
          </h2>

          {/* Body */}
          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            {t.body}
          </p>

          {/* Discount code box */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {t.codeLabel}
            </p>
            <button
              onClick={copyCode}
              className="w-full flex items-center justify-between gap-3 px-5 py-3 rounded-xl border-2 border-dashed transition-colors group"
              style={{ borderColor: "#FFC94D", background: "rgba(255, 201, 77, 0.08)" }}
            >
              <span className="font-mono text-xl font-extrabold tracking-widest text-[#FFC94D]">
                {DISCOUNT_CODE}
              </span>
              <span className="text-xs font-semibold text-[#FFC94D] opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                {copied ? t.copied : "Copy"}
              </span>
            </button>
          </div>

          {/* CTA */}
          <Link
            href={localizedAccountPath(effectiveLang, "/dashboard/new")}
            onClick={close}
            className="block w-full text-center py-3.5 rounded-xl font-bold text-[#0a0a0a] text-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)" }}
          >
            {t.cta}
          </Link>

          {/* Dismiss */}
          <button
            onClick={close}
            className="mt-4 w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {t.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
