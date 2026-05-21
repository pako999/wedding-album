import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { DemoButton } from "@/components/DemoButton";
import { HomeMobileMenu } from "@/components/HomeMobileMenu";
import { LanguageSwitcher, HOME_HREFLANG } from "@/components/LanguageSwitcher";

export const metadata: Metadata = {
  alternates: { canonical: "https://guestcam.si" },
};

// Structured data — helps search engines understand the brand & product.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://guestcam.si/#organization",
      name: "Guestcam",
      url: "https://guestcam.si",
      logo: "https://guestcam.si/icon-512.png",
    },
    {
      "@type": "WebSite",
      "@id": "https://guestcam.si/#website",
      name: "Guestcam",
      url: "https://guestcam.si",
      inLanguage: "sl-SI",
      publisher: { "@id": "https://guestcam.si/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      name: "Guestcam",
      applicationCategory: "PhotographyApplication",
      operatingSystem: "Web",
      url: "https://guestcam.si",
      description:
        "Z eno QR kodo zberite vse fotografije in videe gostov v eni zasebni galeriji.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Announcement bar ─────────────────────────────────────────────────── */}
      <div className="text-[#0F1729] text-center text-xs font-semibold py-2.5 px-4" style={{ background: '#FFC94D' }}>
        Ustvarite galerijo danes — <strong>brezplačno za vedno!</strong> 🎉{' '}
        <Link href="/dashboard/new" className="underline font-bold ml-2">Začni zdaj →</Link>
      </div>

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
              { href: "#faq", label: "FAQ" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative group py-1 transition-colors hover:text-[#0F1729]"
              >
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-[#FFC94D] transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher current="sl" languages={HOME_HREFLANG} ariaLabel="Spremeni jezik" />
            <Link
              href="/dashboard"
              className="hidden sm:block text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors"
            >
              Prijava
            </Link>
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
            <HomeMobileMenu />
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F2F4F8' }}>
        <div className="max-w-7xl mx-auto px-8 py-16 xl:py-24">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── LEFT: Text content ─────────────────────────────────────── */}
            <div>

              {/* Avatar stack + social proof */}
              <div className="flex items-center gap-3 mb-7">
                <div className="flex -space-x-2.5">
                  {['#FFC94D','#F0B429','#E8A800','#FFD966','#C9820A'].map((bg, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-[2.5px] flex items-center justify-center text-[11px] font-bold text-[#0F1729] shrink-0" style={{ background: bg, borderColor: '#F2F4F8' }}>
                      {['T','A','S','D','M'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Zaupalo nam <span className="font-bold text-[#0F1729]">500+</span> parov &amp; organizatorjev</p>
              </div>

              {/* Small eyebrow label */}
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-5">
                QR koda za poroke · rojstne dneve · obletnice · baby shower
              </p>

              {/* Headline */}
              <h1 className="font-extrabold leading-[1.15] tracking-tight text-[#0F1729] mb-8" style={{ fontSize: 'clamp(1.9rem, 3.6vw, 3.15rem)' }}>
                Fotografije, ki jih sicer{' '}
                <span style={{ color: '#C9820A' }}>nikoli ne bi videli</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-[500px]">
                Zberite vse fotografije in videe svojih gostov v eni zasebni galeriji.
                Gostje samo skenirajo QR kodo in delijo svoje utrinke v nekaj sekundah.
              </p>

              {/* Mobile hero collage — desktop shows the full collage on the right;
                  mobile gets this compact version of the same 3-image story. */}
              <div className="lg:hidden relative mx-auto mb-10 select-none" style={{ height: 330, maxWidth: 380 }}>
                {/* scan — main */}
                <div className="absolute rounded-2xl overflow-hidden shadow-xl" style={{ top: 18, left: 0, width: "58%", aspectRatio: "4 / 5", transform: "rotate(-4deg)", zIndex: 20 }}>
                  <img src="/hero/scan.webp" alt="Skeniranje QR kartice s telefonom" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2.5 left-2.5 bg-white rounded-xl shadow-md px-2.5 py-1.5 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] font-bold text-[#0F1729]">Polna kakovost</p>
                  </div>
                </div>
                {/* gallery — top right */}
                <div className="absolute rounded-2xl overflow-hidden shadow-lg" style={{ top: 0, right: 0, width: "43%", aspectRatio: "4 / 5", transform: "rotate(5deg)", zIndex: 30 }}>
                  <img src="/hero/gallery.webp" alt="Galerija fotografij v živo" className="w-full h-full object-cover" />
                </div>
                {/* cards — bottom right */}
                <div className="absolute rounded-2xl overflow-hidden shadow-xl" style={{ bottom: 0, right: 8, width: "46%", aspectRatio: "1 / 1", transform: "rotate(4deg)", zIndex: 30 }}>
                  <img src="/hero/cards.webp" alt="Natisnjene QR kartice na poročni mizi" className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 bg-white rounded-xl shadow-md px-2.5 py-1.5 flex items-center gap-1.5">
                    <svg className="w-3 h-3" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
                    </svg>
                    <p className="text-[10px] font-bold text-[#0F1729]">Brez aplikacije</p>
                  </div>
                </div>
              </div>

              {/* 3-step mini icons — wedtrove style */}
              <div className="flex items-start gap-10 mb-12">
                {[
                  {
                    label: 'Gostje slikajo',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Skenirajo QR',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Naložijo fotografije',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    ),
                  },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-2.5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,201,77,0.18)', color: '#C9820A' }}>
                      {icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-500 text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Large pill CTA + demo */}
              <div className="flex flex-wrap items-center gap-4">
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

            {/* ── RIGHT: Hero image story — scan → live gallery → printed cards ──
                 Images live in public/hero/ (WebP): scan.webp (4:5),
                 gallery.webp (4:5), cards.webp (1:1). ─────────────────────────── */}
            <div className="hidden lg:block relative select-none" style={{ height: 600 }}>

              {/* 1 — Scan moment (dominant, biggest) */}
              <div className="absolute rounded-3xl overflow-hidden shadow-2xl" style={{ top: 56, left: 0, width: 372, height: 466, transform: 'rotate(-5deg)', zIndex: 20 }}>
                <img src="/hero/scan.webp" alt="Skeniranje QR kartice s telefonom" className="w-full h-full object-cover" />
                {/* Polna kakovost — labels the scan/photo quality */}
                <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-bold text-[#0F1729]">Polna kakovost</p>
                </div>
              </div>

              {/* 2 — Live gallery (top-right, smaller) */}
              <div className="absolute rounded-2xl overflow-hidden shadow-xl" style={{ top: 0, right: 0, width: 244, height: 304, transform: 'rotate(5deg)', zIndex: 30 }}>
                <img src="/hero/gallery.webp" alt="Galerija fotografij v živo" className="w-full h-full object-cover" />
              </div>

              {/* +183 fotografij — labels the live gallery */}
              <div className="absolute bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3" style={{ top: 264, right: 150, zIndex: 40 }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,201,77,0.18)' }}>
                  <svg className="w-4 h-4" style={{ color: '#C9820A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F1729]">+183 fotografij</p>
                  <p className="text-[10px] text-gray-400">v živo · danes</p>
                </div>
              </div>

              {/* 3 — Printed cards (bottom-right, smaller) */}
              <div className="absolute rounded-2xl overflow-hidden shadow-2xl" style={{ bottom: 20, right: 24, width: 252, height: 252, transform: 'rotate(4deg)', zIndex: 30 }}>
                <img src="/hero/cards.webp" alt="Natisnjene QR kartice na poročni mizi" className="w-full h-full object-cover" />
                {/* Brez aplikacije — labels the printed cards */}
                <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-lg px-3.5 py-2 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" style={{ color: '#C9820A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
                  </svg>
                  <p className="text-xs font-bold text-[#0F1729]">Brez aplikacije</p>
                </div>
              </div>

            </div>
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
                  <img
                    src={`https://images.unsplash.com/${t.bg}?w=400&h=500&fit=crop&q=80`}
                    alt={t.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                <img
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=560&fit=crop&q=80"
                  alt="Ustvari galerijo"
                  className="w-full h-full object-cover"
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
                <img
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=560&fit=crop&q=80"
                  alt="Deli QR kodo"
                  className="w-full h-full object-cover"
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
                <img
                  src="https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=560&fit=crop&q=80"
                  alt="Uživaj v fotografijah"
                  className="w-full h-full object-cover"
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
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-gray-400 transition-colors bg-white hover:bg-gray-100" style={{ border: '1.5px solid #e5e7eb' }}>
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
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#0F1729] transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #e5e7eb' }}>
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
                  "Neomejeno fotografij",
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
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#0F1729] transition-colors" style={{ background: '#FFC94D' }}>
                Izberi Plus
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="bg-white border border-gray-200 rounded-3xl p-7 flex flex-col">
              <p className="font-extrabold text-lg text-[#0F1729] mb-1">Premium</p>
              <p className="text-sm text-gray-400 mb-6">Za tiste, ki želite vse</p>
              <div className="flex items-end gap-2 mb-7">
                <span className="font-extrabold text-[3rem] leading-none text-[#0F1729]">79€</span>
                <span className="text-gray-300 line-through text-lg mb-1.5">109€</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  "Unikatna QR koda",
                  "Neomejeno število gostov",
                  "Neomejeno fotografij",
                  "Do 100 videoposnetkov",
                  "Dostop do galerije 1 leto",
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
              <Link href="/dashboard" className="block text-center py-3.5 rounded-2xl font-bold text-sm text-[#0F1729] transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #e5e7eb' }}>
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
                <a href="https://www.instagram.com/guestcam.si" aria-label="Instagram" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/guestcam.si" aria-label="Facebook" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://www.pinterest.com/guestcam" aria-label="Pinterest" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
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
                <li><Link href="/dashboard/new" className="hover:text-white transition-colors">Ustvari album</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Prijava</Link></li>
              </ul>
            </div>

            {/* Vodniki — only the Slovenian guide + alternatives, so every
                footer label matches the page's language. */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Vodniki</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/sl/qr-koda-poroka" className="hover:text-white transition-colors">QR koda za poroko</Link></li>
                <li><Link href="/sl/alternative-aplikacije" className="hover:text-white transition-colors">Primerjava aplikacij</Link></li>
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
                <li><a href="mailto:hello@guestcam.si" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Guestcam · Sport group d.o.o.
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
