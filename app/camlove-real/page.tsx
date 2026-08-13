import Image from "next/image";
import Link from "next/link";
import { CamLoveLogo } from "@/components/CamLoveLogo";
import { WallMiniDemo } from "@/components/WallMiniDemo";

const events = [
  ["/events/wedding.webp", "Poroke"],
  ["/events/birthday.webp", "Rojstni dnevi"],
  ["/events/babyshower.webp", "Baby shower"],
  ["/events/business.webp", "Poslovni dogodki"],
  ["/events/matura.webp", "Mature"],
  ["/events/krst.webp", "Krsti"],
  ["/events/party.webp", "Zabave"],
  ["/events/gromparty.webp", "Fantovščine"],
] as const;

function Arrow(){return <span aria-hidden>→</span>}

export default function CamLoveRealPage(){
  return <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbfaf7]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <CamLoveLogo size="sm" showMark />
        <nav className="hidden gap-7 text-sm font-semibold text-black/60 md:flex"><a href="#how">Kako deluje</a><a href="#events">Dogodki</a><a href="#features">Funkcije</a></nav>
        <Link href="/dashboard/new" className="rounded-full bg-black px-5 py-3 text-sm font-extrabold text-white">Ustvari album</Link>
      </div>
    </header>

    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
      <div>
        <p className="mb-5 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em] text-black/55">QR album za dogodke</p>
        <h1 className="text-[clamp(3.2rem,7vw,6.5rem)] font-black leading-[.9] tracking-[-.06em]">Vse fotografije gostov.<span className="block text-[#b98800]">En sam album.</span></h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-black/60 sm:text-xl">Ustvari dogodek, deli QR kodo in gostje sami naložijo fotografije ter videe v tvojo zasebno galerijo — brez aplikacije in brez registracije.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/new" className="rounded-full bg-[#ffca2f] px-7 py-4 text-center font-extrabold text-black">Ustvari brezplačen album <Arrow/></Link><Link href="/demo" className="rounded-full border border-black/15 bg-white px-7 py-4 text-center font-bold">Poglej demo</Link></div>
        <p className="mt-5 text-sm font-medium text-black/45">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[28px]"><Image src="/events/wedding.webp" alt="Poroka" fill priority className="object-cover" sizes="60vw"/><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/><div className="absolute bottom-5 left-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-white/70">CamLove v živo</p><p className="mt-1 text-xl font-black">Gostje slikajo. CamLove zbira.</p></div></div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]"><Image src="/events/birthday.webp" alt="Rojstni dan" fill className="object-cover" sizes="30vw"/></div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]"><Image src="/events/babyshower.webp" alt="Baby shower" fill className="object-cover" sizes="30vw"/></div>
      </div>
    </section>

    <section id="how" className="border-y border-black/10 bg-white py-20 sm:py-28"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#987000]">Kako deluje</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Tri koraki. To je vse.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{[["01","Ustvari dogodek","Dobiš zasebno galerijo, QR kodo in povezavo."],["02","Postavi QR kodo","Na mizo, vhod, vabilo ali zaslon. Gost samo skenira."],["03","Vse se zbira","Fotografije in videi se takoj pojavijo v tvojem albumu."]].map(([n,t,d])=><div key={n} className="rounded-3xl border border-black/10 bg-[#fbfaf7] p-7"><span className="font-serif text-3xl italic text-[#b98800]">{n}</span><h3 className="mt-7 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></div>)}</div></div></section>

    <section id="events" className="bg-[#f1eee5] py-20 sm:py-28"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#987000]">Za vsak poseben trenutek</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Dogodek skozi oči vseh.</h2></div><p className="max-w-md text-lg leading-8 text-black/55">Uporabljamo tvoje fotografije različnih dogodkov — brez generičnih AI vizualov.</p></div><div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{events.map(([src,label])=><article key={src} className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-black"><Image src={src} alt={label} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="25vw"/><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"/><h3 className="absolute bottom-4 left-4 text-lg font-black text-white sm:text-xl">{label}</h3></article>)}</div></div></section>

    <section id="features" className="bg-black py-20 text-white sm:py-28"><div className="mx-auto max-w-7xl px-5 sm:px-8"><h2 className="max-w-3xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Narejeno za goste, ne za tehnično podporo.</h2><div className="mt-12 grid gap-x-12 gap-y-0 md:grid-cols-2">{[["Brez aplikacije","Gost samo skenira QR in naloži."],["Brez registracije","Brez računa in brez gesla za gosta."],["Originalna kakovost","Fotografije in videi ostanejo v polni kakovosti."],["ZIP prenos","Po dogodku preneseš vse naenkrat."],["QR za tisk","Za mize, vabila, vhod ali zaslon."],["Zasebna galerija","Dostop imajo samo ljudje s tvojo povezavo."]].map(([t,d])=><div key={t} className="border-t border-white/15 py-6"><h3 className="text-xl font-black">{t}</h3><p className="mt-2 text-white/55">{d}</p></div>)}</div></div></section>

    <section className="bg-[#ffca2f] py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-black/50">Live Photo Wall</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Nova fotografija. Čez nekaj sekund na velikem zaslonu.</h2><p className="mt-5 text-lg leading-8 text-black/60">Odpri CamLove na TV ali projektorju in naj nove fotografije postanejo del dogodka.</p></div><div className="rounded-[28px] bg-black/10 p-3 sm:p-5"><WallMiniDemo label="CAMLOVE LIVE" /></div></div></section>

    <section className="bg-[#fbfaf7] py-20 sm:py-28"><div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><h2 className="text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">Tvoj dogodek. Vsi pogledi. Ena zgodba.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">Preizkusi brezplačno, prenesi QR kodo in preveri celoten flow še pred dogodkom.</p><Link href="/dashboard/new" className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-extrabold text-white">Ustvari brezplačen album <Arrow/></Link></div></section>
  </main>
}
