import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { DemoButton } from "@/components/DemoButton";
import { HomeMobileMenu } from "@/components/HomeMobileMenu";
import { LanguageSwitcher, HOME_HREFLANG } from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";
import { EventCard } from "@/components/EventCard";
import { TrackViewContent } from "@/components/TrackViewContent";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";
import { SITE_URL } from "@/lib/urls";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.guestcam.si",
    languages: {
      sl: "https://www.guestcam.si/",
      hr: "https://www.guestcam.si/hr",
      sr: "https://www.guestcam.si/sr",
      de: "https://www.guestcam.si/de",
      en: "https://www.guestcam.si/en",
      es: "https://www.guestcam.si/es",
      "x-default": "https://www.guestcam.si/",
    },
  },
};

// Structured data — helps search engines and AI Overviews understand the
// brand & product. The FAQPage block is what Google's AI Overviews and
// Perplexity most often cite verbatim, so keep the answers factually
// accurate and update them when pricing / features change.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Guestcam.si",
      legalName: "Sport group d.o.o.",
      alternateName: ["Guestcam Slovenija", "Guestcam"],
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: [
        "https://www.instagram.com/guestcam.si",
        "https://www.facebook.com/guestcam.si",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Guestcam.si",
      alternateName: ["Guestcam Slovenija", "Guestcam", "guestcam.si"],
      url: SITE_URL,
      inLanguage: "sl-SI",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Guestcam",
      applicationCategory: "PhotographyApplication",
      operatingSystem: "Web, iOS, Android (browser)",
      url: SITE_URL,
      description:
        "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji. Za poroke, rojstne dneve, obletnice in druge dogodke.",
      offers: [
        { "@type": "Offer", name: "Free",    price: "0",  priceCurrency: "EUR" },
        { "@type": "Offer", name: "Basic",   price: "39", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Plus",    price: "49", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Premium", price: "99", priceCurrency: "EUR" },
      ],
      // NOTE: Do NOT ship an `aggregateRating` here until we have real
      // review data anchored to a public source (G2 / Trustpilot / Google
      // Business). Google's rich-results checker flags unverified ratings
      // and can suppress the entire structured-data card as a penalty.
      // See app/admin backlog: "wire real review aggregate".
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Kaj je Guestcam?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Guestcam je slovenska platforma za zbiranje fotografij in videov gostov na dogodkih (poroke, rojstni dnevi, obletnice, praznovanja). Gostje skenirajo natisnjeno QR kodo in nalagajo fotografije v skupno zasebno galerijo — brez aplikacije, brez registracije, v polni originalni kakovosti.",
          },
        },
        {
          "@type": "Question",
          name: "Ali gostje potrebujejo aplikacijo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ne. Gostje skenirajo QR kodo s kamero telefona in odprejo spletno galerijo. Deluje na vseh telefonih — iOS in Android — brez namestitve, brez ustvarjanja računa.",
          },
        },
        {
          "@type": "Question",
          name: "Koliko stane Guestcam?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Osnovna uporaba je brezplačna (do 20 fotografij, 30 dni). Plačljivi paketi so enkratno plačilo brez naročnine: Basic 39 €, Plus 49 € (najbolj priljubljen), Premium 99 €. Vsi paketi vključujejo 30-dnevno garancijo vračila denarja.",
          },
        },
        {
          "@type": "Question",
          name: "Ali so fotografije stisnjene?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ne. Guestcam ohrani polno originalno kakovost fotografij — brez kompresije, ki jo uporabljajo WhatsApp, Facebook ali Instagram. Vse fotografije lahko po dogodku prenesete kot ZIP arhiv ali shranite v Google Drive.",
          },
        },
        {
          "@type": "Question",
          name: "Ali je Guestcam GDPR skladen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Da. Podatki so shranjeni v EU (Nemčija). Galerija je privzeto zasebna in dostopna samo tistim, ki imajo povezavo ali skeniran QR. Lastnik lahko galerijo dodatno zaščiti z geslom in kadarkoli izbriše vse fotografije.",
          },
        },
        {
          "@type": "Question",
          name: "V katerih jezikih deluje Guestcam?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Vmesnik je na voljo v 6 jezikih: slovenščini, hrvaščini, srbščini, angleščini, nemščini in španščini. Sistem samodejno prepozna jezik gosta glede na njihov telefon.",
          },
        },
      ],
    },
  ],
};

// ── SVG Feature Icons ─────────────────────────────────────────────────────────
function IconQR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h.01M14 17h.01M17 14h.01M20 14h.01M20 17v3M17 20h3M17 17h.01" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
    </svg>
  );
}
function IconWifi() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// ── QR Pattern (CSS-drawn) ────────────────────────────────────────────────────
function QRPattern() {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,0,1,1,0,1,0,1,1,0,0,1,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,1],
    [1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,1],
  ];
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(17, 1fr)`, width: 68, height: 68 }}>
      {cells.flat().map((v, i) => (
        <div key={i} style={{ backgroundColor: v ? '#0F1729' : 'transparent' }} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  // Server-side auth check so the mobile menu doesn't flash "Prijava"
  // while Clerk's client SDK is still booting. Desktop nav uses the
  // server-async HeaderAuthButtons component for the same reason.
  let signedIn = false;
  try {
    const session = await auth();
    signedIn = !!session.userId;
  } catch { /* Clerk hiccup — render as signed-out */ }
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#FFC94D]/30 bg-white/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-[1.03]">
            <GuestcamLogo size="sm" showMark={true} />
          </Link>
          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-gray-600">
            {[
              { href: "#how", label: "Kako deluje" },
              { href: "#templates", label: "Predloge" },
              { href: "#pricing", label: "Cenik" },
              { href: "/blog", label: "Blog" },
              { href: "#faq", label: "FAQ" },
            ].map((item) => {
              const isRoute = !item.href.startsWith("#");
              const className = "relative group py-1 transition-colors hover:text-[#0F1729]";
              const inner = (
                <>
                  {item.label}
                  <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-[#FFC94D] transition-all duration-300 ease-out group-hover:w-full" />
                </>
              );
              // Hash anchors stay as <a> (smooth scroll, no client transition needed).
              // Internal routes use <Link> so Next.js prefetches + does an RSC
              // navigation instead of a full document reload + Clerk re-hydration.
              return isRoute ? (
                <Link key={item.href} href={item.href} className={className}>{inner}</Link>
              ) : (
                <a key={item.href} href={item.href} className={className}>{inner}</a>
              );
            })}
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher current="sl" languages={HOME_HREFLANG} ariaLabel="Spremeni jezik" />
            <HeaderAuthButtons lang="sl" />
            {/* Hide the "create new gallery" CTA when the visitor is
                already signed in — UserButton + Nadzorna plošča link
                are the right entry points for an existing customer. */}
            {!signedIn && (
            <Link
              href="/dashboard/new"
              className="group hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)",
                boxShadow: "0 6px 18px rgba(255,201,77,0.45)",
                color: "#0F1729",
              }}
            >
              Začni brezplačno
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            )}
            <HomeMobileMenu
              signedIn={signedIn}
              lang="sl"
              links={[
                { href: "#how", label: "Kako deluje" },
                { href: "#templates", label: "Predloge" },
                { href: "#pricing", label: "Cenik" },
                { href: "#faq", label: "FAQ" },
                { href: "/contact", label: "Kontakt" },
              ]}
              labels={{
                open: "Odpri meni",
                close: "Zapri meni",
                language: "Jezik",
                languageAria: "Spremeni jezik",
                signIn: "Prijava",
                dashboard: "Nadzorna plošča",
                cta: "Začni brezplačno",
              }}
            />
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F2F4F8' }}>
        <div className="w-full">

          {/* H1 kept for SEO / screen readers — visible headline lives inside the hero image */}
          <h1 className="sr-only">
            Vaši najboljši trenutki. Na enem mestu. — Guestcam QR foto album za poroke in dogodke
          </h1>

          {/* Edge-to-edge hero image — desktop landscape, mobile portrait variant via <picture>.
              Contains the visible headline, 3-step story, and trust badges. */}
          <div className="overflow-hidden bg-white">
            <picture>
              <source media="(max-width: 640px)" srcSet="/hero/guestcam-hero-mobile.webp" />
              <img
                src="/hero/guestcam-hero.webp"
                alt="Vaši najboljši trenutki na enem mestu — gostje skenirajo QR kodo na poročni mizi in delijo fotografije v skupni album"
                className="block w-full h-auto"
                width={1672}
                height={941}
                fetchPriority="high"
              />
            </picture>
          </div>

          {/* CTA + note */}
          <div className="flex flex-col items-center text-center px-4 py-10 sm:py-16">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-[#0F1729] font-bold text-lg transition-all duration-200 hover:scale-[1.02]"
                style={{ background: '#FFC94D', boxShadow: '0 14px 40px rgba(255,201,77,0.45)' }}
              >
                Začni brezplačno zdaj
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <DemoButton variant="hero" />
            </div>
            <p className="mt-4 text-sm text-gray-400">Brez kreditne kartice • Pripravljeno v manj kot 2 minutah</p>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-20 pt-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">👫👫👫</span>
            <div>
              <p className="font-extrabold text-xl text-[#0F1729]">500+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">ustvarjenih galerij</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <div className="text-amber-400 text-base leading-none shrink-0">★★★★★</div>
            <div>
              <p className="font-extrabold text-xl text-[#C9820A]">5.0/5</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">na podlagi prvih ocen</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">📸</span>
            <div>
              <p className="font-extrabold text-xl text-[#0F1729]">25.000+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">zbranih fotografij</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Event types ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F1729] mb-4 leading-tight">Za vsak poseben trenutek</h2>
        <p className="text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
          Guestcam zbira fotografije vaših gostov — za poroke, rojstne dneve, baby shower, obletnice, poslovne zabave in vsak dogodek, ki si zasluži spomin.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {([
            { key: "wedding",     label: "Poroka",          bg: "linear-gradient(135deg,#fce7e9,#f9cdd2)" },
            { key: "birthday",    label: "Rojstni dan",     bg: "linear-gradient(135deg,#fef3c7,#fde68a)" },
            { key: "babyshower",  label: "Baby shower",     bg: "linear-gradient(135deg,#fce7f3,#f9a8d4)" },
            { key: "gromparty",   label: "Fantovščina",     bg: "linear-gradient(135deg,#1e2a3a,#2d3f55)" },
            { key: "party",       label: "Zabava",          bg: "linear-gradient(135deg,#f3e8ff,#d8b4fe)" },
            { key: "business",    label: "Poslovna zabava", bg: "linear-gradient(135deg,#f1f5f9,#cbd5e1)" },
            { key: "krst",        label: "Krst",            bg: "linear-gradient(135deg,#e0f2fe,#7dd3fc)" },
            { key: "matura",      label: "Matura",          bg: "linear-gradient(135deg,#dcfce7,#86efac)" },
          ] as const).map(({ key, label, bg }) => (
            <EventCard key={key} imgKey={key} label={label} bg={bg} />
          ))}
        </div>
      </section>

      {/* ── Print Templates ─────────────────────────────────────────────────── */}
      <section id="templates" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest" style={{ background: 'rgba(255,201,77,0.18)', color: '#C9820A' }}>
              Predloge za tisk
            </div>
            <h2 className="text-[2.5rem] font-extrabold text-[#0F1729] mb-4">Kartice, ki goste spodbudijo k deljenju fotografij</h2>
            <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
              Izberite predlogo, dodajte svojo QR kodo in jo natisnite. Več gostov sodeluje, več nepozabnih trenutkov se zbere v vaši galeriji.
            </p>
          </div>

          {/* 4-column template grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { name: 'Klasična',        bg: 'photo-1537633552985-df8429e8048b', headline: 'Capture the Love ♥',   sub: 'Skeniraj in deli',    rotate: -3, dark: false },
              { name: 'Botanična',       bg: 'photo-1523438885200-e635ba2c371e', headline: 'Deli naše spomine',    sub: 'Share the memories',  rotate:  2, dark: false },
              { name: 'Elegantna',       bg: 'photo-1606800052052-a08af7148866', headline: 'Thank You',            sub: 'Za skupne spomine',   rotate: -1, dark: false },
              { name: 'Cvetlična',       bg: 'photo-1515934751635-c81c6bc9a2d8', headline: 'Scan & Share',         sub: 'Brez aplikacije',     rotate:  2, dark: false },
              { name: 'Rustikalna',      bg: 'photo-1501286353178-1ec881214838', headline: 'Zberi spomine',        sub: 'Skeniraj QR kodo',    rotate: -2, dark: false },
              { name: 'Moderna',         bg: 'photo-1520854221256-17451cc331bf', headline: 'Our Memories',         sub: 'Scan to share',       rotate:  1, dark: true  },
              { name: 'Minimalistična',  bg: 'photo-1465495976277-4387d4b0b4c6', headline: 'Vaš dan',              sub: 'Dodaj fotografijo',   rotate: -2, dark: false },
              { name: 'Skandinavska',    bg: 'photo-1529634806980-85c3dd6d34ac', headline: 'Share the Love',       sub: 'Scan the QR code',    rotate:  2, dark: true  },
            ].map((t) => (
              <div key={t.name} className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                {/* Background photo */}
                <div className="relative" style={{ height: 300 }}>
                  <Image
                    src={`https://images.unsplash.com/${t.bg}?w=400&h=500&fit=crop&q=80`}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {/* Slight overlay */}
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.18)' }} />

                  {/* Card overlay — the template preview */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className={`${t.dark ? 'bg-[#0F1729] text-white' : 'bg-white/97 text-[#0F1729]'} rounded-xl p-4 shadow-2xl text-center`}
                      style={{ width: 130, transform: `rotate(${t.rotate}deg)` }}
                    >
                      <p className={`font-serif text-[11px] font-bold mb-0.5 leading-tight ${t.dark ? 'text-white' : 'text-[#0F1729]'}`}>
                        {t.headline}
                      </p>
                      <p className={`text-[8px] mb-2.5 ${t.dark ? 'text-white/60' : 'text-gray-400'}`}>{t.sub}</p>
                      {/* Tiny QR pattern */}
                      <div className="flex justify-center mb-2" style={{ transform: 'scale(0.48)', transformOrigin: 'center', height: 33, overflow: 'hidden' }}>
                        <QRPattern />
                      </div>
                      <p className={`font-serif text-[8px] italic ${t.dark ? 'text-[#f9a8c0]' : 'text-[#C9820A]'}`}>Ana & Marko</p>
                      {t.dark ? null : <div className="w-8 h-px bg-gray-200 mx-auto mt-1.5" />}
                      <p className={`text-[7px] mt-1 ${t.dark ? 'text-white/40' : 'text-gray-300'}`}>14. 06. 2025</p>
                    </div>
                  </div>

                  {/* Hover: CTA overlay */}
                  <div className="absolute inset-0 bg-[#FFC94D]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <p className="text-[#0F1729] font-bold text-sm">{t.name}</p>
                    <Link
                      href="/dashboard/new"
                      className="bg-white font-bold text-xs px-5 py-2.5 rounded-full transition-transform hover:scale-105"
                      style={{ color: '#0F1729' }}
                    >
                      Uporabi predlogo →
                    </Link>
                  </div>
                </div>

                {/* Name label */}
                <div className="px-3 py-2.5 bg-white flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F1729]">{t.name}</span>
                  <span className="text-[10px] text-[#C9820A] font-medium">PDF ↓</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-gray-400 mb-5">Vsaka predloga vključuje vaše ime, datum in personalizirano QR kodo</p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-200 border-2"
              style={{ borderColor: '#FFC94D', color: '#C9820A' }}
            >
              Ustvari galerijo in prenesi predloge →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how" style={{ background: '#0B1220' }} className="py-24 relative overflow-hidden">
        {/* Subtle petal decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFC94D, transparent)' }} />
        <div className="absolute bottom-20 right-16 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #FFC94D, transparent)' }} />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Section label */}
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#FFC94D' }}>
            Kako deluje
          </p>

          {/* Heading */}
          <h2 className="text-center font-extrabold text-white mb-5 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Enostavno za vas,<br />preprosto za goste
          </h2>
          <p className="text-center max-w-xl mx-auto leading-relaxed mb-16" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem' }}>
            V manj kot dveh minutah ustvarite zasebno galerijo, kjer se bodo zbirale vse fotografije in videe vašega dogodka.
          </p>

          {/* 3 large cards */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Card 1 — Sign Up */}
            <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: '#070A12' }}>
              {/* Photo area */}
              <div className="relative overflow-hidden" style={{ height: 280 }}>
                <Image
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=560&fit=crop&q=80"
                  alt="Ustvari galerijo"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(23,18,6,0.95) 100%)' }} />
                {/* Icon badge */}
                <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5" style={{ color: '#0B1220' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                {/* Step label over photo */}
                <div className="absolute bottom-4 left-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#FFC94D' }}>KORAK 01</p>
                </div>
              </div>
              {/* Text below */}
              <div className="p-6 flex-1">
                <h3 className="text-white font-extrabold text-2xl mb-3 leading-tight">Ustvarite galerijo</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }} className="text-sm">
                  Ustvarite svojo galerijo, izberite dizajn QR kartice in jo natisnite. Kartice postavite na mize ali ob vhod.
                </p>
              </div>
            </div>

            {/* Card 2 — Share QR */}
            <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: '#070A12' }}>
              <div className="relative overflow-hidden" style={{ height: 280 }}>
                <Image
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=560&fit=crop&q=80"
                  alt="Deli QR kodo"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(23,18,6,0.95) 100%)' }} />
                {/* Icon badge */}
                <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5" style={{ color: '#0B1220' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3M17 14v3h3M14 17h3" />
                  </svg>
                </div>
                <div className="absolute bottom-4 left-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#FFC94D' }}>KORAK 02</p>
                </div>
              </div>
              <div className="p-6 flex-1">
                <h3 className="text-white font-extrabold text-2xl mb-3 leading-tight">Gostje delijo fotografije</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }} className="text-sm">
                  Gostje preprosto skenirajo QR kodo in začnejo deliti fotografije ter videe v polni kakovosti. Brez aplikacije in brez prijave.
                </p>
              </div>
            </div>

            {/* Card 3 — Enjoy */}
            <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: '#070A12' }}>
              <div className="relative overflow-hidden" style={{ height: 280 }}>
                <Image
                  src="https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=560&fit=crop&q=80"
                  alt="Uživaj v fotografijah"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(23,18,6,0.95) 100%)' }} />
                {/* Icon badge */}
                <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5" style={{ color: '#0B1220' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                </div>
                <div className="absolute bottom-4 left-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#FFC94D' }}>KORAK 03</p>
                </div>
              </div>
              <div className="p-6 flex-1">
                <h3 className="text-white font-extrabold text-2xl mb-3 leading-tight">Uživajte v spominih</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }} className="text-sm">
                  Oglejte si vse fotografije in videe na enem mestu ter jih prenesite v polni kakovosti, kadar koli želite.
                </p>
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2.5 px-9 py-4 text-[#0F1729] font-bold rounded-full transition-all duration-200 hover:scale-105"
              style={{ background: '#FFC94D', boxShadow: '0 6px 24px rgba(255,201,77,0.45)' }}
            >
              Ustvari svojo galerijo zdaj →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why you need it ─────────────────────────────────────────────────── */}
      <section id="why" className="py-24" style={{ background: '#FFF9EC' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-4">Vsak gost fotografira. Vi pa teh slik nikoli ne vidite.</h2>
          <p className="text-center text-gray-400 text-base mb-14 max-w-md mx-auto">
            Vsak gost ujame drugačne trenutke. Večina teh fotografij pa ostane na njihovih telefonih.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📷", title: "Fotograf ne more biti povsod",            desc: "Gostje ujamejo spontane trenutke, ki jih profesionalni fotograf pogosto zamudi. Ravno ti neplanirani trenutki pogosto postanejo najlepši spomini." },
              { icon: "📱", title: "Fotografije ostanejo na telefonih",       desc: "Po dogodku so fotografije razpršene med telefoni, WhatsApp skupinami in družbenimi omrežji. Večine jih organizator nikoli ne prejme." },
              { icon: "👁",  title: "Doživite dogodek skozi oči svojih gostov", desc: "Oglejte si trenutke, ki ste jih morda zamudili, in sestavite celotno zgodbo dogodka iz vseh zornih kotov." },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#FFC94D]/50 transition-all duration-200">
                <div className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm" style={{ background: '#FFF3CC' }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#0F1729] text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-4">Zakaj izbrati Guestcam?</h2>
          <p className="text-center text-gray-500 mb-14 max-w-lg mx-auto leading-relaxed">
            Vse fotografije in videi vaših gostov. Na enem mestu.<br />
            <span className="text-gray-400">Brez aplikacij, brez pošiljanja po WhatsAppu in brez izgubljenih spominov.</span>
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { Icon: IconPhone,  title: "Brez aplikacije",            desc: "Gostje preprosto skenirajo QR kodo in začnejo deliti fotografije. Brez prenosa aplikacije, registracije ali prijave." },
              { Icon: IconGlobe,  title: "Več jezikov",                desc: "Vmesnik se samodejno prikaže v jeziku vaših gostov, zato lahko brez težav sodelujejo tudi mednarodni obiskovalci." },
              { Icon: IconLock,   title: "Popolna zasebnost",          desc: "Fotografije in videi so vidni samo vam in vašim gostom. Brez javnih galerij in brez neželenega deljenja." },
              { Icon: IconCamera, title: "Polna kakovost",             desc: "Vse fotografije in videi se shranijo v originalni kakovosti. Brez stiskanja in brez izgube podrobnosti." },
              { Icon: IconBolt,   title: "V živo med dogodkom",        desc: "Nove fotografije se prikazujejo takoj, ko jih gostje naložijo. Utrinke lahko spremljate že med samim dogodkom." },
              { Icon: IconQR,     title: "Prilagojeno vašemu dogodku", desc: "Izberite dizajn QR kartice, ki se ujema z vašim dogodkom, in ustvarite izkušnjo, ki bo videti kot del praznovanja." },
              { Icon: IconWifi,   title: "Brez skrbi za signal",       desc: "Ko gostje nimajo interneta, se fotografije samodejno shranijo v čakalno vrsto. Ko se signal vrne, se naložijo same – brez ponovnega iskanja." },
              { Icon: IconMail,   title: "Album vedno pri roki",       desc: "Po nalaganju si gostje pošljejo povezavo na e-pošto. Naslednji dan odprejo album direktno iz prejete pošte – brez QR kode." },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-2xl border border-gray-100 bg-white p-7 text-left transition-all duration-200 hover:border-[#FFC94D]/40 hover:shadow-[0_12px_36px_rgba(255,201,77,0.12)]"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-[#0F1729] transition-transform duration-200 group-hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #FFC94D 0%, #F0B429 100%)',
                    boxShadow: '0 10px 22px rgba(255,201,77,0.35)',
                  }}
                >
                  <Icon />
                </div>
                <h3 className="font-bold text-[#0F1729] text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-24" style={{ background: '#FFF9EC' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-14">Mnenja naših parov</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { text: "Noro dobra ideja! Dobila sva toliko spontanih fotografij, ki jih fotograf nikoli ne bi ujel. Gosti so bili navdušeni nad tem, kako enostavno je bilo.", name: "Tina & Luka",   date: "April 2026" },
              { text: "Postavili smo QR kodo na vsako mizo in že med večerjo smo imeli 200+ fotografij. Preprosto genijalno! Vsem priporočamo.", name: "Ana & Marko",   date: "Junij 2025" },
              { text: "Končno smo zbrali vse spomine na enem mestu. Gostje iz tujine so naložili fotografije v svojem jeziku brez kakršnih koli težav.", name: "Sara & David", date: "September 2025" },
            ].map((t) => (
              <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: 'rgba(255,201,77,0.20)' }}>💑</div>
                  <div>
                    <p className="font-bold text-sm text-[#0F1729]">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          {/* Meta Pixel funnel: ViewContent when the plans are seen */}
          <TrackViewContent name="Pricing" category="plans" />
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-4">Preprosti paketi</h2>
          <p className="text-center text-gray-400 mb-14">Izberite paket, ki ustreza vašemu dogodku.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">

            {/* FREE */}
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-7 flex flex-col opacity-80">
              <p className="font-extrabold text-lg text-gray-400 mb-1">Brezplačno</p>
              <p className="text-sm text-gray-400 mb-6">Preizkusite brez tveganja</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none text-gray-400">0€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Do 20 fotografij",
                  "1 videoposnetek",
                  "Dostop 30 dni",
                  "Brez varnostne kopije",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-400">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/new" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-gray-400 transition-colors bg-white hover:bg-gray-100" style={{ border: '1.5px solid #e5e7eb' }}>
                Začni brezplačno
              </Link>
            </div>

            {/* BASIC */}
            <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col">
              <p className="font-extrabold text-lg text-[#0F1729] mb-1">Basic</p>
              <p className="text-sm text-gray-400 mb-6">Za manjše dogodke</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none text-[#0F1729]">39€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">55€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Do 1000 fotografij",
                  "Do 10 videoposnetkov",
                  "Dostop do galerije 3 mesece",
                  "Prenos vseh slik (ZIP)",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/new?plan=basic" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#0F1729] transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #e5e7eb' }}>
                Izberi Basic
              </Link>
            </div>

            {/* PLUS — highlighted */}
            <div className="relative bg-white rounded-3xl p-7 flex flex-col" style={{ border: '2px solid #FFC94D', boxShadow: '0 8px 40px rgba(255,201,77,0.25)', transform: 'translateY(-8px)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#0F1729] text-[10px] font-bold tracking-widest uppercase px-5 py-1.5 rounded-full" style={{ background: '#FFC94D' }}>
                NAJBOLJ PRILJUBLJENO
              </div>
              <p className="font-extrabold text-lg text-[#0F1729] mb-1">Plus</p>
              <p className="text-sm text-gray-400 mb-6">Za večje dogodke in poroke</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none" style={{ color: '#C9820A' }}>49€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">69€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Neomejeno število gostov",
                  "Do 5000 fotografij",
                  "Do 100 videoposnetkov",
                  "Dostop do galerije 1 leto",
                  "Prenos vseh slik (ZIP)",
                  "Live galerija (projekcija)",
                  "Personalizirana stran z imeni",
                  "E-mail obvestila za par",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/new?plan=plus" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#0F1729] transition-colors" style={{ background: '#FFC94D' }}>
                Izberi Plus
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col">
              <p className="font-extrabold text-lg text-[#0F1729] mb-1">Premium</p>
              <p className="text-sm text-gray-400 mb-6">Za tiste, ki želite vse</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none text-[#0F1729]">99€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">149€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Neomejeno število gostov",
                  "Neomejeno fotografij",
                  "Do 100 videoposnetkov",
                  "Dostop do galerije 2 leti",
                  "Prenos vseh slik (ZIP)",
                  "Live galerija (projekcija)",
                  "Personalizirana stran z imeni",
                  "Lastna domena (foto.vase-ime.si)",
                  "Premium design predloge",
                  "Prioritetna podpora",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/new?plan=premium" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#0F1729] transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #e5e7eb' }}>
                Izberi Premium
              </Link>
            </div>
          </div>

          {/* Guarantee badge */}
          <div className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            30-dnevna garancija vračila denarja – brez vprašanj.
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24" style={{ background: '#FFF9EC' }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-12">Pogosta vprašanja</h2>
          <div className="space-y-3">
            {[
              { q: "Ali morajo gosti prenesti aplikacijo?",        a: "Ne. Gosti odprejo album direktno v brskalniku telefona — brez namestitve, brez prijave. Enostavno skenirajo QR kodo in takoj naložijo fotografijo." },
              { q: "Ali so fotografije zasebne?",                   a: "Da. Album je dostopen samo z vašo QR kodo ali povezavo. Po želji ga zaščitite z geslom za dodatno varnost." },
              { q: "V kakšni kakovosti se shranjujejo fotografije?", a: "V polni originalni ločljivosti, brez kakršnega koli stiskanja ali zmanjšanja kakovosti." },
              { q: "Ali podpirate videe?",                          a: "Pro in Premium paket podpirata nalaganje videov do 500 MB na posnetek." },
              { q: "Kaj se zgodi po dogodku?",                      a: "Album ostane aktiven toliko časa, kolikor traja vaš paket. Vse fotografije in videe lahko kadar koli prenesete kot ZIP arhiv ali jih shranite neposredno v Google Drive." },
              { q: "Kaj se zgodi, če gostje nimajo interneta med nalaganjem?", a: "Nič se ne izgubi. Aplikacija samodejno zazna, da ni signala, in fotografije shrani v čakalno vrsto. Ko se internet vrne — pa če je to čez minuto ali čez uro — se fotografije naložijo samodejno, brez da bi gost moral karkoli narediti." },
              { q: "Kaj če želi gost dodati fotografije po poroki, ko nima več QR kode?", a: "Po uspešnem nalaganju se na zaslonu pojavi možnost, da si gost pošlje povezavo do albuma na e-pošto. Naslednji dan — ali kadarkoli — odpre album direktno iz prejete pošte, brez QR kode in brez iskanja." },
            ].map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[#0F1729] list-none text-[0.95rem]">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 pt-1 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white text-center px-6">
        <h2 className="font-extrabold text-[#0F1729] mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>
          Doživite svoj dogodek skozi oči{' '}
          <span style={{ color: '#C9820A' }}>vseh svojih gostov</span>.
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">Vse fotografije in videi v polni kakovosti. Brez aplikacije, brez zapletov.</p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2.5 px-10 py-5 text-[#0F1729] font-bold text-lg rounded-full transition-all duration-200 shadow-2xl"
          style={{ background: '#FFC94D', boxShadow: '0 12px 32px rgba(255,201,77,0.45)' }}
        >
          Ustvari galerijo zdaj
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="mt-5 text-sm text-gray-400">Brez kreditne kartice • Pripravljeno v manj kot 2 minutah</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F1729] text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">

          {/* Top grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <div className="mb-3">
                <GuestcamLogo size="sm" showMark={true} variant="onDark" />
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-5">
                Poročna galerija s QR kodo — brez aplikacije. Gostje fotografirajo, vi zbirate spomine.
              </p>
              {/* Social */}
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/guest.cam" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/guestcam.si" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Produkt */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Produkt</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#how" className="hover:text-white transition-colors">Kako deluje</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Funkcionalnosti</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Cenik</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Pogosta vprašanja</a></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/dashboard/new" className="hover:text-white transition-colors">Ustvari album</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Prijava</Link></li>
                <li><Link href="/affiliate/apply" className="hover:text-white transition-colors">Partnerski program</Link></li>
              </ul>
            </div>

            {/* Vodniki — only the Slovenian guide + alternatives, so every
                footer label matches the page's language. */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Vodniki</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/sl/qr-koda-poroka" className="hover:text-white transition-colors">QR koda za poroko</Link></li>
                <li><Link href="/sl/alternative-aplikacije" className="hover:text-white transition-colors">Primerjava aplikacij</Link></li>
                <li><Link href="/sl/slike-s-poroke" className="hover:text-white transition-colors">Slike s poroke</Link></li>
                <li><Link href="/sl/qr-koda-za-poroko" className="hover:text-white transition-colors">QR koda za poroko (vodnik)</Link></li>
                <li><Link href="/sl/porocni-album" className="hover:text-white transition-colors">Poročni album</Link></li>
                <li><Link href="/sl/zbiranje-slik-s-poroke" className="hover:text-white transition-colors">Zbiranje slik s poroke</Link></li>
                <li><Link href="/sl/slike-z-rojstnega-dne" className="hover:text-white transition-colors">Slike z rojstnega dne</Link></li>
                <li><Link href="/sl/baby-shower-slike" className="hover:text-white transition-colors">Baby shower slike</Link></li>
              </ul>
            </div>

            {/* Pravno */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Pravno</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Zasebnost</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Pogoji uporabe</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Piškotki</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Vračilo denarja</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Guestcam · Sport group d.o.o. · Narejeno v Sloveniji by{" "}
              <a
                href="https://www.futurecode.si"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#FFC94D] hover:text-white transition-colors"
              >
                Futurecode.si
              </a>
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                SSL
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                GDPR
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Brez registracije za goste
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
