import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { CamLoveLogo } from "@/components/CamLoveLogo";
import {
  LanguageSwitcher,
  HOME_HREFLANG,
  type LangCode,
} from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";
import { MobileMenu } from "@/components/MobileMenu";

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
      <nav className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-5 sm:px-7 lg:h-[80px] lg:px-8">
        <Link
          href={resolvedHome}
          className="shrink-0 transition-transform duration-200 hover:scale-[1.02]"
          aria-label="CamLove"
        >
          {/* sm on phones so the bar stays compact; md from lg up. */}
          <span className="lg:hidden"><CamLoveLogo size="sm" showMark /></span>
          <span className="hidden lg:block"><CamLoveLogo size="md" showMark /></span>
        </Link>

        <div className="mx-auto hidden min-w-0 items-center gap-4 lg:flex xl:gap-6 2xl:gap-8">
          {desktopLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="group relative whitespace-nowrap py-2 text-[14px] font-bold text-black/65 transition-colors hover:text-black xl:text-[15px]"
            >
              {label}
              {/* underline grows from the left on hover — transform-only */}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-[#F4B400] transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
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
              className="rounded-full bg-black px-5 py-3 text-sm font-black text-white shadow-[0_8px_20px_rgba(0,0,0,.18)] transition-transform hover:scale-[1.03] active:scale-[0.98] xl:px-6 xl:text-[15px]"
            >
              {copy.cta}
            </Link>
          )}
        </div>

        <div className="ml-auto lg:hidden">
          <MobileMenu
            links={mobileLinks}
            ctaHref="/dashboard/new"
            ctaLabel={copy.cta}
            homeHref={resolvedHome}
            menuLabel={copy.menu}
            langSlot={<LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />}
            langLabel={copy.switcherAria}
            tagline="camlove.me · Every camera. One story."
          />
        </div>
      </nav>
    </header>
  );
}
