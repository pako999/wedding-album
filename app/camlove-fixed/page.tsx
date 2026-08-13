import Image from "next/image";
import Link from "next/link";
import { WallMiniDemo } from "@/components/WallMiniDemo";

const events = [
  ["/events/T+ I-2497.JPG", "Poroke"],
  ["/events/kim-bd-party (95).JPEG", "Rojstni dnevi"],
  ["/events/babyshower.webp", "Baby shower"],
  ["/events/gromparty.webp", "Dekliščine in fantovščine"],
  ["/events/matura.webp", "Mature in diplome"],
  ["/events/krst.webp", "Krsti in družinska praznovanja"],
  ["/events/party.webp", "Zabave"],
  ["/events/organizacija-dogodkov-dogodek.webp", "Poslovni dogodki"],
] as const;

const moments = [
  "/events/IMG_0850.jpg",
  "/events/07A2F0EC-1672-4735-B336-F275E78542FD.JPG",
  "/events/8DCDAFD6-CB9A-4DBE-B814-A5C5BBAE869C.JPG",
  "/events/IMG_0989.JPG",
  "/events/IMG_3133.JPG",
  "/events/IMG_5525.jpeg",
  "/events/IMG_5546.jpeg",
] as const;

const plans = [
  ["Basic", "39 €", "Do 1.000 fotografij · 10 videov · ZIP prenos"],
  ["Plus", "49 €", "Do 5.000 fotografij · 100 videov · Live Wall · 1 leto"],
  ["Premium", "99 €", "Neomejene fotografije · premium predloge · prednostna podpora"],
] as const;

export default function CamLoveFixedPage() {
  return <main className="min-h-screen bg-[#fffdf8] text-[#111]">
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fffdf8]/95 backdrop-blur">
      <nav className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="relative h-[52px] w-[210px]"><Image src="/camlove-logo.svg" alt="CamLove" fill priority className="object-contain object-left" /></Link>
        <div className="hidden gap-7 text-sm font-semibold text-black/60 lg:flex"><a href="#how">Kako deluje</a><a href="#events">Dogodki</a><a href="#wall">Live Wall</a><a href="#pricing">Cenik</a><a href="#business">Za podjetja</a></div>
        <Link href="/dashboard/new" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">Ustvari album</Link>
      </nav>
    </header>

    <section className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
      <div><span className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black/50">QR album za dogodke</span><h1 className="mt-6 text-[clamp(3.2rem,6vw,6.3rem)] font-black leading-[1.02] tracking-[-.055em]">Vse fotografije gostov.<span className="block text-[#F4B400]">En sam album.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-black/60 sm:text-xl">Gostje skenirajo QR kodo in dodajo fotografije ter videe neposredno v tvojo zasebno galerijo — brez aplikacije in brez registracije.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/new" className="rounded-full bg-[#F4B400] px-8 py-4 text-center font-black">Začni brezplačno →</Link><Link href="/demo" className="rounded-full border border-black/15 bg-white px-8 py-4 text-center font-bold">Poglej demo</Link></div></div>
      <div className="grid grid-cols-12 gap-3"><div className="relative col-span-8 row-span-2 min-h-[620px] overflow-hidden rounded-[30px]"><Image src="/events/T+ I-2497.JPG" alt="Poroka" fill priority sizes="45vw" className="object-cover" /></div><div className="relative col-span-4 min-h-[300px] overflow-hidden rounded-[24px]"><Image src="/events/kim-bd-party (95).JPEG" alt="Rojstni dan" fill sizes="25vw" className="object-cover" /></div><div className="relative col-span-4 min-h-[300px] overflow-hidden rounded-[24px]"><Image src="/events/babyshower.webp" alt="Baby shower" fill sizes="25vw" className="object-cover" /></div></div>
    </section>

    <section className="border-y border-black/10 bg-white"><div className="mx-auto grid max-w-[1320px] gap-3 px-5 py-6 text-center text-sm font-bold text-black/55 sm:grid-cols-4"><span>Brez aplikacije</span><span>Fotografije + videi</span><span>Originalna kakovost</span><span>Zasebna galerija</span></div></section>

    <section id="how" className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Kako deluje</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Tri koraki. To je vse.</h2><div className="mt-12 grid gap-4 lg:grid-cols-3">{[["01","Ustvari dogodek","Dobiš zasebno galerijo, QR kodo in povezavo."],["02","Postavi QR kodo","Na mize, vhod, vabilo ali velik zaslon."],["03","Gostje nalagajo","Vse fotografije in videi se sproti zbirajo v albumu."]].map(([n,t,d])=><div key={n} className="rounded-[28px] border border-black/10 bg-white p-8"><span className="font-black text-[#F4B400]">{n}</span><h3 className="mt-7 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></div>)}</div></section>

    <section id="events" className="bg-[#111] py-24 text-white"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#F4B400]">Pravi dogodki · prave fotografije</p><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Vsaka fotografija pri pravem tipu dogodka.</h2><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{events.map(([src,title])=><article key={title} className="overflow-hidden rounded-[24px] bg-white/5"><div className="relative aspect-[4/5]"><Image src={src} alt={title} fill sizes="25vw" className="object-cover" /></div><h3 className="p-5 text-xl font-black">{title}</h3></article>)}</div></div></section>

    <section className="bg-white py-20"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Tvoje naložene fotografije</p><h2 className="mt-4 text-3xl font-black sm:text-5xl">Resnični trenutki, brez AI slik.</h2><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">{moments.map(src=><div key={src} className="relative aspect-[4/5] overflow-hidden rounded-[18px]"><Image src={src} alt="Resnična fotografija z dogodka" fill sizes="15vw" className="object-cover" /></div>)}</div></div></section>

    <section id="wall" className="bg-[#F4B400] py-24"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-black/55">Live Photo Wall</p><h2 className="mt-4 text-4xl font-black leading-[.98] tracking-[-.05em] sm:text-6xl">Fotografije gostov takoj na velikem zaslonu.</h2><p className="mt-6 text-lg leading-8 text-black/65">Odpri CamLove na TV ali projektorju. Nova fotografija se po nalaganju pokaže v nekaj sekundah.</p></div><div className="rounded-[28px] bg-black/10 p-4"><WallMiniDemo label="CAMLOVE LIVE" /></div></div></section>

    <section id="pricing" className="py-24"><div className="mx-auto max-w-[1180px] px-5 sm:px-8"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Enkratno plačilo · brez naročnine</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">Izberi paket za svoj dogodek.</h2><p className="mt-5 text-lg text-black/55">Dogodek lahko najprej ustvariš in preizkusiš brezplačno.</p></div><div className="mt-14 grid gap-4 lg:grid-cols-3">{plans.map(([name,price,desc],i)=><article key={name} className={`relative flex min-h-[350px] flex-col rounded-[30px] p-8 ${i===1?"bg-black text-white ring-4 ring-[#F4B400]":"border border-black/10 bg-white"}`}>{i===1&&<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F4B400] px-4 py-1 text-xs font-black uppercase text-black">Najbolj priljubljen</span>}<p className={`text-sm font-black uppercase tracking-[.15em] ${i===1?"text-[#F4B400]":"text-black/45"}`}>{name}</p><div className="mt-5 text-6xl font-black">{price}</div><p className={`mt-5 leading-7 ${i===1?"text-white/60":"text-black/55"}`}>{desc}</p><Link href="/dashboard/new" className={`mt-auto rounded-full px-5 py-4 text-center font-black ${i===1?"bg-[#F4B400] text-black":"bg-black text-white"}`}>Izberi {name}</Link></article>)}</div><div className="mt-5 rounded-[22px] bg-[#fff5cc] p-5 text-center font-semibold">Free test: do 20 fotografij, QR koda in zasebna galerija brez kreditne kartice.</div></div></section>

    <section id="business" className="bg-[#171717] py-24 text-white"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="relative min-h-[560px] overflow-hidden rounded-[30px]"><Image src="/events/organizacija-dogodkov-dogodek.webp" alt="Poslovni dogodek" fill sizes="50vw" className="object-cover" /></div><div><span className="rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">CamLove za podjetja</span><h2 className="mt-6 text-4xl font-black leading-[.98] sm:text-6xl">Naj udeleženci ustvarijo vsebino za vaš dogodek.</h2><p className="mt-6 text-lg leading-8 text-white/60">Za konference, promocije, sejme, športne dogodke, poslovna praznovanja in agencije. Udeleženci nalagajo prek QR kode, vsebine pa lahko prikažete v živo.</p><div className="mt-8 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2"><span>✓ lastna grafična podoba</span><span>✓ Live Photo Wall</span><span>✓ zbiranje kontaktov ob soglasju</span><span>✓ sponzorski oglasi</span><span>✓ QR upload brez aplikacije</span><span>✓ prenos vseh vsebin</span></div><Link href="/contact" className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Ponudba za podjetja →</Link></div></div></section>

    <footer className="bg-black text-white"><div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8"><div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]"><div><div className="relative h-[64px] w-[230px]"><Image src="/camlove-logo.svg" alt="CamLove" fill className="object-contain object-left brightness-0 invert" /></div><p className="mt-5 max-w-sm leading-7 text-white/50">QR album za poroke, rojstne dneve, baby showerje, zabave in poslovne dogodke.</p><p className="mt-5 font-bold text-[#F4B400]">camlove.me</p></div><div><h3 className="font-black">Produkt</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><a href="#how">Kako deluje</a><a href="#events">Dogodki</a><a href="#wall">Live Wall</a><a href="#pricing">Cenik</a></div></div><div><h3 className="font-black">Uporabniki</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/dashboard/new">Ustvari album</Link><Link href="/dashboard">Moj račun</Link><Link href="/contact">Kontakt</Link><a href="#business">Za podjetja</a></div></div><div><h3 className="font-black">Pravno</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/55"><Link href="/privacy">Zasebnost</Link><Link href="/terms">Pogoji</Link><Link href="/cookies">Piškotki</Link><Link href="/gdpr">GDPR</Link></div></div></div><div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">© 2026 CamLove · Every camera. One story.</div></div></footer>
  </main>;
}
