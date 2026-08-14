import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CamLoveLogo } from "@/components/CamLoveLogo";
import {
  LanguageSwitcher,
  HOME_HREFLANG,
  type LangCode,
} from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";

interface NavLinkSet {
  how: string;
  events: string;
  templates: string;
  wall: string;
  pricing: string;
  faq: string;
  business: string;
  blog: string;
  contact: string;
  cta: string;
  menu: string;
  switcherAria: string;
}

const NAV_COPY: Record<LangCode, NavLinkSet> = {
  sl: {
    how: "Kako deluje", events: "Dogodki", templates: "Predloge", wall: "Live Wall",
    pricing: "Cenik", faq: "FAQ", business: "Za podjetja", blog: "Blog",
    contact: "Kontakt", cta: "Ustvari album", menu: "Meni", switcherAria: "Spremeni jezik",
  },
  hr: {
    how: "Kako radi", events: "Događaji", templates: "Predlošci", wall: "Live Wall",
    pricing: "Cijene", faq: "FAQ", business: "Za tvrtke", blog: "Blog",
    contact: "Kontakt", cta: "Kreiraj album", menu: "Izbornik", switcherAria: "Promijeni jezik",
  },
  sr: {
    how: "Kako radi", events: "Događaji", templates: "Predlošci", wall: "Live Wall",
    pricing: "Cene", faq: "FAQ", business: "Za firme", blog: "Blog",
    contact: "Kontakt", cta: "Napravi album", menu: "Meni", switcherAria: "Promeni jezik",
  },
  de: {
    how: "So geht's", events: "Events", templates: "Vorlagen", wall: "Live Wall",
    pricing: "Preise", faq: "FAQ", business: "Für Firmen", blog: "Blog",
    contact: "Kontakt", cta: "Album erstellen", menu: "Menü", switcherAria: "Sprache wechseln",
  },
  en: {
    how: "How it works", events: "Events", templates: "Templates", wall: "Live Wall",
    pricing: "Pricing", faq: "FAQ", business: "For business", blog: "Blog",
    contact: "Contact", cta: "Create album", menu: "Menu", switcherAria: "Change language",
  },
  es: {
    how: "Cómo funciona", events: "Eventos", templates: "Plantillas", wall: "Live Wall",
    pricing: "Precios", faq: "FAQ", business: "Para empresas", blog: "Blog",
    contact: "Contacto", cta: "Crear álbum", menu: "Menú", switcherAria: "Cambiar idioma",
  },
};

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
  const resolvedHome = homeHref ?? (lang === "sl" ? "/" : `/${lang}`);
  const contactHref = lang === "sl" ? "/contact" : `/${lang}/contact`;
  const blogHref = lang === "sl" ? "/blog" : `/${lang}/blog`;

  let signedIn = false;
  try {
    const session = await auth();
    signedIn = !!session.userId;
  } catch {
    // Render the signed-out header if Clerk is unavailable during static rendering.
  }

  const anchor = (id: string) => `${resolvedHome}#${id}`;

  const desktopLinks = [
    [anchor("how"), copy.how],
    [anchor("events"), copy.events],
    [anchor("templates"), copy.templates],
    [anchor("wall"), copy.wall],
    [anchor("pricing"), copy.pricing],
    [anchor("business"), copy.business],
    [blogHref, copy.blog],
  ] as const;

  const mobileLinks = [
    [anchor("how"), copy.how],
    [anchor("events"), copy.events],
    [anchor("templates"), copy.templates],
    [anchor("wall"), copy.wall],
    [anchor("pricing"), copy.pricing],
    [anchor("faq"), copy.faq],
    [anchor("business"), copy.business],
    [blogHref, copy.blog],
    [contactHref, copy.contact],
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FFFDF8]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-[76px] max-w-[1500px] items-center gap-3 px-5 sm:px-7 lg:px-8">
        <Link
          href={resolvedHome}
          className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          aria-label="CamLove"
        >
          <CamLoveLogo size="sm" showMark />
        </Link>

        <div className="mx-auto hidden min-w-0 items-center gap-3 lg:flex xl:gap-5 2xl:gap-7">
          {desktopLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap text-[13px] font-semibold text-black/58 transition-colors hover:text-black xl:text-sm"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex xl:gap-3">
          <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
          <div className="hidden xl:block">
            <HeaderAuthButtons lang={lang} />
          </div>
          {!signedIn && (
            <Link
              href="/dashboard/new"
              className="rounded-full bg-black px-4 py-3 text-[13px] font-black text-white transition-transform hover:scale-[1.02] xl:px-5 xl:text-sm"
            >
              {copy.cta}
            </Link>
          )}
        </div>

        <details className="group ml-auto lg:hidden">
          <summary className="relative z-[70] flex cursor-pointer list-none items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-black shadow-sm [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{copy.menu}</span>
            <span className="text-lg leading-none group-open:hidden">☰</span>
          </summary>

          <div className="fixed inset-0 z-[60] flex min-h-[100dvh] w-screen flex-col overflow-y-auto bg-[#FFFDF8] px-5 pb-8 pt-5 text-black sm:px-8">
            <div className="flex items-center justify-between border-b border-black/10 pb-5">
              <Link href={resolvedHome} aria-label="CamLove" className="shrink-0">
                <CamLoveLogo size="sm" showMark />
              </Link>
              <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-black text-2xl font-light text-white [&::-webkit-details-marker]:hidden" aria-label="Zapri meni">
                ×
              </summary>
            </div>

            <div className="flex flex-1 flex-col justify-center py-8">
              <nav className="flex flex-col">
                {mobileLinks.map(([href, label], index) => (
                  <Link
                    key={href}
                    href={href}
                    className="group/link flex items-center justify-between border-b border-black/10 py-4 text-[clamp(1.65rem,7vw,2.8rem)] font-black leading-none tracking-[-.045em]"
                  >
                    <span>{label}</span>
                    <span className="text-xl font-medium text-[#F4B400] transition-transform group-hover/link:translate-x-1">↗</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto border-t border-black/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-[.15em] text-black/40">{copy.switcherAria}</span>
                <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
              </div>
              <Link
                href="/dashboard/new"
                className="mt-5 block rounded-full bg-[#F4B400] px-6 py-4 text-center text-base font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.24)]"
              >
                {copy.cta} →
              </Link>
              <p className="mt-4 text-center text-xs font-semibold text-black/40">camlove.me · Every camera. One story.</p>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
