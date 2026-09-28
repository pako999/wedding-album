import { weddingCopy } from "@/lib/wedding/copy";
import { WEDDING_PATHS } from "@/lib/wedding/contracts";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { LanguageSwitcher, HOME_HREFLANG, type LangCode } from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";
import { HomeMobileMenu } from "@/components/HomeMobileMenu";
import { localePublicPath, localizedAccountPath } from "@/lib/urls";

interface NavLinkSet {
  home: string;
  blog: string;
  cta: string;
  switcherAria: string;
}

const NAV_COPY: Record<LangCode, NavLinkSet> = {
  sl: { home: "Domov", blog: "Blog", cta: "Ustvari galerijo", switcherAria: "Spremeni jezik" },
  hr: { home: "Početna", blog: "Blog", cta: "Kreiraj galeriju", switcherAria: "Promijeni jezik" },
  sr: { home: "Početna", blog: "Blog", cta: "Napravi galeriju", switcherAria: "Promeni jezik" },
  de: { home: "Start", blog: "Blog", cta: "Galerie erstellen", switcherAria: "Sprache wechseln" },
  en: { home: "Home", blog: "Blog", cta: "Create gallery", switcherAria: "Change language" },
  es: { home: "Inicio", blog: "Blog", cta: "Crear galería", switcherAria: "Cambiar idioma" },
};

const MOBILE_COPY: Record<LangCode, { open: string; close: string; language: string; signIn: string; dashboard: string; how: string; pricing: string; contact: string }> = {
  sl: { open: "Odpri meni", close: "Zapri meni", language: "Jezik", signIn: "Prijava", dashboard: "Nadzorna plošča", how: "Kako deluje", pricing: "Cenik", contact: "Kontakt" },
  hr: { open: "Otvori izbornik", close: "Zatvori", language: "Jezik", signIn: "Prijava", dashboard: "Nadzorna ploča", how: "Kako radi", pricing: "Cijene", contact: "Kontakt" },
  sr: { open: "Otvori meni", close: "Zatvori", language: "Jezik", signIn: "Prijava", dashboard: "Kontrolna tabla", how: "Kako radi", pricing: "Cene", contact: "Kontakt" },
  en: { open: "Open menu", close: "Close menu", language: "Language", signIn: "Sign in", dashboard: "Dashboard", how: "How it works", pricing: "Pricing", contact: "Contact" },
  de: { open: "Menü öffnen", close: "Schließen", language: "Sprache", signIn: "Anmelden", dashboard: "Dashboard", how: "So funktioniert's", pricing: "Preise", contact: "Kontakt" },
  es: { open: "Abrir menú", close: "Cerrar menú", language: "Idioma", signIn: "Iniciar sesión", dashboard: "Panel de control", how: "Cómo funciona", pricing: "Precios", contact: "Contacto" },
};

/** Shared header for public marketing/legal/SEO pages and all six languages. */
export async function SiteHeader({
  lang,
  hreflang = HOME_HREFLANG,
  homeHref,
}: {
  lang: LangCode;
  hreflang?: Record<LangCode, string>;
  homeHref?: string;
}) {
  const copy = NAV_COPY[lang];
  const mobile = MOBILE_COPY[lang];
  const resolvedHome = homeHref ?? localePublicPath(lang, lang === "sl" ? "/" : `/${lang}`);
  const blogHref = localePublicPath(lang, lang === "sl" ? "/blog" : `/${lang}/blog`);
  let signedIn = false;
  try {
    const session = await auth();
    signedIn = !!session.userId;
  } catch { /* Clerk hiccup — render signed-out */ }

  return (
    <header className="sticky top-0 z-40 border-b border-[#FFC94D]/30 bg-white/85 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-3">
        <Link href={resolvedHome} aria-label="Guestcam" className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.03]">
          <GuestcamLogo size="sm" showMark={true} />
        </Link>

        <div className="hidden items-center gap-3 lg:flex xl:gap-5">
          <Link href={localePublicPath(lang, WEDDING_PATHS[lang])} className="hidden text-sm font-semibold text-gray-700 lg:inline">{weddingCopy(lang).nav}</Link>
          <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
          <Link href={resolvedHome} className="text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors">{copy.home}</Link>
          {/* Content pages intentionally perform a full document load. */}
          <a href={blogHref} className="text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors">{copy.blog}</a>
          <HeaderAuthButtons lang={lang} />
          {!signedIn && (
            <Link href={localizedAccountPath(lang, "/dashboard/new")} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-[1.03]" style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)", boxShadow: "0 6px 18px rgba(255,201,77,0.45)", color: "#0F1729" }}>
              {copy.cta} →
            </Link>
          )}
        </div>

        <HomeMobileMenu
          signedIn={signedIn}
          lang={lang}
          homeHref={resolvedHome}
          hreflang={hreflang}
          links={[
            { href: resolvedHome, label: copy.home },
            { href: `${resolvedHome}#how`, label: mobile.how },
            { href: `${resolvedHome}#pricing`, label: mobile.pricing },
            { href: blogHref, label: copy.blog },
            { href: `${resolvedHome}#faq`, label: "FAQ" },
            { href: localePublicPath(lang, lang === "sl" ? "/contact" : `/${lang}/contact`), label: mobile.contact },
          ]}
          labels={{ open: mobile.open, close: mobile.close, language: mobile.language, languageAria: copy.switcherAria, signIn: mobile.signIn, dashboard: mobile.dashboard, cta: copy.cta }}
        />
      </nav>
    </header>
  );
}
