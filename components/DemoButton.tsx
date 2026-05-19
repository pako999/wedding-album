"use client";

import { useState, useEffect } from "react";

/**
 * The album the demo QR code / link points at.
 * Swap this for a dedicated, photo-filled demo album once one exists.
 */
const DEMO_SLUG = "ana-marko-13ka";

export function DemoButton({ variant = "hero" }: { variant?: "hero" | "nav" }) {
  const [open, setOpen] = useState(false);

  // Resolve the demo URL from the actual host the visitor is on — works on
  // localhost and production alike, with no dependency on a build-time env var.
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const demoUrl = `${origin}/${DEMO_SLUG}`;
  const qrSrc = origin
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&qzone=2&format=png` +
      `&bgcolor=ffffff&color=2C2825&data=${encodeURIComponent(demoUrl)}`
    : "";

  return (
    <>
      {variant === "hero" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2.5 px-8 py-5 rounded-full font-bold text-lg border-2 transition-all duration-200 hover:scale-[1.02]"
          style={{ borderColor: "#1E3A8A", color: "#0F1729" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#1E3A8A" }}>
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

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-[#0F1729]/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Zapri"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 text-[#0F1729]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-2">Demo v živo</p>
            <h2 className="font-serif text-2xl font-light text-[#0F1729] mb-2">
              Razišči demo galerijo
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Skenirajte QR kodo ali kliknite spodaj — vstopite v gostujočo galerijo
              in preizkusite, kako preprosto gostje delijo fotografije in videe.
            </p>

            <div
              className="inline-flex items-center justify-center p-4 rounded-2xl border-2"
              style={{ borderColor: "rgba(30,58,138,0.3)", width: 248, height: 248 }}
            >
              {qrSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrSrc}
                  alt="QR koda za demo galerijo"
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
              className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-white font-bold transition-all hover:brightness-95"
              style={{ background: "#1E3A8A" }}
            >
              Odpri demo galerijo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <p className="mt-3 text-xs text-gray-400">Brez prijave · Brez aplikacije</p>
          </div>
        </div>
      )}
    </>
  );
}
