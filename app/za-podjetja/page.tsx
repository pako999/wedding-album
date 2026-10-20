import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import { BUSINESS_PRICE_EUR } from "@/lib/plan-pricing";
import { absoluteUrl } from "@/lib/urls";

const buyHref = "/dashboard/new?plan=business&lang=sl";

export const metadata: Metadata = {
  title: "Guestcam za podjetja | QR album in foto stena za poslovne dogodke",
  description: `Fotografije in videi udeležencev na enem mestu. QR album, moderacija, foto stena v živo in prenos ZIP za en poslovni dogodek. Poslovni paket ${BUSINESS_PRICE_EUR} €; brez naročnine.`,
  alternates: { canonical: absoluteUrl("/za-podjetja") },
  openGraph: {
    title: "Guestcam za podjetja — vsi utrinki poslovnega dogodka",
    description: `QR album in foto stena v živo. En dogodek za ${BUSINESS_PRICE_EUR} € brez naročnine.`,
    url: absoluteUrl("/za-podjetja"),
    type: "website",
  },
};

const features = [
  ["QR-koda brez aplikacije", "Udeleženci odprejo album v brskalniku in dodajo fotografije ali videe brez registracije."],
  ["Foto stena v živo", "Odprite zaslonsko povezavo na televizorju ali projektorju; vključite diaprojekcijo."],
  ["Nadzor objav", "Pred prikazom lahko pregledate poslane fotografije in odobrite vsebine."],
  ["Podoba dogodka", "Nastavite naslov, naslovno sliko in prikaz na zaslonu; dodate lahko sponzorske slike."],
  ["Kontakti ob privolitvi", "Če je to primerno za vaš dogodek, vključite obrazec za prostovoljno oddajo kontaktov."],
  ["Prenos izvirnikov", "Po dogodku v organizatorskem delu prenesite datoteke in jih arhivirajte."],
] as const;

const questions = [
  ["Ali se morajo udeleženci prijaviti?", "Ne. Za dodajanje fotografij in videov zadostuje telefon s spletnim brskalnikom in QR-koda."],
  ["Ali potrebujemo računalnik za prikaz v živo?", "Za zaslon potrebujete napravo z brskalnikom, povezano s televizorjem ali projektorjem, ter internetno povezavo."],
  ["Koliko dogodkov vključuje paket?", "Poslovni paket vključuje en dogodek oziroma en album z do petimi galerijami znotraj tega dogodka. Za vsak naslednji dogodek kupite nov paket."],
  ["Kako dolgo ostane album dostopen?", "Album je dostopen 365 dni od aktivacije plačanega paketa. Pred iztekom prenesite svoje datoteke."],
  ["Ali lahko plačamo po predračunu?", "Da. Med nakupom v organizatorskem delu izberite plačilo po predračunu in vpišite podatke podjetja. Paket se aktivira po potrjenem plačilu."],
] as const;

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#111111]">
      <SiteHeader lang="sl" />
      <main>
        <section className="mx-auto grid max-w-[1320px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#8F6900]">Guestcam za podjetja</p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-.045em] sm:text-6xl">Vsi utrinki vašega dogodka. Ena QR-koda.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-black/60">Za konference, team buildinge, sejme, promocije in poslovne zabave. Udeleženci dodajo fotografije in videe brez aplikacije. Vi jih pregledate, prikažete v živo in po dogodku prenesete.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href={buyHref} className="rounded-full bg-[#F4B400] px-7 py-4 font-black text-black">Izberite Poslovni paket →</Link><Link href="#cenik" className="rounded-full border border-black/20 px-7 py-4 font-bold">Poglejte cenik</Link></div>
            <p className="mt-4 text-sm font-medium text-black/50">Enkratno plačilo · brez naročnine · en dogodek</p>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-[32px] bg-black/10 shadow-2xl sm:min-h-[470px]"><Image src="/events/organizacija-dogodkov-dogodek.webp" alt="Udeleženci na poslovnem dogodku" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div>
        </section>

        <section className="bg-[#171717] py-16 text-white sm:py-24"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.2em] text-[#F4B400]">Od prvega skeniranja do zadnje fotografije</p><h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Enostavno za goste. Pregledno za organizatorja.</h2><div className="mt-10 grid gap-4 md:grid-cols-3">{[["01", "Ustvarite dogodek", "Nastavite ime in datum dogodka ter prenesite njegovo QR-kodo."], ["02", "Vključite goste", "QR-kodo postavite na vhod, priponke ali zaslon. Vsebina prihaja v skupni album."], ["03", "Pokažite in shranite", "Po želji vključite pregled objav in foto steno. Po dogodku prenesite datoteke."]].map(([n, title, body]) => <article key={n} className="rounded-[24px] border border-white/15 bg-white/5 p-7"><span className="text-sm font-black text-[#F4B400]">{n}</span><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{body}</p></article>)}</div></div></section>

        <section className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 sm:py-28"><h2 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Kaj dobite s poslovnim paketom?</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([title, body]) => <article key={title} className="rounded-[24px] border border-black/10 bg-white p-7 shadow-sm"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1AD] font-black">✓</span><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-black/55">{body}</p></article>)}</div></section>

        <section id="cenik" className="bg-[#FFF4B8] py-20 sm:py-28"><div className="mx-auto max-w-[1200px] px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.2em] text-[#745600]">Ločen cenik za podjetja</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Preizkusite. Nato izberite paket za dogodek.</h2><div className="mt-10 grid gap-5 lg:grid-cols-3">
          <article className="flex flex-col rounded-[28px] bg-white p-7 shadow-sm"><h3 className="text-xl font-black">Brezplačni preizkus</h3><p className="mt-3 text-4xl font-black">0 €</p><p className="mt-3 text-sm text-black/55">Za preverjanje poteka pred dogodkom.</p><ul className="mt-7 flex-1 space-y-3 text-sm"><li>✓ 1 testni album</li><li>✓ 20 fotografij in 1 video</li><li>✓ Dostop 30 dni</li><li>✓ QR-koda in nalaganje brez aplikacije</li></ul><Link href="/dashboard/new?lang=sl" className="mt-8 rounded-full border border-black/15 px-5 py-3.5 text-center font-black">Preizkusite brezplačno</Link></article>
          <article className="flex flex-col rounded-[28px] bg-[#171717] p-7 text-white shadow-xl ring-4 ring-[#F4B400]"><span className="w-fit rounded-full bg-[#F4B400] px-3 py-1 text-xs font-black uppercase text-black">Za poslovni dogodek</span><h3 className="mt-4 text-xl font-black">Poslovni</h3><p className="mt-3 text-5xl font-black text-[#F4B400]">{BUSINESS_PRICE_EUR} €</p><p className="mt-3 text-sm text-white/60">Enkratno plačilo za en dogodek.</p><ul className="mt-7 flex-1 space-y-3 text-sm text-white/85"><li>✓ 1 album, do 5 galerij</li><li>✓ Neomejeno fotografij in videov</li><li>✓ 365 dni dostopa od nakupa</li><li>✓ Foto stena v živo in diaprojekcija</li><li>✓ Moderacija, kontakti ob privolitvi</li><li>✓ Sponzorske slike in prenos ZIP</li></ul><Link href={buyHref} className="mt-8 rounded-full bg-[#F4B400] px-5 py-3.5 text-center font-black text-black">Ustvarite poslovni dogodek →</Link></article>
          <article className="flex flex-col rounded-[28px] bg-white p-7 shadow-sm"><h3 className="text-xl font-black">Več dogodkov</h3><p className="mt-3 text-2xl font-black">Po ponudbi</p><p className="mt-3 text-sm text-black/55">Za ekipe in agencije, ki organizirajo več dogodkov.</p><ul className="mt-7 flex-1 space-y-3 text-sm"><li>✓ Dogovor glede obsega</li><li>✓ Pomoč pri zasnovi dogodkov</li><li>✓ Posamezni albumi za posamezne dogodke</li></ul><Link href="/contact" className="mt-8 rounded-full border border-black/15 px-5 py-3.5 text-center font-black">Pošljite povpraševanje →</Link></article>
        </div><p className="mt-6 text-sm text-black/60">Tisk QR-kartic in podstavkov je na voljo kot dodatno naročilo. Za več dogodkov vsak paket velja za svoj album.</p></div></section>

        <section className="mx-auto max-w-[1000px] px-5 py-20 sm:px-8 sm:py-28"><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Pogosta vprašanja</h2><div className="mt-8 divide-y divide-black/10 border-y border-black/10">{questions.map(([q, a]) => <details key={q} className="group py-5"><summary className="cursor-pointer text-lg font-black">{q}</summary><p className="mt-3 max-w-3xl leading-7 text-black/60">{a}</p></details>)}</div><div className="mt-12 rounded-[28px] bg-[#171717] p-8 text-white sm:p-12"><h2 className="text-3xl font-black">Pripravite album za naslednji dogodek.</h2><p className="mt-3 max-w-xl text-white/65">Začnite z brezplačnim preizkusom ali izberite poslovni paket med ustvarjanjem dogodka.</p><Link href={buyHref} className="mt-7 inline-flex rounded-full bg-[#F4B400] px-7 py-4 font-black text-black">Izberite Poslovni paket →</Link></div></section>
      </main>
      <SeoFooter lang="sl" />
    </div>
  );
}
