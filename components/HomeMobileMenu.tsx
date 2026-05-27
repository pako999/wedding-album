"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LanguageSwitcher, HOME_HREFLANG, type LangCode } from "./LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";

export interface HomeMobileMenuLabels {
  open: string;
  close: string;
  language: string;
  languageAria: string;
  signIn: string;
  dashboard: string;
  cta: string;
}

export interface HomeMobileMenuProps {
  signedIn?: boolean;
  lang: LangCode;
  links: { href: string; label: string }[];
  labels: HomeMobileMenuLabels;
}

/**
 * Hamburger menu for the homepage navbar — visible only below `md`.
 *
 * `signedIn` is resolved server-side on each homepage (Clerk's auth() in SSR)
 * so the menu doesn't flash the wrong auth state during Clerk hydration.
 * Labels + links are passed in so the same component drives every locale.
 */
export function HomeMobileMenu({ signedIn = false, lang, links, labels }: HomeMobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? labels.close : labels.open}
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-lg hover:bg-gray-100 text-[#0F1729] transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="md:hidden fixed inset-0 top-16 z-30 bg-black/40 backdrop-blur-[2px]"
          />
          <div
            role="menu"
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              <div className="px-3 pb-3 mb-2 border-b border-gray-100 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {labels.language}
                </span>
                <LanguageSwitcher current={lang} languages={HOME_HREFLANG} ariaLabel={labels.languageAria} />
              </div>
              {links.map((l) => {
                const isAnchor = l.href.startsWith("#");
                const className = "px-3 py-3 rounded-lg text-base font-semibold text-[#0F1729] hover:bg-[#FFF9EC] transition-colors";
                return isAnchor ? (
                  <a key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className={className}>
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)} className={className}>
                    {l.label}
                  </Link>
                );
              })}
              <div className="my-2 h-px bg-gray-100" />
              {/* Auth-aware row — signed out: sign-in; signed in:
                  dashboard + avatar. */}
              {signedIn ? (
                <div className="px-3 py-2 flex items-center justify-between gap-3" role="menuitem">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-[#0F1729] transition-colors"
                  >
                    {labels.dashboard}
                  </Link>
                  <UserButton
                    appearance={{ elements: { userButtonAvatarBox: { width: 30, height: 30 } } }}
                  />
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {labels.signIn}
                </Link>
              )}
              {!signedIn && (
                <Link
                  href="/dashboard/new"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="mt-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full text-sm font-bold text-[#0F1729]"
                  style={{
                    background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
                    boxShadow: "0 6px 18px rgba(255,201,77,0.45)",
                  }}
                >
                  {labels.cta}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
