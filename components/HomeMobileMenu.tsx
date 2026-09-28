"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef, useId, useCallback } from "react";
import { HOME_HREFLANG, type LangCode } from "./LanguageSwitcher";
import { GuestcamLogo } from "./GuestcamLogo";
import { localePublicPath, localizedAccountPath } from "@/lib/urls";
import { WEDDING_PATHS } from "@/lib/wedding/contracts";
import { weddingCopy } from "@/lib/wedding/copy";

export interface HomeMobileMenuLabels {
  open: string;
  close: string;
  language: string;
  languageAria: string;
  signIn: string;
  dashboard: string;
  cta: string;
}

type MenuLink = { href: string; label: string };

export interface HomeMobileMenuProps {
  signedIn?: boolean;
  lang: LangCode;
  links: MenuLink[];
  labels: HomeMobileMenuLabels;
  /** Inner pages retain their equivalent-page language links. */
  hreflang?: Partial<Record<LangCode, string>>;
  homeHref?: string;
}

const LOCALIZED_SECTION_LABELS: Partial<Record<LangCode, { how: string; pricing: string; faq: string }>> = {
  hr: { how: "Kako radi", pricing: "Cijene", faq: "FAQ" },
  sr: { how: "Kako radi", pricing: "Cene", faq: "FAQ" },
  de: { how: "So funktioniert's", pricing: "Preise", faq: "FAQ" },
  en: { how: "How it works", pricing: "Pricing", faq: "FAQ" },
  es: { how: "Cómo funciona", pricing: "Precios", faq: "FAQ" },
};

const LANGUAGE_LABELS: Record<LangCode, string> = {
  sl: "Slovenščina", hr: "Hrvatski", sr: "Srpski", en: "English", de: "Deutsch", es: "Español",
};

/** Preserve every supplied link and always expose the localized wedding page. */
export function buildHomeMobileMenuLinks(lang: LangCode, links: MenuLink[]): MenuLink[] {
  let expanded = [...links];
  const copy = LOCALIZED_SECTION_LABELS[lang];
  // Compatibility with the older localized homepage's shorter navigation.
  if (copy && !links.some((link) => link.href === "#how") && links.some((link) => link.href === "#business")) {
    expanded = [
      { href: "#how", label: copy.how },
      ...(!links.some((link) => link.href === "#pricing") ? [{ href: "#pricing", label: copy.pricing }] : []),
      ...links,
      ...(!links.some((link) => link.href === "#faq") ? [{ href: "#faq", label: copy.faq }] : []),
    ];
  }
  const weddingHref = localePublicPath(lang, WEDDING_PATHS[lang]);
  const seen = new Set([weddingHref]);
  return [
    { href: weddingHref, label: weddingCopy(lang).nav },
    ...expanded.filter((link) => {
      // Deduplicate internal, canonical, and country-domain wedding URLs.
      let pathname = link.href;
      try { pathname = new URL(link.href, "https://navigation.invalid").pathname.replace(/\/$/, "") || "/"; } catch { /* keep the original link */ }
      if (localePublicPath(lang, pathname) === weddingHref || seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    }),
  ];
}

/** Shared mobile/tablet navigation. The desktop headers start at lg (1024px). */
export function HomeMobileMenu({ signedIn = false, lang, links, labels, hreflang = HOME_HREFLANG, homeHref }: HomeMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unlockRef = useRef<(() => void) | null>(null);
  const dialogId = useId();
  const menuLinks = useMemo(() => buildHomeMobileMenuLinks(lang, links), [lang, links]);
  const resolvedHome = homeHref ?? localePublicPath(lang, lang === "sl" ? "/" : `/${lang}`);
  const weddingHref = localePublicPath(lang, WEDDING_PATHS[lang]);

  const closeMenu = useCallback(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
    // Release synchronously, BEFORE the clicked link performs its navigation.
    // An effect cleanup after an anchor scroll can otherwise jump back up.
    unlockRef.current?.();
    unlockRef.current = null;
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    const body = document.body;
    const root = document.documentElement;
    const x = window.scrollX;
    const y = window.scrollY;
    const previous = {
      position: body.style.position, top: body.style.top, left: body.style.left,
      right: body.style.right, width: body.style.width, overflow: body.style.overflow,
    };
    const rootOverflow = root.style.overflow;
    // Native top-layer rendering avoids clipping by the sticky header's blur
    // and the homepage's overflow-hidden wrapper; focus stays inside the menu.
    dialog.showModal();
    Object.assign(body.style, { position: "fixed", top: `-${y}px`, left: `-${x}px`, right: "0", width: "100%", overflow: "hidden" });
    root.style.overflow = "hidden";
    unlockRef.current = () => {
      const behavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      Object.assign(body.style, previous);
      root.style.overflow = rootOverflow;
      window.scrollTo(x, y);
      root.style.scrollBehavior = behavior;
    };
    setOpen(true);
  };

  useEffect(() => () => { unlockRef.current?.(); }, []);

  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches || !triggerRef.current?.getClientRects().length) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, closeMenu]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        aria-label={labels.open}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#0F1729] transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6218] lg:hidden"
      >
        <svg className="h-7 w-7" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <dialog
        id={dialogId}
        ref={dialogRef}
        aria-label={labels.open}
        onCancel={(event) => { event.preventDefault(); closeMenu(); }}
        onClose={(event) => { if (!event.currentTarget.open) closeMenu(); }}
        className="fixed inset-0 m-0 h-screen max-h-none w-full max-w-none overflow-hidden border-0 bg-[#FFFDF8] p-0 text-[#111111] outline-none backdrop:bg-black/40 supports-[height:100dvh]:h-[100dvh]"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div
            className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-5 pb-4"
            style={{ paddingTop: "max(1rem, env(safe-area-inset-top))", paddingLeft: "max(1.25rem, env(safe-area-inset-left))", paddingRight: "max(1.25rem, env(safe-area-inset-right))" }}
          >
            <Link href={resolvedHome} aria-label="Guestcam" onClick={closeMenu} className="shrink-0">
              <GuestcamLogo size="sm" showMark />
            </Link>
            <button type="button" autoFocus onClick={closeMenu} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-3 text-base font-bold hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6218]">
              {labels.close}
              <svg className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5" style={{ WebkitOverflowScrolling: "touch", paddingLeft: "max(1.25rem, env(safe-area-inset-left))", paddingRight: "max(1.25rem, env(safe-area-inset-right))" }}>
            <nav aria-label={labels.open} className="flex flex-col gap-1">
              {menuLinks.map((link) => {
                const featured = link.href === weddingHref;
                const className = `flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold leading-tight tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C6218] ${featured ? "mb-2 border border-[#DCA72A] bg-[#F4B400] text-black hover:bg-[#FFD966]" : "text-[#111111] hover:bg-black/5"}`;
                const contents = <><span className="min-w-0 break-words">{link.label}</span>{featured && <span aria-hidden="true" className="shrink-0">↗</span>}</>;
                // Keep full document navigation for blog pages, as elsewhere.
                return link.href.startsWith("#") || /\/blog(?:\/|$)/.test(link.href) ? (
                  <a key={link.href} href={link.href} onClick={closeMenu} className={className} style={{ fontSize: "clamp(1.5rem, 6.4vw, 2rem)" }}>{contents}</a>
                ) : (
                  <Link key={link.href} href={link.href} onClick={closeMenu} className={className} style={{ fontSize: "clamp(1.5rem, 6.4vw, 2rem)" }} prefetch={false}>{contents}</Link>
                );
              })}
            </nav>

            <section aria-label={labels.languageAria} className="mt-6 border-t border-black/10 pt-5">
              <p className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-black/55">{labels.language}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(LANGUAGE_LABELS) as LangCode[]).map((code) => hreflang[code] && (
                  <a key={code} href={hreflang[code]} hrefLang={code} lang={code} onClick={closeMenu} aria-current={code === lang ? "true" : undefined} className={`flex min-h-12 items-center rounded-xl border px-3 py-2 text-base font-semibold ${code === lang ? "border-[#DCA72A] bg-[#FFF1C2] text-black" : "border-black/10 bg-white text-black/70 hover:border-black/30"}`}>
                    {LANGUAGE_LABELS[code]}
                  </a>
                ))}
              </div>
            </section>
          </div>

          <div className="shrink-0 border-t border-black/10 bg-[#FFFDF8] px-5 pt-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))", paddingLeft: "max(1.25rem, env(safe-area-inset-left))", paddingRight: "max(1.25rem, env(safe-area-inset-right))" }}>
            {signedIn ? (
              <Link href={localizedAccountPath(lang, "/dashboard")} onClick={closeMenu} className="flex min-h-14 items-center justify-center rounded-2xl bg-black px-4 py-3 text-center text-lg font-bold text-white">{labels.dashboard} →</Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href={localizedAccountPath(lang, "/sign-in")} onClick={closeMenu} className="flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-lg font-semibold text-black/70 hover:bg-black/5">{labels.signIn}</Link>
                <Link href={localizedAccountPath(lang, "/dashboard/new")} onClick={closeMenu} className="flex min-h-14 items-center justify-center rounded-2xl bg-black px-4 py-3 text-center text-lg font-bold text-white">{labels.cta} →</Link>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
