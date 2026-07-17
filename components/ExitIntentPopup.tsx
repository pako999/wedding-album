"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LangCode } from "@/components/LanguageSwitcher";

const DISCOUNT_CODE = "WELCOME15";
const STORAGE_KEY = "gc_exit_seen";
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
    eyebrow: "Samo zdaj",
    heading: "Hej! 15 % popust — samo za vas.",
    body: "Uporabite kodo pri nakupu in prihranite na prvem paketu.",
    codeLabel: "Vaša koda:",
    cta: "Vzamem popust",
    dismiss: "Ne, hvala",
    copied: "Kopirano ✓",
  },
  hr: {
    eyebrow: "Samo sada",
    heading: "Hej! 15 % popusta — samo za vas.",
    body: "Upotrijebite kod pri kupnji i uštedite na prvom paketu.",
    codeLabel: "Vaš kod:",
    cta: "Uzimam popust",
    dismiss: "Ne, hvala",
    copied: "Kopirano ✓",
  },
  sr: {
    eyebrow: "Samo sada",
    heading: "Hej! 15 % popusta — samo za vas.",
    body: "Iskoristite kod pri kupovini i uštedite na prvom paketu.",
    codeLabel: "Vaš kod:",
    cta: "Uzimam popust",
    dismiss: "Ne, hvala",
    copied: "Kopirano ✓",
  },
  de: {
    eyebrow: "Nur jetzt",
    heading: "Hey! 15 % Rabatt — nur für Sie.",
    body: "Geben Sie den Code beim Kauf ein und sparen Sie beim ersten Paket.",
    codeLabel: "Ihr Code:",
    cta: "Rabatt sichern",
    dismiss: "Nein, danke",
    copied: "Kopiert ✓",
  },
  en: {
    eyebrow: "Only now",
    heading: "Hey! 15% off — just for you.",
    body: "Use the code at checkout and save on your first plan.",
    codeLabel: "Your code:",
    cta: "Get my discount",
    dismiss: "No, thanks",
    copied: "Copied ✓",
  },
  es: {
    eyebrow: "Solo ahora",
    heading: "¡Hola! 15 % de descuento — solo para ti.",
    body: "Usa el código al pagar y ahorra en tu primer plan.",
    codeLabel: "Tu código:",
    cta: "Quiero el descuento",
    dismiss: "No, gracias",
    copied: "¡Copiado ✓",
  },
};

export function ExitIntentPopup({ lang }: { lang: LangCode }) {
  const t = COPY[lang] ?? COPY.en;
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    // Don't trigger on dashboard / album pages — only marketing pages
    const path = window.location.pathname;
    if (path.startsWith("/dashboard") || path.startsWith("/api")) return;

    const timer = setTimeout(() => {
      readyRef.current = true;
    }, MIN_TIME_MS);

    const onMouseLeave = (e: MouseEvent) => {
      if (!readyRef.current) return;
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
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Gold top strip */}
        <div
          className="h-2 w-full"
          style={{ background: "linear-gradient(90deg, #FFD966 0%, #FFC94D 50%, #F0B429 100%)" }}
        />

        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0F1729] transition-colors text-lg leading-none"
        >
          ×
        </button>

        <div className="px-8 pt-6 pb-8">
          {/* Eyebrow */}
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-3">
            {t.eyebrow}
          </span>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-bold text-[#0F1729] leading-tight mb-3">
            {t.heading}
          </h2>

          {/* Body */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
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
              style={{ borderColor: "#FFC94D", background: "#FFFBEE" }}
            >
              <span className="font-mono text-xl font-extrabold tracking-widest text-[#0F1729]">
                {DISCOUNT_CODE}
              </span>
              <span className="text-xs font-semibold text-[#C9820A] group-hover:text-[#0F1729] transition-colors shrink-0">
                {copied ? t.copied : "Copy"}
              </span>
            </button>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/new"
            onClick={close}
            className="block w-full text-center py-3.5 rounded-xl font-bold text-[#0F1729] text-sm transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)" }}
          >
            {t.cta}
          </Link>

          {/* Dismiss */}
          <button
            onClick={close}
            className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
