import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SeoFooter } from "@/components/SeoFooter";
import { WallMiniDemo } from "@/components/WallMiniDemo";
import { STAND_VARIANTS, eur } from "@/lib/print-service";

export const HOME_FAQS = [
  {
    q: "Ali morajo gostje prenesti aplikacijo?",
    a: "Ne. Gostje odprejo album neposredno v brskalniku telefona. Skenirajo QR kodo in takoj naložijo fotografije ali videe — brez namestitve aplikacije in brez registracije.",
  },
  {
    q: "Ali so fotografije zasebne?",
    a: "Da. Album je dostopen samo prek vaše QR kode ali zasebne povezave. Po želji ga lahko dodatno zaščitite z geslom.",
  },
  {
    q: "V kakšni kakovosti se shranjujejo fotografije?",
    a: "Fotografije se shranjujejo v originalni kakovosti, brez zmanjševanja ločljivosti. Primerne so tudi za poznejši tisk.",
  },
  {
    q: "Ali CamLove podpira videe?",
    a: "Da. Vsi paketi omogočajo video, količina pa je odvisna od izbranega paketa. Plus in Premium sta namenjena večjim dogodkom z več fotografijami in videi.",
  },
  {
    q: "Kaj se zgodi po dogodku?",
    a: "Galerija ostane aktivna toliko časa, kot določa paket. Vse fotografije in videe lahko prenesete naenkrat kot ZIP arhiv.",
  },
  {
    q: "Kaj če gost med nalaganjem izgubi internet?",
    a: "CamLove je zasnovan za uporabo na dogodkih. Ko je povezava slaba, se nalaganje lahko nadaljuje, ko je povezava ponovno na voljo, zato gostu ni treba pošiljati slik po več različnih kanalih.",
  },
  {
    q: "Ali lahko CamLove natisne QR kartice in namizne podstavke?",
    a: "Da. Ob nakupu paketa lahko naročite tudi fizične QR kartice z lesenimi ali zlatimi namiznimi podstavki. Natisnemo jih z vašo QR kodo in jih pošljemo pripravljene za postavitev na dogodku.",
  },
] as const;

const EVENT_CARDS = [
  { title: "Poroke", image: "/events/T+ I-2497.JPG", desc: "Vsi spontani trenutki gostov v enem poročnem albumu." },
  { title: "Rojstni dnevi", image: "/events/kim-bd-party (95).JPEG", desc: "Fotografije družine in prijateljev brez WhatsApp kaosa." },
  { title: "Baby shower", image: "/events/babyshower.webp", desc: "Nežni trenutki, dekoracija in fotografije vseh povabljenih." },
  { title: "Dekliščine in fantovščine", image: "/events/gromparty.webp", desc: "Ena QR koda za celotno zabavo in vse telefone." },
  { title: "Zabave", image: "/events/party.webp", desc: "Najboljši utrinki večera se sproti zbirajo v galeriji." },
  { title: "Poslovni dogodki", image: "/events/organizacija-dogodkov-dogodek.webp", desc: "Konference, promocije, sejmi, team buildingi in aktivacije." },
  { title: "Krsti in praznovanja", image: "/events/krst.webp", desc: "Preprost zasebni album za družino in prijatelje." },
  { title: "Mature in diplome", image: "/events/matura.webp", desc: "Skupinska galerija za večer, ki ga želite ohraniti." },
] as const;

const FEATURES = [
  ["Brez aplikacije", "Gost samo skenira QR kodo in naloži vsebino neposredno iz brskalnika."],
  ["Polna kakovost", "Fotografije ostanejo v originalni ločljivosti — brez WhatsApp stiskanja."],
  ["Popolna zasebnost", "Galerijo delite samo z gosti, po želji pa jo zaščitite tudi z geslom."],
  ["Fotografije + videi", "Na enem mestu zberete fotografije in videe iz vseh telefonov na dogodku."],
  ["Live Photo Wall", "Nove fotografije lahko v nekaj sekundah prikažete na TV-ju ali projektorju."],
  ["Več jezikov", "Vmesnik je pripravljen za slovenske in mednarodne goste."],
  ["ZIP prenos", "Po dogodku vse datoteke prenesete naenkrat in jih varno arhivirate."],
  ["QR predloge + tisk", "Izberite predlogo ali naročite fizične QR kartice in namizne podstavke, ki jih natisnemo ter pošljemo mi."],
] as const;

const PLANS = [
  {
    name: "Free",
    tagline: "Preizkusite brez tveganja",
    price: "0 €",
    oldPrice: "",
    featured: false,
    features: ["Unikatna QR koda", "Do 20 fotografij", "1 videoposnetek", "Dostop 30 dni", "Zasebna galerija"],
    cta: "Začni brezplačno",
  },
  {
    name: "Basic",
    tagline: "Za manjše dogodke",
    price: "39 €",
    oldPrice: "55 €",
    featured: false,
    features: ["Unikatna QR koda", "Do 1.000 fotografij", "Do 10 videoposnetkov", "Dostop 3 mesece", "Prenos vseh slik (ZIP)"],
    cta: "Izberi Basic",
  },
  {
    name: "Plus",
    tagline: "Za večje dogodke in poroke",
    price: "49 €",
    oldPrice: "69 €",
    featured: true,
    features: ["Neomejeno gostov", "Do 5.000 fotografij", "Do 100 videoposnetkov", "Dostop 1 leto", "Prenos vseh slik (ZIP)", "Live Photo Wall", "Personalizirana stran", "E-mail obvestila"],
    cta: "Izberi Plus",
  },
  {
    name: "Premium",
    tagline: "Za tiste, ki želite vse",
    price: "99 €",
    oldPrice: "149 €",
    featured: false,
    features: ["Neomejeno gostov", "Neomejeno fotografij", "Do 100 videoposnetkov", "Dostop 2 leti", "Prenos vseh slik (ZIP)", "Live Photo Wall", "Personalizirana stran", "Premium predloge", "Prioritetna podpora"],
    cta: "Izberi Premium",
  },
] as const;

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm leading-6">
      <span className="mt-0.5 font-black text-[#F4B400]">✓</span>
      <span>{children}</span>
    </li>
  );
}

function MiniQR() {
  const pattern = [
    1,1,1,1,1,0,1,1,1,1,1,
    1,0,0,0,1,0,1,0,0,0,1,
    1,0,1,0,1,0,1,0,1,0,1,
    1,0,0,0,1,0,1,0,0,0,1,
    1,1,1,1,1,0,1,1,1,1,1,
    0,0,0,0,0,0,0,0,0,0,0,
    1,1,0,1,1,1,0,1,0,1,1,
    0,1,1,0,0,1,1,0,1,0,1,
    1,0,1,1,0,0,1,1,0,1,0,
    1,1,0,0,1,1,0,0,1,1,1,
    0,1,1,1,0,1,1,1,0,0,1,
  ];
  return (
    <div className="grid h-[72px] w-[72px] grid-cols-11 gap-[1px] rounded-lg bg-white p-1 shadow-sm">
      {pattern.map((cell, i) => <span key={i} className={cell ? "bg-black" : "bg-white"} />)}
    </div>
  );
}

export async function CamLoveHomePage() {
  const printedStandFrom = eur(Math.min(...STAND_VARIANTS.map((variant) => variant.unitCents)));

  return (
    <main className="min-h-screen overflow-hidden bg-[#FFFDF8] text-[#111111]">
      <SiteHeader lang="sl" />

      {/* HERO */}
      <section className="relative border-b border-black/10">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-10 sm:gap-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black/55 shadow-sm">
              QR foto album za vse vrste dogodkov
            </div>
            <h1 className="mt-6 max-w-[760px] text-[clamp(2.8rem,13vw,6.7rem)] font-black leading-[1.07] tracking-[-.05em] sm:mt-7 sm:leading-[1.02] sm:tracking-[-.065em]">
              Vse fotografije gostov.
              <span className="mt-3 block text-[#F4B400] sm:mt-2">En sam album.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-7 text-black/60 sm:mt-7 sm:text-xl sm:leading-8">
              Gostje skenirajo QR kodo in dodajo fotografije ter videe neposredno v vašo zasebno galerijo — brez aplikacije in brez registracije.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link href="/dashboard/new" className="rounded-full bg-[#F4B400] px-8 py-4 text-center text-base font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.25)] transition-transform hover:scale-[1.02]">
                Začni brezplačno →
              </Link>
              <Link href="/demo" className="rounded-full border border-black/15 bg-white px-8 py-4 text-center text-base font-bold transition-colors hover:bg-black hover:text-white">
                Poglej demo
              </Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-black/45">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>

            <a href="#print-service" className="mt-6 flex max-w-2xl items-start gap-3 rounded-[22px] border border-[#F4B400]/35 bg-[#FFF6CE] p-4 transition-transform hover:scale-[1.01] sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400] text-lg">▣</span>
              <span>
                <strong className="block text-sm font-black sm:text-base">Ne želite sami tiskati?</strong>
                <span className="mt-1 block text-sm leading-6 text-black/58">QR kartice in namizne podstavke natisnemo mi ter jih pošljemo pripravljene za dogodek — že od {printedStandFrom}/kos.</span>
                <span className="mt-2 block text-xs font-black text-[#8C6800]">Poglej tiskane QR podstavke →</span>
              </span>
            </a>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
              {[['500+', 'ustvarjenih galerij'], ['25.000+', 'zbranih fotografij'], ['5.0/5', 'prve ocene']].map(([n, l]) => (
                <div key={l} className="rounded-[18px] border border-black/8 bg-white p-3.5 shadow-sm sm:rounded-[20px] sm:p-4">
                  <div className="text-lg font-black sm:text-2xl">{n}</div>
                  <div className="mt-1 text-[10px] font-semibold leading-[1.35] text-black/45 sm:text-xs">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-20 h-52 w-52 rounded-full bg-[#F4B400]/20 blur-3xl" />
            <div className="absolute -right-10 bottom-10 h-64 w-64 rounded-full bg-[#F4B400]/15 blur-3xl" />
            <div className="relative grid grid-cols-12 gap-2 sm:gap-3">
              <div className="relative col-span-8 min-h-[390px] overflow-hidden rounded-[24px] bg-black/5 shadow-2xl sm:min-h-[520px] sm:rounded-[34px] lg:min-h-[620px]">
                <Image src="/events/T+ I-2497.JPG" alt="Gostje na poroki ustvarjajo fotografije za CamLove album" fill priority sizes="(max-width:1024px) 66vw, 38vw" className="object-cover" />
                <div className="absolute bottom-5 left-5 hidden rounded-full bg-black/75 px-4 py-2 text-xs font-bold text-white backdrop-blur sm:block">Poroka · pravi trenutki gostov</div>
              </div>
              <div className="relative col-span-4 min-h-[190px] overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:min-h-[254px] sm:rounded-[26px] lg:min-h-[300px]">
                <Image src="/events/kim-bd-party (95).JPEG" alt="Rojstnodnevni dogodek" fill sizes="(max-width:1024px) 33vw, 20vw" className="object-cover" />
              </div>
              <div className="relative col-span-4 min-h-[190px] overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:min-h-[254px] sm:rounded-[26px] lg:min-h-[300px]">
                <Image src="/events/babyshower.webp" alt="Baby shower dogodek" fill sizes="(max-width:1024px) 33vw, 20vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-3 px-5 py-6 text-center text-sm font-bold text-black/55 sm:grid-cols-4 sm:px-8">
          <span>✓ Brez aplikacije</span><span>✓ Fotografije + videi</span><span>✓ Originalna kakovost</span><span>✓ Zasebna galerija</span>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Problem, ki ga CamLove reši</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.045em] sm:text-6xl">Vsak gost fotografira. Vi pa večine teh slik nikoli ne vidite.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-black/55 lg:ml-auto">Po dogodku so fotografije razpršene med telefoni, WhatsApp skupinami in družbenimi omrežji. CamLove jih z eno QR kodo zbere na enem mestu.</p>
        </div>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {[
            ["01", "Fotograf ne more biti povsod", "Gostje ujamejo spontane trenutke, ki jih profesionalni fotograf pogosto zamudi."],
            ["02", "Fotografije ostanejo na telefonih", "Po dogodku se začne prosjačenje za slike, pošiljanje linkov in izgubljanje kakovosti."],
            ["03", "Celotna zgodba dogodka", "CamLove združi različne poglede vseh gostov v en zasebni album."],
          ].map(([n,t,d]) => (
            <article key={n} className="rounded-[30px] border border-black/10 bg-white p-8 shadow-sm">
              <span className="text-sm font-black text-[#F4B400]">{n}</span>
              <h3 className="mt-8 text-2xl font-black tracking-[-.03em]">{t}</h3>
              <p className="mt-3 leading-7 text-black/55">{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-[#F4B400] py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-black/55">Kako deluje</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Tri koraki. To je vse.</h2>
            <p className="mt-5 text-lg leading-8 text-black/60">Galerijo pripravite v nekaj minutah, gostje pa potrebujejo samo telefon.</p>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {[
              ["01", "Ustvarite dogodek", "Določite ime dogodka in takoj dobite zasebno galerijo, povezavo in QR kodo."],
              ["02", "Postavite QR kodo", "Dodajte jo na mize, vhod, vabilo, meni, zaslon ali natisnjeno kartico."],
              ["03", "Gostje nalagajo", "Fotografije in videi se sproti zbirajo v albumu, pripravljeni za ogled in prenos."],
            ].map(([n,t,d]) => (
              <article key={n} className="rounded-[30px] bg-[#FFFDF8] p-8 shadow-[0_12px_40px_rgba(0,0,0,.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-black text-white">{n}</div>
                <h3 className="mt-8 text-2xl font-black tracking-[-.03em]">{t}</h3>
                <p className="mt-3 leading-7 text-black/55">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="bg-[#111111] py-24 text-white sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#F4B400]">Za vsak poseben trenutek</p>
              <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-.05em] sm:text-6xl">En način zbiranja slik. Za skoraj vsak dogodek.</h2>
            </div>
            <p className="text-lg leading-8 text-white/55">Poroke, rojstni dnevi, baby showerji, zabave, mature, krsti in poslovni dogodki.</p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EVENT_CARDS.map((event) => (
              <article key={event.title} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[.04]">
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                  <Image src={event.image} alt={event.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{event.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Predloge za tisk</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Kartice, ki goste spodbudijo k deljenju fotografij.</h2>
            <p className="mt-5 text-lg leading-8 text-black/55">Dodajte svojo QR kodo, ime dogodka in datum. Natisnite jih in postavite tja, kjer jih gostje res opazijo.</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Klasična", "/events/T+ I-2497.JPG", "Capture the Love"],
              ["Elegantna", "/events/IMG_5525.jpeg", "Deli naše spomine"],
              ["Moderna", "/events/IMG_0989.JPG", "Scan & Share"],
              ["Minimalistična", "/events/IMG_0850.jpg", "Naš dan"],
            ].map(([name, image, headline]) => (
              <article key={name} className="group relative min-h-[470px] overflow-hidden rounded-[30px] bg-black shadow-lg">
                <Image src={image} alt={`CamLove QR predloga ${name}`} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover opacity-65 transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/15" />
                <div className="absolute inset-x-5 bottom-5 rounded-[24px] bg-[#FFFDF8]/95 p-5 text-black backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div><p className="text-xs font-black uppercase tracking-[.14em] text-black/45">{name}</p><h3 className="mt-2 text-xl font-black">{headline}</h3><p className="mt-1 text-xs text-black/45">Skeniraj in deli</p></div>
                    <MiniQR />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-9 text-center"><Link href="/dashboard/new" className="inline-flex rounded-full bg-black px-7 py-4 font-black text-white">Ustvari galerijo in QR kodo →</Link></div>

          <div id="print-service" className="mt-16 overflow-hidden rounded-[34px] bg-[#151515] text-white shadow-2xl sm:mt-20">
            <div className="grid lg:grid-cols-[1.05fr_.95fr] lg:items-stretch">
              <div className="p-7 sm:p-10 lg:p-12">
                <span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-[11px] font-black uppercase tracking-[.14em] text-black">Tisk + namizni podstavki</span>
                <h3 className="mt-6 max-w-2xl text-3xl font-black leading-[1.04] tracking-[-.04em] sm:text-5xl">Mi natisnemo. Vi samo postavite na mize.</h3>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/58 sm:text-lg sm:leading-8">Naročite fizične QR kartice in namizne podstavke skupaj s CamLove paketom. Kartice personaliziramo z vašo QR kodo, natisnemo na 200 g papir in jih pošljemo pripravljene za vaš dogodek.</p>
                <div className="mt-7 grid gap-3 text-sm font-semibold text-white/72 sm:grid-cols-2">
                  <span>✓ vaša CamLove QR koda</span>
                  <span>✓ leseni ali zlati podstavek</span>
                  <span>✓ tisk je vključen v ceno</span>
                  <span>✓ dostava na vaš naslov</span>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href="/dashboard/new" className="rounded-full bg-[#F4B400] px-7 py-4 text-center font-black text-black">Dodaj podstavke ob nakupu →</Link>
                  <span className="text-sm font-semibold text-white/45">Od {printedStandFrom}/kos · naročite vsaj 10 dni pred dogodkom</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-white/10 p-px">
                {[
                  ["/print/stand-wood.webp", "Leseni podstavek", "3,00 € / kos"],
                  ["/print/stand-gold.webp", "Zlati podstavek", "4,50 € / kos"],
                ].map(([src, name, price]) => (
                  <div key={name} className="bg-[#202020] p-3 sm:p-5">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white">
                      <Image src={src} alt={`${name} za CamLove QR kartico`} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                    </div>
                    <div className="px-1 pb-2 pt-4">
                      <p className="text-sm font-black sm:text-base">{name}</p>
                      <p className="mt-1 text-xs font-semibold text-[#F4B400] sm:text-sm">{price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Zakaj CamLove</p>
              <h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl">Vse, kar potrebujete. Nič, česar gostje ne potrebujejo.</h2>
              <p className="mt-6 text-lg leading-8 text-black/55">Najpomembnejši del je preprostost: gost vidi QR kodo, skenira in naloži.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map(([title, desc], i) => (
                <article key={title} className="rounded-[26px] border border-black/10 bg-white p-7 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF2B3] text-sm font-black">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="mt-6 text-xl font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/52">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WALL */}
      <section id="wall" className="bg-[#F4B400] py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-black/55">Mural fotografij v živo</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl">Fotografije gostov takoj na velikem zaslonu.</h2>
            <p className="mt-6 text-lg leading-8 text-black/62">Odprite CamLove na TV-ju ali projektorju. Ko gost naloži novo fotografijo, se ta prikaže na zaslonu v nekaj sekundah.</p>
            <ul className="mt-7 space-y-3 font-bold text-black/65"><li>✓ poseben varen link za zaslon</li><li>✓ QR koda na velikem zaslonu</li><li>✓ nove fotografije pridejo v ospredje</li><li>✓ primerno za poroke in poslovne dogodke</li></ul>
          </div>
          <div className="rounded-[34px] bg-black/12 p-3 shadow-2xl sm:p-5"><WallMiniDemo label="CAMLOVE LIVE" /></div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <p className="text-center text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Mnenja uporabnikov</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-black tracking-[-.05em] sm:text-6xl">Spomini, ki bi drugače ostali na telefonih.</h2>
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            {[
              ["Noro dobra ideja! Dobila sva toliko spontanih fotografij, ki jih fotograf nikoli ne bi ujel. Gostje so takoj razumeli, kaj morajo narediti.", "Tina & Luka", "Poroka"],
              ["QR kodo smo dali na vsako mizo in že med dogodkom smo imeli na stotine fotografij. Najboljše je, da ni bilo treba nikogar prositi za pošiljanje slik.", "Ana & Marko", "Praznovanje"],
              ["Gostje iz tujine so brez težav nalagali fotografije s svojih telefonov. Po dogodku smo vse prenesli naenkrat in imeli celotno zgodbo večera.", "Sara & David", "Dogodek"],
            ].map(([quote, name, type]) => (
              <blockquote key={name} className="rounded-[30px] border border-black/10 bg-[#FFFDF8] p-8">
                <div className="text-[#F4B400]">★★★★★</div>
                <p className="mt-6 text-lg font-semibold leading-8">“{quote}”</p>
                <footer className="mt-7 text-sm text-black/45"><strong className="text-black">{name}</strong> · {type}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Enkratno plačilo · brez naročnine</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">Preprosti paketi za vsak dogodek.</h2>
            <p className="mt-5 text-lg leading-8 text-black/55">Začnite brezplačno. Plačate šele, ko potrebujete več prostora in funkcij.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan) => (
              <article key={plan.name} className={`relative flex min-h-[520px] flex-col rounded-[30px] p-7 ${plan.featured ? "bg-black text-white ring-4 ring-[#F4B400] shadow-2xl" : "border border-black/10 bg-white shadow-sm"}`}>
                {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F4B400] px-4 py-1.5 text-[11px] font-black uppercase tracking-[.1em] text-black">Najbolj priljubljen</span>}
                <p className={`text-sm font-black uppercase tracking-[.15em] ${plan.featured ? "text-[#F4B400]" : "text-black/45"}`}>{plan.name}</p>
                <p className={`mt-2 text-sm ${plan.featured ? "text-white/50" : "text-black/45"}`}>{plan.tagline}</p>
                <div className="mt-6 flex items-end gap-2"><span className="text-5xl font-black tracking-[-.05em]">{plan.price}</span>{plan.oldPrice && <span className={`pb-1 text-sm line-through ${plan.featured ? "text-white/35" : "text-black/35"}`}>{plan.oldPrice}</span>}</div>
                <ul className={`mt-8 flex flex-1 flex-col gap-2.5 ${plan.featured ? "text-white/72" : "text-black/65"}`}>{plan.features.map(f => <Check key={f}>{f}</Check>)}</ul>
                <Link href="/dashboard/new" className={`mt-8 rounded-full px-5 py-3.5 text-center font-black ${plan.featured ? "bg-[#F4B400] text-black" : "bg-black text-white"}`}>{plan.cta}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS */}
      <section id="business" className="bg-[#171717] py-24 text-white sm:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[560px] overflow-hidden rounded-[34px] bg-black shadow-2xl">
            <Image src="/events/organizacija-dogodkov-dogodek.webp" alt="Poslovni dogodek z uporabo CamLove QR galerije" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">CamLove za podjetja</span>
            <h2 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.045em] sm:text-6xl">Naj udeleženci ustvarijo vsebino za vaš dogodek.</h2>
            <p className="mt-6 text-lg leading-8 text-white/58">Za konference, promocije, sejme, športne dogodke, poslovna praznovanja in agencije. Udeleženci nalagajo prek QR kode, vsebine pa lahko prikažete v živo.</p>
            <div className="mt-9 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2">
              <span>✓ lastna grafična podoba</span><span>✓ Live Photo Wall</span><span>✓ zbiranje kontaktov ob soglasju</span><span>✓ sponzorski oglasi</span><span>✓ QR upload brez aplikacije</span><span>✓ prenos vseh vsebin</span>
            </div>
            <Link href="/contact" className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Ponudba za podjetja →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#9A7100]">Pogosta vprašanja</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-5xl">Vse, kar želite vedeti pred dogodkom.</h2>
            <Link href="/contact" className="mt-7 inline-flex font-black underline decoration-[#F4B400] decoration-4 underline-offset-4">Imate drugo vprašanje? Pišite nam →</Link>
          </div>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {HOME_FAQS.map((faq) => (
              <details key={faq.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-black [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span><span className="text-2xl font-normal text-black/35 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-3xl pb-6 pr-12 leading-7 text-black/55">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-y border-black/10 bg-[#FFF4B8] py-24 text-center sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <p className="text-xs font-black uppercase tracking-[.18em] text-black/45">Every camera. One story.</p>
          <h2 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl">Doživite svoj dogodek skozi oči vseh svojih gostov.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">Vse fotografije in videi na enem mestu. Brez aplikacije, brez zapletov in brez izgubljenih spominov.</p>
          <Link href="/dashboard/new" className="mt-9 inline-flex rounded-full bg-black px-9 py-4 font-black text-white">Ustvari galerijo brezplačno →</Link>
        </div>
      </section>

      <SeoFooter lang="sl" />
    </main>
  );
}
