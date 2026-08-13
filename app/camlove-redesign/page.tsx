import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WallMiniDemo } from "@/components/WallMiniDemo";

export const metadata: Metadata = {
  title: "CamLove — QR album za dogodke",
  description: "Vse fotografije in videi gostov v enem zasebnem QR albumu.",
  robots: { index: false, follow: false },
};

const moments = [
  { src: "/events/wedding.webp", label: "Poroke" },
  { src: "/events/birthday.webp", label: "Rojstni dnevi" },
  { src: "/events/babyshower.webp", label: "Baby shower" },
  { src: "/events/party.webp", label: "Zabave" },
  { src: "/events/matura.webp", label: "Mature" },
  { src: "/events/krst.webp", label: "Krsti" },
  { src: "/events/gromparty.webp", label: "Fantovščine" },
  { src: "/events/business.webp", label: "Poslovni dogodki" },
];

const features = [
  ["Brez aplikacije", "Gost samo skenira QR kodo in naloži fotografije ali videe."],
  ["Originalna kakovost", "Brez kompresije in brez izgubljanja kakovosti po klepetih."],
  ["Zasebna galerija", "Vse je zbrano na enem mestu in dostopno samo prek povezave."],
  ["Live Photo Wall", "Nove fotografije se v nekaj sekundah pokažejo na TV ali projektorju."],
  ["Prenos naenkrat", "Po dogodku preneseš celoten album z enim klikom."],
  ["QR kartice za tisk", "QR kodo postaviš na mize, vhod, vabilo ali veliki zaslon."],
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CamLoveRedesignPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] text-[#111111]">
      <header className="sticky top-0 z-50 border-b border-black/8 bg-[#FFFDF7]/95 backdrop-blur-md">
        <nav className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="relative block h-[46px] w-[158px] sm:h-[52px] sm:w-[180px]" aria-label="CamLove">
            <Image src="/camlove-logo-black-yellow.svg" alt="CamLove" fill priority className="object-contain object-left" />
          </Link>
          <div className="hidden items-center gap-7 text-sm font-semibold text-black/60 md:flex">
            <a href="#how" className="hover:text-black">Kako deluje</a>
            <a href="#events" className="hover:text-black">Dogodki</a>
            <a href="#wall" className="hover:text-black">Live Wall</a>
            <a href="#business" className="hover:text-black">Za podjetja</a>
            <a href="#features" className="hover:text-black">Funkcije</a>
          </div>
          <Link href="/dashboard/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white hover:-translate-y-0.5 transition-transform">
            Ustvari album <Arrow />
          </Link>
        </nav>
      </header>

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.15em] text-black/55">QR album za vsak dogodek</span>
            <h1 className="mt-6 max-w-[650px] text-[clamp(3rem,6.5vw,6.4rem)] font-black leading-[.92] tracking-[-0.06em]">
              Vse fotografije gostov.
              <span className="block text-[#F4B400]">En sam album.</span>
            </h1>
            <p className="mt-7 max-w-[600px] text-lg leading-8 text-black/60 sm:text-xl">
              Ustvari dogodek, deli QR kodo in gostje sami naložijo fotografije ter videe v tvojo zasebno galerijo — brez aplikacije in brez registracije.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/new" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#F4B400] px-8 font-extrabold text-black hover:-translate-y-0.5 transition-transform">Začni brezplačno <Arrow /></Link>
              <Link href="/demo" className="inline-flex min-h-14 items-center justify-center rounded-full border border-black/15 bg-white px-7 font-bold">Poglej demo</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-black/50">
              <span>✓ brez kreditne kartice</span><span>✓ pripravljeno v 2 minutah</span><span>✓ iPhone + Android</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="relative col-span-8 row-span-2 min-h-[520px] overflow-hidden rounded-[28px] bg-black sm:min-h-[660px]">
              <Image src="/events/wedding.webp" alt="Resnična fotografija z dogodka" fill priority className="object-cover" sizes="55vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-sm font-bold">Resnični trenutki. Vsi na enem mestu.</div>
            </div>
            <div className="relative col-span-4 min-h-[250px] overflow-hidden rounded-[22px] sm:min-h-[320px]"><Image src="/events/babyshower.webp" alt="Baby shower" fill className="object-cover" sizes="25vw" /></div>
            <div className="relative col-span-4 min-h-[250px] overflow-hidden rounded-[22px] sm:min-h-[320px]"><Image src="/events/birthday.webp" alt="Rojstni dan" fill className="object-cover" sizes="25vw" /></div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/8 bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-3 px-5 py-6 text-center text-sm font-bold text-black/55 sm:grid-cols-4 sm:px-8">
          <span>Brez aplikacije</span><span>Fotografije + videi</span><span>Originalna kakovost</span><span>Zasebna galerija</span>
        </div>
      </section>

      <section id="how" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="max-w-[780px]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9A7100]">Kako deluje</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-6xl">Tri koraki. To je vse.</h2>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              ["01", "Ustvari dogodek", "V nekaj klikih dobiš zasebno galerijo, QR kodo in povezavo za goste."],
              ["02", "QR kodo postavi na dogodek", "Na mize, vhod, vabilo ali zaslon. Gostje jo skenirajo s kamero telefona."],
              ["03", "Gostje nalagajo, ti dobiš vse", "Fotografije in videi se zbirajo v tvojem albumu sproti, pripravljeni za ogled in prenos."],
            ].map(([no,title,text]) => (
              <div key={no} className="rounded-[26px] border border-black/10 bg-white p-7 sm:p-9">
                <span className="text-sm font-black text-[#F4B400]">{no}</span>
                <h3 className="mt-8 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-black/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="bg-black py-24 text-white sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F4B400]">Za vsak poseben dan</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-6xl">Ne uporabljamo umetnih stock trenutkov.</h2>
            </div>
            <p className="max-w-[530px] text-lg leading-8 text-white/55">Pravi dogodki izgledajo bolj pristno. Zato je CamLove zgrajen okoli resničnih fotografij gostov in resničnih spominov.</p>
          </div>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {moments.map((m) => (
              <div key={m.label} className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/5">
                <Image src={m.src} alt={m.label} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" sizes="25vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 text-xl font-black">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="wall" className="bg-[#F4B400] py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/55">Live Photo Wall</p>
            <h2 className="mt-4 text-4xl font-black leading-[.98] tracking-[-0.05em] sm:text-6xl">Fotografije gostov takoj na velikem zaslonu.</h2>
            <p className="mt-6 text-lg leading-8 text-black/65">Odpri CamLove na TV ali projektorju. Ko gost naloži novo fotografijo, se v nekaj sekundah pojavi na zaslonu in postane del dogodka.</p>
            <Link href="/dashboard/new" className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-black px-7 font-bold text-white">Preizkusi brezplačno <Arrow /></Link>
          </div>
          <div className="rounded-[28px] bg-[#DBA000] p-3 sm:p-5"><WallMiniDemo label="CAMLOVE LIVE" /></div>
        </div>
      </section>

      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="max-w-[760px]"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#9A7100]">Vse kar potrebuješ</p><h2 className="mt-4 text-4xl font-black tracking-[-0.045em] sm:text-6xl">Preprosto za goste. Močno za organizatorja.</h2></div>
          <div className="mt-14 grid border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title,text]) => <div key={title} className="border-b border-black/10 p-7 sm:border-r sm:p-9"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-black/55">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section id="business" className="bg-[#171717] py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[480px] overflow-hidden rounded-[28px] sm:min-h-[600px]"><Image src="/events/business.webp" alt="CamLove za podjetja in poslovne dogodke" fill className="object-cover" sizes="50vw" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /></div>
          <div className="lg:pl-10">
            <span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-black">CamLove za podjetja</span>
            <h2 className="mt-6 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl">Naj gostje ustvarijo vsebino za vaš dogodek.</h2>
            <p className="mt-6 text-lg leading-8 text-white/60">Za konference, promocije, sejme, poslovna praznovanja in agencije. Zberite UGC fotografije in videe udeležencev prek QR kode ter jih prikažite v živo na velikem zaslonu.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 text-sm font-semibold text-white/70">
              <span>✓ lastna grafična podoba dogodka</span><span>✓ Live Photo Wall</span><span>✓ zbiranje vsebin udeležencev</span><span>✓ enostaven prenos vseh datotek</span>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/contact" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#F4B400] px-8 font-extrabold text-black">Ponudba za podjetja <Arrow /></Link><Link href="/dashboard/new" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-7 font-bold">Preizkusi demo</Link></div>
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1180px] px-5 text-center sm:px-8">
          <Image src="/camlove-logo-black-yellow.svg" alt="CamLove" width={260} height={80} className="mx-auto h-auto w-[220px] sm:w-[260px]" />
          <h2 className="mx-auto mt-8 max-w-[850px] text-4xl font-black leading-[1] tracking-[-.05em] sm:text-6xl">Tvoji gostje že fotografirajo. Poskrbi, da fotografije pridejo tudi do tebe.</h2>
          <p className="mx-auto mt-6 max-w-[650px] text-lg leading-8 text-black/55">Ustvari svoj QR album v nekaj minutah in preizkusi CamLove brezplačno.</p>
          <Link href="/dashboard/new" className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-[#F4B400] px-9 font-extrabold text-black">Ustvari svoj album <Arrow /></Link>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-[#111111] text-white">
        <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div><Image src="/camlove-logo-black-yellow.svg" alt="CamLove" width={200} height={62} className="brightness-0 invert" /><p className="mt-5 max-w-[340px] leading-7 text-white/50">QR album za poroke, rojstne dneve, baby showerje, zabave in poslovne dogodke. Brez aplikacije za goste.</p><p className="mt-5 text-sm font-bold text-[#F4B400]">camlove.me</p></div>
            <div><h3 className="font-black">Produkt</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><a href="#how">Kako deluje</a><a href="#wall">Live Photo Wall</a><a href="#events">Dogodki</a><a href="#features">Funkcije</a></div></div>
            <div><h3 className="font-black">Za uporabnike</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/dashboard/new">Ustvari album</Link><Link href="/dashboard">Moj račun</Link><Link href="/contact">Kontakt</Link><a href="#business">Za podjetja</a></div></div>
            <div><h3 className="font-black">Pravno</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/privacy">Zasebnost</Link><Link href="/terms">Pogoji uporabe</Link><Link href="/cookies">Piškotki</Link><Link href="/gdpr">GDPR</Link></div></div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 CamLove. Vse pravice pridržane.</span><span>Every camera. One story.</span></div>
        </div>
      </footer>
    </main>
  );
}
