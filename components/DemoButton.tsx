"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { LangCode } from "@/components/LanguageSwitcher";
import {
  PRIMARY_GUESTCAM_ORIGIN,
  isCountryMarketingHost,
} from "@/lib/site-domains";

/**
 * The album the demo QR code / link points at.
 * Swap this for a dedicated, photo-filled demo album once one exists.
 */
const DEMO_SLUG = "ana-marko-13ka";

type DemoVariant = "hero" | "nav" | "heroDark" | "bridge";

const MODAL_COPY: Record<LangCode, {
  close: string;
  eyebrow: string;
  title: string;
  body: string;
  qrAlt: string;
  open: string;
  note: string;
}> = {
  sl: { close: "Zapri", eyebrow: "Demo v živo", title: "Razišči demo galerijo", body: "Skenirajte QR kodo ali kliknite spodaj — preizkusite, kako preprosto gostje delijo fotografije in videe.", qrAlt: "QR koda za demo galerijo", open: "Odpri demo galerijo", note: "Brez prijave · Brez aplikacije" },
  hr: { close: "Zatvori", eyebrow: "Demo uživo", title: "Istražite demo galeriju", body: "Skenirajte QR kod ili kliknite ispod — isprobajte koliko jednostavno gosti dijele fotografije i videozapise.", qrAlt: "QR kod za demo galeriju", open: "Otvori demo galeriju", note: "Bez prijave · Bez aplikacije" },
  sr: { close: "Zatvori", eyebrow: "Demo uživo", title: "Istražite demo galeriju", body: "Skenirajte QR kod ili kliknite ispod — isprobajte koliko jednostavno gosti dele fotografije i video snimke.", qrAlt: "QR kod za demo galeriju", open: "Otvori demo galeriju", note: "Bez prijave · Bez aplikacije" },
  de: { close: "Schließen", eyebrow: "Live-Demo", title: "Demo-Galerie entdecken", body: "Scannen Sie den QR-Code oder klicken Sie unten und testen Sie, wie einfach Gäste Fotos und Videos teilen.", qrAlt: "QR-Code für die Demo-Galerie", open: "Demo-Galerie öffnen", note: "Ohne Anmeldung · Ohne App" },
  en: { close: "Close", eyebrow: "Live demo", title: "Explore the demo gallery", body: "Scan the QR code or click below to see how easily guests can share photos and videos.", qrAlt: "QR code for the demo gallery", open: "Open demo gallery", note: "No sign-in · No app" },
  es: { close: "Cerrar", eyebrow: "Demo en directo", title: "Explora la galería demo", body: "Escanea el código QR o haz clic abajo para probar lo fácil que es compartir fotos y vídeos.", qrAlt: "Código QR de la galería demo", open: "Abrir galería demo", note: "Sin registro · Sin aplicación" },
};

/** The origin never changes during a page's lifetime — nothing to subscribe to. */
function emptySubscribe() { return () => {}; }

const DEMO_URL_EVENT = "guestcam:demo-url-change";

function subscribeToDemoUrl(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(DEMO_URL_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(DEMO_URL_EVENT, callback);
  };
}

function demoRequestedInUrl() {
  return new URL(window.location.href).searchParams.get("demo") === "1";
}

export function DemoButton({
  variant = "hero",
  lang = "sl",
}: {
  variant?: DemoVariant;
  lang?: LangCode;
}) {
  const [open, setOpen] = useState(false);
  const copy = MODAL_COPY[lang];

  const openFromUrl = useSyncExternalStore(
    subscribeToDemoUrl,
    demoRequestedInUrl,
    () => false,
  );

  const origin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => "",
  );

  /*
   * Compatibility bridge for the redesigned homepage.
   *
   * The original Guestcam homepage used <DemoButton variant="hero" />, which
   * opened this QR modal. The redesigned homepage temporarily replaced it with
   * a plain <Link href="/demo">. When the bridge is mounted we intercept that
   * same marketing link before Next.js navigation and restore the historical
   * popup behaviour without changing the current homepage styling.
   *
   * /demo itself redirects to /?demo=1, so bookmarked / typed demo URLs also
   * arrive here and open the same popup instead of failing on a redirect into
   * an album route.
   */
  useEffect(() => {
    if (variant !== "bridge") return;

    const onDocumentClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== "/demo") return;

      // Capture phase runs before Next/React's delegated click handler, so the
      // router never navigates away from the homepage.
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [variant]);

  let demoOrigin = origin;
  if (origin) {
    try {
      if (isCountryMarketingHost(new URL(origin).hostname)) {
        demoOrigin = PRIMARY_GUESTCAM_ORIGIN;
      }
    } catch {
      // Keep the current origin if a non-browser test supplies an invalid URL.
    }
  }
  const demoUrl = `${demoOrigin}/${DEMO_SLUG}`;
  const qrSrc = demoOrigin
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&qzone=2&format=png` +
      `&bgcolor=ffffff&color=2C2825&data=${encodeURIComponent(demoUrl)}`
    : "";

  const closeDemo = () => {
    setOpen(false);
    const current = new URL(window.location.href);
    if (current.searchParams.has("demo")) {
      current.searchParams.delete("demo");
      const cleanUrl = `${current.pathname}${current.search}${current.hash}`;
      window.history.replaceState(window.history.state, "", cleanUrl || "/");
      window.dispatchEvent(new Event(DEMO_URL_EVENT));
    }
  };

  return (
    <>
      {variant === "bridge" ? null : variant === "heroDark" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-5 rounded-full font-bold text-[15px] sm:text-lg border-2 transition-all duration-200 hover:scale-[1.02] hover:bg-white/5"
          style={{ borderColor: "rgba(255,201,77,.65)", color: "#ffffff" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#FFC94D" }}>
            <path d="M8 5v14l11-7z" />
          </svg>
          Poglej demo zdaj
        </button>
      ) : variant === "hero" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-5 rounded-full font-bold text-[15px] sm:text-lg border-2 transition-all duration-200 hover:scale-[1.02]"
          style={{ borderColor: "#FFC94D", color: "#0F1729" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#C9820A" }}>
            <path d="M8 5v14l11-7z" />
          </svg>
          Poglej demo zdaj
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors"
        >
          Poglej demo
        </button>
      )}

      {(open || openFromUrl) && createPortal(
        <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#0F1729]/70 backdrop-blur-sm"
            onClick={closeDemo}
          />
          <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center">
            <button
              type="button"
              onClick={closeDemo}
              aria-label={copy.close}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#0F1729]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-2">{copy.eyebrow}</p>
            <h2 className="text-2xl font-bold tracking-tight text-[#0F1729] mb-2">
              {copy.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              {copy.body}
            </p>

            <div
              className="inline-flex items-center justify-center p-4 rounded-2xl border-2"
              style={{ borderColor: "rgba(255,201,77,0.4)", width: 248, height: 248 }}
            >
              {qrSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrSrc}
                  alt={copy.qrAlt}
                  width={216}
                  height={216}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[216px] h-[216px] rounded-lg bg-gray-100 animate-pulse" />
              )}
            </div>

            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-[#0F1729] font-bold transition-all hover:brightness-95"
              style={{ background: "#FFC94D" }}
            >
              {copy.open}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-[#C9820A]">
              {copy.note}
            </p>
          </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
