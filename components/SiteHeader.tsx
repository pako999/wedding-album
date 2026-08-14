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

const MOBILE_CARD_STYLES = [
  "bg-[#F4B400] text-black",
  "bg-black text-white",
  "bg-white text-black border border-black/10",
  "bg-[#FFF0A8] text-black",
  "bg-black text-white",
  "bg-white text-black border border-black/10",
  "bg-[#F4B400] text-black",
  "bg-[#FFF0A8] text-black",
  "bg-black text-white",
] as const;

const MOBILE_CARD_MARKS = ["01", "02", "03", "LIVE", "€", "?", "B2B", "BLOG", "@"] as const;

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
          <summary className="relative z-[70] flex cursor-pointer list-none items-center gap-2 rounded-full bg-[#F4B400] px-5 py-3 text-sm font-black text-black shadow-[0_8px_22px_rgba(244,180,0,.28)] transition-transform active:scale-95 group-open:fixed group-open:right-5 group-open:top-5 group-open:z-[80] group-open:h-14 group-open:w-14 group-open:justify-center group-open:rounded-full group-open:bg-black group-open:p-0 group-open:text-white group-open:shadow-2xl [&::-webkit-details-marker]:hidden sm:group-open:right-8">
            <span className="group-open:hidden">{copy.menu}</span>
            <span className="text-xl leading-none group-open:hidden">☰</span>
            <span className="hidden text-3xl font-light leading-none group-open:block" aria-hidden="true">×</span>
            <span className="sr-only group-open:not-sr-only group-open:absolute group-open:h-px group-open:w-px group-open:overflow-hidden">Zapri meni</span>
          </summary>

          <div className="fixed inset-0 z-[60] min-h-[100dvh] w-screen overflow-y-auto bg-[#FFF9E8] text-black">
            <div className="pointer-events-none fixed -left-16 top-28 h-44 w-44 rounded-full bg-[#F4B400] opacity-35 blur-3xl" />
            <div className="pointer-events-none fixed -right-20 bottom-24 h-60 w-60 rounded-full bg-[#F4B400] opacity-25 blur-3xl" />

            <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-5 pb-7 pt-5 sm:px-8">
              <div className="flex min-h-14 items-center justify-between pr-20">
                <Link href={resolvedHome} aria-label="CamLove" className="shrink-0">
                  <CamLoveLogo size="sm" showMark />
                </Link>
                <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-black/45">camlove.me</span>
              </div>

              <div className="pt-8">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#8A6500]">Every camera. One story.</p>
                    <h2 className="mt-2 text-[clamp(3.4rem,16vw,5.7rem)] font-black leading-[.84] tracking-[-.075em]">{copy.menu}<span className="text-[#F4B400]">.</span></h2>
                  </div>
                  <div className="mb-1 hidden h-16 w-16 rotate-6 items-center justify-center rounded-[22px] bg-black text-3xl text-[#F4B400] sm:flex">✦</div>
                </div>

                <nav className="mt-8 grid grid-cols-2 gap-3">
                  {mobileLinks.map(([href, label], index) => {
                    const wide = index === 0 || index === 6;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`${wide ? "col-span-2 min-h-[112px]" : "min-h-[126px]"} group/link relative flex overflow-hidden rounded-[26px] p-5 shadow-[0_8px_22px_rgba(0,0,0,.08)] transition-transform active:scale-[.97] ${MOBILE_CARD_STYLES[index]}`}
                      >
                        <span className="absolute right-4 top-4 text-[11px] font-black tracking-[.08em] opacity-45">{MOBILE_CARD_MARKS[index]}</span>
                        <span className="mt-auto max-w-[85%] text-[clamp(1.45rem,6.2vw,2.15rem)] font-black leading-[.94] tracking-[-.05em]">{label}</span>
                        <span className="absolute bottom-4 right-4 text-xl font-black transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1">↗</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-7 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/8">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-black uppercase tracking-[.15em] text-black/40">{copy.switcherAria}</span>
                  <LanguageSwitcher current={lang} languages={hreflang} ariaLabel={copy.switcherAria} />
                </div>
                <Link
                  href="/dashboard/new"
                  className="mt-5 flex items-center justify-between rounded-[22px] bg-[#F4B400] px-6 py-5 text-lg font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.24)]"
                >
                  <span>{copy.cta}</span><span className="text-2xl">→</span>
                </Link>
              </div>

              <p className="mt-5 pb-2 text-center text-xs font-semibold text-black/35">CamLove · QR photo sharing for every event</p>
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
