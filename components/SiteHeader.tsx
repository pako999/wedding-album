import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import {
  LanguageSwitcher,
  HOME_HREFLANG,
  type LangCode,
} from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";

interface NavLinkSet {
  home: string;          // label for the "back to home" link
  blog: string;          // label for the blog link
  cta: string;           // label for the primary "Create gallery" button
  switcherAria: string;  // a11y label for the language picker
}

// Login / Dashboard labels are owned by HeaderAuthButtons so we don't
// have to maintain the same copy in two places.
const NAV_COPY: Record<LangCode, NavLinkSet> = {
  sl: { home: "Domov",   blog: "Blog", cta: "Ustvari galerijo",  switcherAria: "Spremeni jezik" },
  hr: { home: "Početna", blog: "Blog", cta: "Kreiraj galeriju",  switcherAria: "Promijeni jezik" },
  sr: { home: "Početna", blog: "Blog", cta: "Napravi galeriju",  switcherAria: "Promeni jezik" },
  de: { home: "Start",   blog: "Blog", cta: "Galerie erstellen", switcherAria: "Sprache wechseln" },
  en: { home: "Home",    blog: "Blog", cta: "Create gallery",    switcherAria: "Change language" },
  es: { home: "Inicio",  blog: "Blog", cta: "Crear galería",     switcherAria: "Cambiar idioma" },
};

/**
 * Shared site header used on every public marketing/legal/SEO page so
 * the navigation, logo, language switcher and CTA all look identical
 * across pages and across languages. Pages used to copy/paste their
 * own SiteHeader function — that's gone.
 *
 * Pass a `hreflang` map to control where the language-switcher flag
 * links go. Defaults to HOME_HREFLANG (every language → its homepage),
 * which is right for legal pages. Guide / alternatives pages pass
 * GUIDE_HREFLANG / ALTERNATIVES_HREFLANG.
 */
export async function SiteHeader({
  lang,
  hreflang = HOME_HREFLANG,
  /** Path to link the logo to. Default: homepage for the given language. */
  homeHref,
}: {
  lang: LangCode;
  hreflang?: Record<LangCode, string>;
  homeHref?: string;
}) {
  const copy = NAV_COPY[lang];
  const resolvedHome = homeHref ?? (lang === "sl" ? "/" : `/${lang}`);
  // Hide the "Create gallery" CTA for signed-in visitors — repeated
  // CTAs on every page are noise once they're already a customer.
  let signedIn = false;
  try {
    const session = await auth();
    signedIn = !!session.userId;
  } catch { /* Clerk hiccup — render signed-out */ }

  return (
    <header className="sticky top-0 z-40 border-b border-[#FFC94D]/30 bg-white/85 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link
          href={resolvedHome}
          className="flex items-center transition-transform duration-200 hover:scale-[1.03]"
        >
          <GuestcamLogo size="sm" showMark={true} />
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
          <Link
            href={resolvedHome}
            className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors"
          >
            {copy.home}
          </Link>
          <Link
            href={lang === "sl" ? "/blog" : `/${lang}/blog`}
            className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors"
          >
            {copy.blog}
          </Link>
          <HeaderAuthButtons lang={lang} />
          {!signedIn && (
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
                boxShadow: "0 6px 18px rgba(255,201,77,0.45)",
                color: "#0F1729",
              }}
            >
              {copy.cta} →
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
