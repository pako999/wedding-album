"use client";

import { useEffect } from "react";

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";

interface Copy {
  headline: string;
  sub: (code: string) => string;
  button: string;
}

const COPY: Record<Lang, Copy> = {
  sl: {
    headline: "Organiziraš svoj dogodek?",
    sub: (c) => `Ustvari svojo galerijo s 15 % popusta — koda ${c}`,
    button: "Ustvari galerijo",
  },
  hr: {
    headline: "Planiraš vjenčanje ili proslavu?",
    sub: (c) => `Napravi svoju galeriju uz 15 % popusta — kod ${c}`,
    button: "Napravi galeriju",
  },
  sr: {
    headline: "Planiraš svoje venčanje ili proslavu?",
    sub: (c) => `Napravi svoju galeriju uz 15 % popusta — kod ${c}`,
    button: "Napravi galeriju",
  },
  de: {
    headline: "Planen Sie Ihre eigene Veranstaltung?",
    sub: (c) => `Erstellen Sie Ihre eigene Galerie mit 15 % Rabatt — Code ${c}`,
    button: "Galerie erstellen",
  },
  en: {
    headline: "Planning your own event?",
    sub: (c) => `Create your own gallery with 15% off — code ${c}`,
    button: "Create gallery",
  },
  es: {
    headline: "¿Organizas tu propio evento?",
    sub: (c) => `Crea tu propia galería con un 15 % de descuento — código ${c}`,
    button: "Crear galería",
  },
};

/** Fire a GA event via the global gtag helper. Safe if gtag isn't loaded. */
function ga(event: string, params: Record<string, string> = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") gtag("event", event, params);
}

interface Props {
  /** Referral code from the album — falls back to `null` if the album was
   *  created before the migration ran and hasn't been backfilled yet. */
  referralCode: string | null;
  lang: Lang;
  /** Source album's slug — used only for analytics props, not the link. */
  sourceAlbumSlug?: string;
}

/**
 * Post-upload CTA. Renders below the "your upload is complete" screen.
 * Never shown before or during the upload — the spec is explicit about
 * not adding friction to the core job.
 */
export function GuestReferralCta({ referralCode, lang, sourceAlbumSlug }: Props) {
  const t = COPY[lang] ?? COPY.en;
  const code = referralCode?.trim();

  // Fire "viewed" analytics once per mount.
  useEffect(() => {
    if (!code) return;
    ga("referral_cta_viewed", {
      touchpoint: "upload_success",
      source_event_id: sourceAlbumSlug ?? "",
      locale: lang,
    });
  }, [code, lang, sourceAlbumSlug]);

  if (!code) return null;

  const href = `/${lang === "sl" ? "" : `${lang}/`}?ref=${encodeURIComponent(code)}&tp=upload_success`;

  const onClick = () => {
    ga("referral_cta_clicked", {
      touchpoint: "upload_success",
      source_event_id: sourceAlbumSlug ?? "",
      locale: lang,
    });
  };

  return (
    <div className="mt-5 pt-4 border-t border-gray-100 rounded-2xl">
      <div className="rounded-2xl p-4 sm:p-5" style={{ background: "linear-gradient(135deg, #FFF3CC 0%, #FFE8A6 100%)" }}>
        <p className="text-sm font-bold text-[#0F1729] mb-1">🎁 {t.headline}</p>
        <p className="text-xs text-[#0F1729]/70 leading-relaxed mb-3">
          {t.sub(code)}
        </p>
        <a
          href={href}
          onClick={onClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[#0F1729] transition-transform hover:scale-[1.02]"
          style={{ background: "#0F1729", color: "#FFF" }}
        >
          {t.button} →
        </a>
      </div>
    </div>
  );
}
