"use client";

import { useEffect, useState } from "react";
import type { LangCode } from "@/components/LanguageSwitcher";

const COOKIE_KEY = "guestcam_consent";

const COPY: Record<LangCode, { text: string; accept: string; reject: string; details: string }> = {
  sl: { text: "Uporabljamo le tehnično nujne piškotke za prijavo. Brez sledilnikov.", accept: "V redu", reject: "Nastavitve", details: "Več" },
  hr: { text: "Koristimo isključivo tehnički nužne kolačiće za prijavu. Bez pratilaca.", accept: "U redu", reject: "Postavke", details: "Više" },
  sr: { text: "Koristimo isključivo tehnički neophodne kolačiće za prijavu. Bez pratilaca.", accept: "U redu", reject: "Podešavanja", details: "Više" },
  de: { text: "Wir verwenden ausschließlich technisch notwendige Cookies für den Login. Kein Tracking.", accept: "OK", reject: "Einstellungen", details: "Mehr" },
  en: { text: "We use only strictly-necessary cookies for sign-in. No trackers.", accept: "OK", reject: "Settings", details: "Learn more" },
  es: { text: "Usamos solo cookies estrictamente necesarias para iniciar sesión. Sin rastreadores.", accept: "OK", reject: "Ajustes", details: "Saber más" },
};

/**
 * Minimal cookie-consent banner.
 *
 * Because Guestcam only uses strictly-necessary cookies (Clerk session +
 * this consent flag itself), the banner is informational rather than a
 * blocking opt-in — but GDPR/PECR still expects acknowledgement, hence
 * the dismiss button. We persist the choice in localStorage so the
 * banner doesn't reappear; if the user wants to reset they can clear
 * site data or hit the Cookies page.
 */
export function CookieConsent({ lang }: { lang: LangCode }) {
  const [show, setShow] = useState(false);
  const t = COPY[lang] ?? COPY.en;

  useEffect(() => {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) setShow(true);
    } catch {
      // SSR or storage blocked — keep banner hidden silently
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try { localStorage.setItem(COOKIE_KEY, "accepted"); } catch {}
    setShow(false);
  };

  const cookiesHref = lang === "sl" ? "/cookies" : `/${lang}/cookies`;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 sm:p-5"
    >
      <p className="text-sm text-gray-700 leading-relaxed mb-3">
        {t.text}{" "}
        <a href={cookiesHref} className="text-[#C9820A] underline hover:text-[#0F1729]">
          {t.details}
        </a>
      </p>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={dismiss}
          className="px-4 py-2 text-xs font-bold rounded-lg text-[#0F1729]"
          style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)" }}
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
