"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CamLoveLogo } from "@/components/CamLoveLogo";

/**
 * Full-screen mobile navigation.
 *
 * Replaces the previous CSS-only <details> overlay, which had a real UX
 * bug: same-page anchor links (#pricing, #faq …) navigated underneath the
 * overlay while the overlay itself stayed open, because nothing ever
 * closed the <details>. A menu must close when a destination is chosen,
 * and that requires state.
 *
 * Behaviour contract:
 * - any link tap closes the menu (then the browser handles the anchor)
 * - Escape closes
 * - body scroll is locked while open, always restored on unmount
 * - entrance is a CSS stagger (see globals.css `mm-*` keyframes), fully
 *   disabled under prefers-reduced-motion
 */
export function MobileMenu({
  links,
  ctaHref,
  ctaLabel,
  homeHref,
  menuLabel,
  langSlot,
  langLabel,
  tagline,
}: {
  links: ReadonlyArray<readonly [string, string]>;
  ctaHref: string;
  ctaLabel: string;
  homeHref: string;
  menuLabel: string;
  /** LanguageSwitcher is rendered by the server parent and passed through. */
  langSlot: ReactNode;
  langLabel: string;
  tagline: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // The overlay must escape the sticky header: its backdrop-blur makes the
  // header a CONTAINING BLOCK for position:fixed descendants, so without a
  // portal "inset-0" pins to the header's box (below the promo banner)
  // instead of the viewport. Portal only mounts after a click, so document
  // is always available.
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-black shadow-sm active:scale-[0.97]"
      >
        {menuLabel}
        <span aria-hidden className="flex flex-col gap-[3px]">
          <span className="h-[2px] w-4 rounded bg-black" />
          <span className="h-[2px] w-4 rounded bg-black" />
          <span className="h-[2px] w-2.5 self-end rounded bg-[#F4B400]" />
        </span>
      </button>

      {open && createPortal(
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="mm-overlay fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-y-auto bg-[#FFFDF8] px-5 pb-8 pt-5 sm:px-8"
        >
          <div className="flex items-center justify-between border-b border-black/10 pb-5">
            <Link href={homeHref} aria-label="CamLove" onClick={close}>
              <CamLoveLogo size="sm" showMark />
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label="Zapri meni"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white active:scale-[0.95]"
            >
              <span aria-hidden className="text-2xl font-light leading-none">×</span>
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center py-7 sm:py-10">
            {links.map(([href, label], i) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="mm-link group flex items-center justify-between border-b border-black/10 py-4 text-[clamp(1.65rem,7vw,2.8rem)] font-black leading-none tracking-[-.045em]"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <span>{label}</span>
                <span aria-hidden className="text-xl font-medium text-[#F4B400] transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </nav>

          <div className="mm-link mt-auto border-t border-black/10 pt-5" style={{ animationDelay: `${links.length * 45}ms` }}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-[.15em] text-black/40">{langLabel}</span>
              {langSlot}
            </div>
            <Link
              href={ctaHref}
              onClick={close}
              className="mt-5 block rounded-full bg-[#F4B400] px-6 py-4 text-center text-base font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.24)] active:scale-[0.98]"
            >
              {ctaLabel} →
            </Link>
            <p className="mt-4 text-center text-xs font-semibold text-black/40">{tagline}</p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
