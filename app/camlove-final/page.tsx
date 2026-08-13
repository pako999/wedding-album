import Image from "next/image";
import Link from "next/link";
import { WallMiniDemo } from "@/components/WallMiniDemo";

const photos = [
  "/events/T+ I-2497.JPG",
  "/events/IMG_5525.jpeg",
  "/events/IMG_0989.JPG",
  "/events/IMG_0850.jpg",
  "/events/07A2F0EC-1672-4735-B336-F275E78542FD.JPG",
  "/events/8DCDAFD6-CB9A-4DBE-B814-A5C5BBAE869C.JPG",
  "/events/IMG_3133.JPG",
  "/events/IMG_4554.JPG",
  "/events/IMG_5546.jpeg",
  "/events/IMG_6363.jpeg",
  "/events/kim-bd-party (95).JPEG",
];

const plans = [
  { name: "Free", price: "0 €", desc: "Preizkusi pred nakupom", features: ["Do 20 fotografij", "30 dni dostopa", "QR koda", "Zasebna galerija"] },
  { name: "Basic", price: "39 €", desc: "Za manjše dogodke", features: ["Do 300 fotografij", "Fotografije v polni kakovosti", "Prenos ZIP", "3 mesece dostopa"] },
  { name: "Plus", price: "49 €", desc: "Najbolj priljubljen", featured: true, features: ["Do 1000 fotografij + videi", "Polna kakovost", "Live Photo Wall", "ZIP prenos", "1 leto dostopa"] },
  { name: "Premium", price: "99 €", desc: "Za večje dogodke", features: ["Neomejeno fotografij + videi", "Live Photo Wall", "Premium QR dizajni", "1 leto dostopa", "Prednostna podpora"] },
];

function Arrow() {
  return <span aria-hidden>→</span>;
}

export default function CamLoveFinalPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] text-[#111]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FFFDF7]/95 backdrop-blur">
        <nav className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="relative h-[48px] w-[185px] sm:w-[220px]">
            <Image src="/camlove-black-yellow-logo.svg" alt="CamLove" fill priority className="object-contain object-left" />
          </Link>
          <div className="hidden gap-7 text-sm font-semibold text-black/60 lg:flex">
            <a href="#how">Kako deluje</a><a href="#events">Dogodki</a><a href="#wall">Live Wall</a><a href="#pricing">Cenik</a><a href="#business">Za podjetja</a>
          </div>
          <Link href="/dashboard/new" className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white">Ustvari album</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-20">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">QR album za dogodke</p>
          <h1 className="mt-5 text-[clamp(3rem,6vw,6.3rem)] font-black leading-[.92] tracking-[-.06em]">Vse fotografije gostov.<span className="block text-[#F4B400]">En sam album.</span></h1>
          <p className="mt-7 max-w-[620px] text-lg leading-8 text-black/60 sm:text-xl">Gostje skenirajo QR kodo in naložijo fotografije ter videe v tvojo zasebno galerijo. Brez aplikacije. Brez registracije. V polni kakovosti.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/new" className="rounded-full bg-[#F4B400] px-8 py-4 text-center font-black">Začni brezplačno <Arrow /></Link><Link href="/demo" className="rounded-full border border-black/15 bg-white px-8 py-4 text-center font-bold">Poglej demo</Link></div>
          <p className="mt-5 text-sm font-semibold text-black/45">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>
        </div>
        <div className="grid grid-cols-12 gap-3">
          <div className="relative col-span-8 min-h-[620px] overflow-hidden rounded-[30px]"><Image src={photos[0]} alt="CamLove real event" fill priority sizes="(max-width:1024px) 70vw, 45vw" className="object-cover" /></div>
          <div className="relative col-span-4 min-h-[300px] overflow-hidden rounded-[24px]"><Image src={photos[1]} alt="Real event moment" fill sizes="25vw" className="object-cover" /></div>
          <div className="relative col-span-4 min-h-[300px] overflow-hidden rounded-[24px]"><Image src={photos[2]} alt="Real event moment" fill sizes="25vw" className="object-cover" /></div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white"><div className="mx-auto grid max-w-[1320px] gap-3 px-5 py-6 text-center text-sm font-bold text-black/55 sm:grid-cols-4 sm:px-8"><span>Brez aplikacije</span><span>Fotografije + videi</span><span>Originalna kakovost</span><span>Zasebna galerija</span></div></section>

      <section id="how" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Kako deluje</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Tri koraki. To je vse.</h2><div className="mt-12 grid gap-4 lg:grid-cols-3">{[["01","Ustvari dogodek","Dobiš zasebno galerijo, QR kodo in povezavo za goste."],["02","QR kodo postavi na dogodek","Na mize, vhod, vabilo ali velik zaslon."],["03","Gostje nalagajo","Fotografije in videi se sproti zbirajo v tvojem albumu."]].map(([n,t,d])=><div key={n} className="rounded-[26px] border border-black/10 bg-white p-8"><span className="font-black text-[#F4B400]">{n}</span><h3 className="mt-7 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></div>)}</div></section>

      <section id="events" className="bg-black py-24 text-white"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#F4B400]">Pravi dogodki. Prave fotografije.</p><h2 className="mt-4 max-w-[850px] text-4xl font-black tracking-[-.04em] sm:text-6xl">CamLove je za vsak trenutek, ki ga želite obdržati.</h2><div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{photos.slice(3).map((src,i)=><div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[22px]"><Image src={src} alt={`Real event ${i+1}`} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover" /></div>)}</div></div></section>

      <section id="wall" className="bg-[#F4B400] py-24"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-black/55">Live Photo Wall</p><h2 className="mt-4 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl">Fotografije gostov takoj na velikem zaslonu.</h2><p className="mt-6 text-lg leading-8 text-black/65">Odpri CamLove na TV ali projektorju. Nova fotografija se po nalaganju pojavi v nekaj sekundah.</p></div><div className="rounded-[28px] bg-[#DDA600] p-4"><WallMiniDemo label="CAMLOVE LIVE" /></div></div></section>

      <section id="pricing" className="py-24 sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><div className="mx-auto max-w-[780px] text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Enkratno plačilo. Brez naročnine.</p><h2 className="mt-4 text-4xl font-black tracking-[-.045em] sm:text-6xl">Izberi paket za svoj dogodek.</h2><p className="mt-5 text-lg text-black/55">Začni brezplačno in nadgradi šele, ko potrebuješ več.</p></div><div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{plans.map(p=><div key={p.name} className={`relative flex flex-col rounded-[28px] p-7 ${p.featured?'bg-black text-white ring-4 ring-[#F4B400]':'border border-black/10 bg-white'}`}>{p.featured&&<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F4B400] px-4 py-1 text-xs font-black uppercase text-black">Najbolj priljubljen</span>}<p className={`text-sm font-black uppercase tracking-[.14em] ${p.featured?'text-[#F4B400]':'text-black/45'}`}>{p.name}</p><div className="mt-5 text-5xl font-black tracking-[-.05em]">{p.price}</div><p className={`mt-2 text-sm ${p.featured?'text-white/55':'text-black/50'}`}>{p.desc}</p><div className="mt-7 flex flex-1 flex-col gap-3 text-sm">{p.features.map(f=><span key={f}>✓ {f}</span>)}</div><Link href="/dashboard/new" className={`mt-8 rounded-full px-5 py-3 text-center font-black ${p.featured?'bg-[#F4B400] text-black':'bg-black text-white'}`}>{p.name==='Free'?'Preizkusi brezplačno':'Izberi paket'}</Link></div>)}</div></div></section>

      <section id="business" className="bg-[#171717] py-24 text-white"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="relative min-h-[520px] overflow-hidden rounded-[28px]"><Image src={photos[9]} alt="CamLove for business events" fill sizes="50vw" className="object-cover" /></div><div className="lg:pl-8"><span className="rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">CamLove za podjetja</span><h2 className="mt-6 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl">Naj udeleženci ustvarijo vsebino za vaš dogodek.</h2><p className="mt-6 text-lg leading-8 text-white/60">Za konference, promocije, sejme, poslovna praznovanja in agencije. Zbirajte UGC fotografije in videe prek QR kode in jih prikažite v živo.</p><div className="mt-8 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2"><span>✓ lastna grafična podoba</span><span>✓ Live Photo Wall</span><span>✓ QR zbiranje vsebin</span><span>✓ enostaven prenos datotek</span></div><Link href="/contact" className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Ponudba za podjetja <Arrow /></Link></div></div></section>

      <footer className="bg-black text-white"><div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8"><div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]"><div><div className="relative h-[54px] w-[210px]"><Image src="/camlove-black-yellow-logo.svg" alt="CamLove" fill className="object-contain object-left" /></div><p className="mt-5 max-w-[340px] leading-7 text-white/50">QR album za poroke, rojstne dneve, baby showerje, zabave in poslovne dogodke.</p><p className="mt-5 font-bold text-[#F4B400]">camlove.me</p></div><div><h3 className="font-black">Produkt</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><a href="#how">Kako deluje</a><a href="#wall">Live Wall</a><a href="#pricing">Cenik</a></div></div><div><h3 className="font-black">Uporabniki</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/dashboard/new">Ustvari album</Link><Link href="/dashboard">Moj račun</Link><Link href="/contact">Kontakt</Link><a href="#business">Za podjetja</a></div></div><div><h3 className="font-black">Pravno</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/privacy">Zasebnost</Link><Link href="/terms">Pogoji uporabe</Link><Link href="/cookies">Piškotki</Link><Link href="/gdpr">GDPR</Link></div></div></div><div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">© 2026 CamLove. Every camera. One story.</div></div></footer>
    </main>
  );
}
