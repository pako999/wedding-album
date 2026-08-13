import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export const metadata: Metadata = {
  title: "Guestcam — design preview V2",
  description: "Druga premium editorialna smer za Guestcam.",
  robots: { index: false, follow: false },
};

const eventTiles = [
  { src: "/events/wedding.webp", label: "Poroke", className: "md:col-span-7 md:row-span-2 aspect-[4/3] md:aspect-auto" },
  { src: "/events/party.webp", label: "Zabave", className: "md:col-span-5 aspect-[16/10]" },
  { src: "/events/business.webp", label: "Poslovni dogodki", className: "md:col-span-5 aspect-[16/10]" },
];

const benefits = [
  ["Brez aplikacije", "QR koda odpre galerijo neposredno v brskalniku."],
  ["Brez registracije", "Gost lahko fotografijo odda takoj, brez računa."],
  ["Originalna kakovost", "Datoteke ostanejo v polni kakovosti za prenos po dogodku."],
  ["Zasebno", "Galerija ni javni socialni profil in jo lahko dodatno zaščitite."],
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
      <path d="M4 12h15M14 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QRMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <path fill="currentColor" d="M2 2h11v11H2V2Zm3 3v5h5V5H5Zm14-3h11v11H19V2Zm3 3v5h5V5h-5ZM2 19h11v11H2V19Zm3 3v5h5v-5H5Zm14-3h4v4h-4v-4Zm5 0h6v3h-3v3h-3v-6Zm-5 5h3v6h-3v-6Zm5 3h3v3h-3v-3Zm4-3h2v6h-2v-6Z" />
    </svg>
  );
}

export default function DesignPreviewV2() {
  return (
    <main className="min-h-screen bg-[#F1EFE9] text-[#161616] selection:bg-[#D8B66B]/40">
      <header className="border-b border-black/15 bg-[#F1EFE9]">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Guestcam" className="flex items-center">
            <GuestcamLogo size="sm" showMark />
          </Link>
          <nav className="hidden items-center gap-9 text-[13px] font-medium text-black/65 lg:flex">
            <a href="#why" className="hover:text-black">Zakaj Guestcam</a>
            <a href="#how" className="hover:text-black">Kako deluje</a>
            <a href="#events" className="hover:text-black">Dogodki</a>
            <a href="#pricing" className="hover:text-black">Cena</a>
          </nav>
          <Link href="/dashboard/new" className="inline-flex items-center gap-2 border-b border-black pb-1 text-[13px] font-semibold">
            Ustvari galerijo <Arrow />
          </Link>
        </div>
      </header>

      {/* HERO — typography first, photography second */}
      <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-11 sm:px-8 sm:pt-16 lg:px-12 lg:pb-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6127]">Fotografije gostov. Zbrane preprosto.</p>
            <h1 className="max-w-[1050px] font-serif text-[clamp(3rem,7.7vw,7.6rem)] leading-[0.88] tracking-[-0.045em]">
              Najboljše fotografije vašega dogodka so že na telefonih gostov.
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="max-w-md text-[17px] leading-7 text-black/62">
              Guestcam jih z eno QR kodo zbere v zasebno galerijo. Brez aplikacije, brez registracije in brez lovljenja fotografij po WhatsAppu po dogodku.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href="/dashboard/new" className="inline-flex items-center gap-2 bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white hover:bg-black">
                Ustvari brezplačno <Arrow />
              </Link>
              <a href="#how" className="text-sm font-semibold underline decoration-black/30 underline-offset-4">Kako deluje</a>
            </div>
          </div>
        </div>

        <div className="relative mt-12 aspect-[16/10] overflow-hidden bg-[#D9D5CC] sm:aspect-[16/8] lg:mt-16 lg:aspect-[16/7]">
          <Image src="/events/wedding.webp" alt="Poroka z gosti, ki ustvarjajo spontane fotografije" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute bottom-0 left-0 flex max-w-[460px] items-center gap-4 bg-[#F1EFE9] p-4 sm:p-5">
            <div className="shrink-0 text-[#8A6127]"><QRMark /></div>
            <p className="text-xs leading-5 text-black/65 sm:text-sm">Postavite QR na mizo. Gostje skenirajo, izberejo fotografije in jih takoj dodajo v vaš album.</p>
          </div>
        </div>

        <div className="grid border-b border-black/15 sm:grid-cols-3">
          {["Brez aplikacije", "Originalne datoteke", "Zasebna galerija"].map((item, i) => (
            <div key={item} className={`py-5 text-sm font-medium ${i > 0 ? "border-t border-black/15 sm:border-l sm:border-t-0 sm:pl-6" : ""}`}>{item}</div>
          ))}
        </div>
      </section>

      {/* Problem / positioning */}
      <section id="why" className="bg-[#171717] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:px-12 lg:py-32">
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D8B66B]">Problem po vsakem dogodku</p>
            <h2 className="mt-5 max-w-xl font-serif text-[clamp(2.8rem,5vw,5.2rem)] leading-[0.94] tracking-[-0.04em]">
              Fotografije obstajajo. Samo pri vas niso.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-14">
            <p className="max-w-2xl text-xl leading-8 text-white/72">
              Nekaj jih pristane v skupinskem chatu, nekaj na Instagramu, veliko pa jih ostane na telefonih. Organizator potem prosi, išče in shranjuje datoteke iz petih različnih mest.
            </p>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-white">
              Guestcam spremeni samo eno stvar: gostu omogoči, da fotografijo odda takoj, ko jo naredi — v pravo galerijo dogodka.
            </p>
          </div>
        </div>
      </section>

      {/* HOW — no cards, editorial rows */}
      <section id="how" className="bg-[#F1EFE9]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
          <div className="grid gap-7 border-b border-black/15 pb-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6127]">Kako deluje</p>
              <h2 className="font-serif text-[clamp(2.8rem,5.6vw,5.8rem)] leading-[0.92] tracking-[-0.04em]">Od QR kode do skupnega albuma v treh potezah.</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-black/60 lg:col-span-4 lg:col-start-9">Ni onboarding procesa za goste. Če znajo odpreti kamero telefona, znajo uporabljati Guestcam.</p>
          </div>

          {[
            ["01", "Ustvarite dogodek", "Guestcam pripravi zasebno galerijo in QR kodo, ki jo lahko natisnete ali pokažete na zaslonu."],
            ["02", "Gost skenira QR", "Odpre se mobilna stran dogodka. Gost izbere fotografije ali videe in jih naloži brez registracije."],
            ["03", "Vi dobite vse na enem mestu", "Fotografije se zbirajo skozi cel dogodek. Po njem jih prenesete skupaj, v originalni kakovosti."],
          ].map(([n, title, text]) => (
            <article key={n} className="grid gap-5 border-b border-black/15 py-8 sm:py-10 lg:grid-cols-12 lg:items-start">
              <div className="text-xs tabular-nums text-[#8A6127] lg:col-span-1">{n}</div>
              <h3 className="text-2xl font-semibold tracking-[-0.025em] lg:col-span-4">{title}</h3>
              <p className="max-w-2xl text-base leading-7 text-black/60 lg:col-span-6 lg:col-start-7">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Event collage */}
      <section id="events" className="bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
          <div className="mb-12 grid gap-7 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6127]">Ni samo za poroke</p>
              <h2 className="max-w-4xl font-serif text-[clamp(2.7rem,5vw,5rem)] leading-[0.94] tracking-[-0.04em]">Kjer se zgodi nekaj vrednega spomina, deluje ista QR koda.</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-black/60 lg:col-span-3 lg:col-start-10">Rojstni dnevi, poslovni dogodki, mature, baby showerji, obletnice in več.</p>
          </div>

          <div className="grid gap-4 md:auto-rows-[270px] md:grid-cols-12">
            {eventTiles.map((tile) => (
              <figure key={tile.label} className={`group relative overflow-hidden bg-[#DDD8CF] ${tile.className}`}>
                <Image src={tile.src} alt={tile.label} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.015]" />
                <figcaption className="absolute bottom-0 left-0 bg-white px-4 py-3 text-sm font-semibold">{tile.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Product details */}
      <section className="border-y border-black/15 bg-[#F1EFE9]">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:px-12 lg:py-32">
          <div className="lg:col-span-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A6127]">Narejeno za dejanski dogodek</p>
            <h2 className="font-serif text-[clamp(2.7rem,4.8vw,4.9rem)] leading-[0.95] tracking-[-0.04em]">Čim manj tehnologije med vami in spomini.</h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {benefits.map(([title, text]) => (
              <div key={title} className="grid gap-3 border-t border-black/15 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-black/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price */}
      <section id="pricing" className="bg-[#D8B66B] text-[#171717]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-12 lg:items-center lg:px-12">
          <div className="lg:col-span-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">Enkratno plačilo. Brez naročnine.</p>
            <h2 className="mt-4 max-w-4xl font-serif text-[clamp(3rem,5.8vw,6rem)] leading-[0.9] tracking-[-0.04em]">Začni brezplačno. Nadgradi samo, če dogodek to potrebuje.</h2>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="border-t border-black/25 pt-5">
              <div className="flex items-end justify-between gap-6">
                <span className="text-sm font-semibold">Najbolj priljubljen paket</span>
                <span className="font-serif text-5xl">49 €</span>
              </div>
              <p className="mt-5 text-sm leading-6 text-black/65">Za poroke in večje dogodke. Plačilo je enkratno, ne mesečno.</p>
              <Link href="/dashboard/new" className="mt-8 inline-flex items-center gap-2 bg-[#171717] px-6 py-4 text-sm font-semibold text-white hover:bg-black">
                Ustvari svoj dogodek <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#171717] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <GuestcamLogo size="sm" showMark />
          <p className="max-w-xl text-sm leading-6 text-white/55">Vsi spomini vašega dogodka, zbrani z eno QR kodo.</p>
          <div className="flex gap-6 text-xs text-white/55">
            <Link href="/privacy" className="hover:text-white">Zasebnost</Link>
            <Link href="/contact" className="hover:text-white">Kontakt</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
