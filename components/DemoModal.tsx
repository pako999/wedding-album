"use client";

import { useState, useEffect } from "react";

const DEMO_SLUG = process.env.NEXT_PUBLIC_DEMO_ALBUM_SLUG ?? "demo";

interface DemoModalProps {
  /** "nav" = compact navbar button, "hero" = large pill button */
  variant?: "nav" | "hero";
}

export function DemoModal({ variant = "nav" }: DemoModalProps) {
  const [open, setOpen] = useState(false);
  const [demoUrl, setDemoUrl] = useState("");

  useEffect(() => {
    setDemoUrl(`${window.location.origin}/${DEMO_SLUG}`);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const qrUrl = demoUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
        demoUrl
      )}&bgcolor=ffffff&color=2C2825&qzone=2&format=png`
    : "";

  return (
    <>
      {/* ── Trigger button ──────────────────────────────────────────────── */}
      {variant === "hero" ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2.5 px-8 py-5 rounded-full font-bold text-lg border-2 transition-all duration-200 hover:scale-[1.02]"
          style={{ borderColor: "#C4738A", color: "#C4738A", background: "#fff" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Poglej demo zdaj
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
          style={{ color: "#C4738A" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Poglej demo
        </button>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(26,20,16,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Zapri"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="font-serif text-3xl font-light text-[#2C2825] mb-2">
              Poglej demo galerijo
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-7 max-w-xs mx-auto">
              <strong className="text-[#2C2825]">Skeniraj QR kodo</strong> ali{" "}
              <strong className="text-[#2C2825]">klikni povezavo spodaj</strong> — vstopi v
              galerijo kot gost in preizkusi, kako enostavno je nalaganje fotografij.
            </p>

            {/* QR code */}
            <div className="flex justify-center mb-6">
              <div
                className="p-4 rounded-2xl"
                style={{ background: "linear-gradient(135deg, #FDF4F5, #FEF2F4)" }}
              >
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Demo QR koda"
                    className="w-52 h-52 rounded-lg bg-white"
                    width={208}
                    height={208}
                  />
                ) : (
                  <div className="w-52 h-52 rounded-lg bg-white animate-pulse" />
                )}
              </div>
            </div>

            {/* Link */}
            <a
              href={demoUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "#C4738A", boxShadow: "0 8px 24px rgba(196,115,138,0.4)" }}
            >
              Odpri demo galerijo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
