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
      <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-4 px-5 sm:px-8">
        <Link
          href={resolvedHome}
          className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          aria-label="CamLove"
        >
          <CamLoveLogo size="sm" showMark />
        </Link>

        <div className="mx-auto hidden items-center gap-5 xl:flex 2xl:gap-7">
          {desktopLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap text-sm font-semibold text-black/58 transition-colors hover:text-black"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-3 sm:flex">
          <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
          <HeaderAuthButtons lang={lang} />
          {!signedIn && (
            <Link
              href="/dashboard/new"
              className="rounded-full bg-black px-5 py-3 text-sm font-black text-white transition-transform hover:scale-[1.02]"
            >
              {copy.cta}
            </Link>
          )}
        </div>

        <details className="group relative ml-auto sm:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-black [&::-webkit-details-marker]:hidden">
            <span>{copy.menu}</span>
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="absolute right-0 top-[52px] w-[min(88vw,320px)] overflow-hidden rounded-[24px] border border-black/10 bg-white p-3 shadow-2xl">
            <div className="flex flex-col">
              {mobileLinks.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-xl px-4 py-3 text-sm font-bold text-black/70 hover:bg-[#FFF5CC] hover:text-black">
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-2 border-t border-black/10 p-3">
              <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
              <Link href="/dashboard/new" className="mt-3 block rounded-full bg-[#F4B400] px-5 py-3 text-center text-sm font-black text-black">
                {copy.cta} →
              </Link>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
