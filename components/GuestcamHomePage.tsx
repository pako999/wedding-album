import { WeddingOfferBanner } from '@/components/wedding/WeddingOfferBanner';
import { weddingFeatures } from '@/lib/wedding/package-copy';
import { WeddingOfferPrice } from '@/components/wedding/WeddingOfferPrice';
import { weddingCopy } from "@/lib/wedding/copy";
import { WEDDING_PATHS } from "@/lib/wedding/contracts";
import { localePublicPath } from "@/lib/urls";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { LanguageSwitcher, HOME_HREFLANG } from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";
import { HomeMobileMenu } from "@/components/HomeMobileMenu";
import { SeoFooter } from "@/components/SeoFooter";
import { WallMiniDemo } from "@/components/WallMiniDemo";
import { GuestcamGuestFlowVisual } from "@/components/GuestcamGuestFlowVisual";
import { GuestcamShowcaseCarousel } from "@/components/GuestcamShowcaseCarousel";
import { PromoVideo } from "@/components/PromoVideo";
import { PREMIUM_REGULAR_PRICE_EUR } from "@/lib/plan-pricing";
import { weddingPricingFaq } from '@/lib/wedding-offer-copy';

export const HOME_FAQS = [
  weddingPricingFaq('sl'),
  ["Ali morajo gostje prenesti aplikacijo?", "Ne. Gostje skenirajo QR-kodo ter fotografije in videe naložijo neposredno v brskalniku — brez aplikacije in registracije."],
  ["Za katere dogodke je Guestcam primeren?", "Guestcam je primeren za poroke, rojstne dneve, baby showerje, krste, mature, zasebne zabave, koncerte, poslovne dogodke, konference in druge dogodke."],
  ["Ali so fotografije zasebne?", "Da. Album je dostopen prek zasebne povezave ali QR-kode, po želji pa ga lahko dodatno zaščitite z geslom."],
  ["V kakšni kakovosti se shranjujejo fotografije?", "Fotografije se shranjujejo v izvirni kakovosti, brez zmanjševanja ločljivosti."],
  ["Ali Guestcam podpira videe?", "Da. Plus vključuje do 100 videoposnetkov, Poročni premium pa vključuje neomejeno videoposnetkov."],
  ["Kaj se zgodi po dogodku?", "Organizator lahko fotografije in videe prenese ter jih varno arhivira. Poročni premium vključuje neomejen čas hrambe in dostopa."],
  ["Kaj pa, če je internet na dogodku počasen?", "Brez skrbi. Fotografije in videe lahko naložite tudi pozneje, ko imate boljšo internetno povezavo. Shranite si povezavo do albuma ali v album vnesite svoj e-poštni naslov. Guestcam vam bo povezavo poslal po e-pošti, zato lahko album kadar koli ponovno odprete in dodate svoje fotografije ali videe."],
  ["Ali lahko Guestcam pripravi QR-kartice in podstavke?", "Da. Ob paketu lahko naročite fizične QR-kartice z lesenimi ali zlatimi namiznimi podstavki."],
] as const;

const EVENTS = [
  ["Poroke", "/hero/wedding-avenue.webp", "Vsi spontani trenutki gostov v enem poročnem albumu.", "/sl/qr-koda-poroka"],
  ["Rojstni dnevi", "/events/birthday-party.webp", "Fotografije družine in prijateljev brez kaosa v WhatsAppu.", "/sl/slike-z-rojstnega-dne"],
  ["Baby shower", "/events/babyshower.webp", "Nežni trenutki in fotografije vseh povabljenih.", "/sl/baby-shower-slike"],
  ["Dekliščine in fantovščine", "/events/gromparty.webp", "Ena QR-koda za celotno zabavo in vse telefone.", ""],
  ["Zabave", "/events/party.webp", "Najboljši utrinki večera se sproti zbirajo v galeriji.", ""],
  ["Poslovni dogodki", "/events/organizacija-dogodkov-dogodek.webp", "Konference, promocije, sejmi in promocijske aktivacije.", "/sl/qr-koda-za-poslovne-dogodke"],
  ["Krsti in praznovanja", "/events/krst.webp", "Zasebni album za družino in prijatelje.", ""],
  ["Mature in diplome", "/events/matura.webp", "Skupinska galerija za večer, ki ga želite ohraniti.", ""],
] as const;

const FEATURES = [
  ["Brez aplikacije", "Gost skenira QR-kodo in naloži neposredno iz brskalnika."],
  ["Izvirna kakovost", "Fotografije ostanejo v izvirni ločljivosti."],
  ["Zasebna galerija", "Zasebna povezava, QR-koda in možnost gesla."],
  ["Fotografije in videi", "Fotografije in videi z različnih telefonov na enem mestu."],
  ["Live Photo Wall", "Nove fotografije se v nekaj sekundah prikažejo na televizorju ali projektorju."],
  ["Več jezikov", "Pripravljeno za slovenske in mednarodne goste."],
  ["Prenos ZIP", "Po dogodku prenesete in arhivirate vse fotografije in videe."],
  ["QR-predloge in tisk", "Predloge, tiskane kartice in namizni podstavki."],
] as const;

const PLANS = [
  ["Free", "0 €", "Preizkusite brez tveganja", ["Edinstvena QR-koda", "Prenos fotografij v polni kakovosti", "Do 20 fotografij", "1 videoposnetek", "Dostop do galerije 30 dni", "Brez varnostne kopije"]],
  ["Basic", "39 €", "Za manjše dogodke", ["Edinstvena QR-koda", "Prenos fotografij v polni kakovosti", "Do 1.000 fotografij", "Do 10 videoposnetkov", "Dostop do galerije 3 mesece", "Prenos vseh fotografij (ZIP)"]],
  ["Plus", "49 €", "Za poroke in večje dogodke", ["Edinstvena QR-koda", "Prenos fotografij v polni kakovosti", "Neomejeno število gostov", "Do 5.000 fotografij", "Do 100 videoposnetkov", "Dostop do galerije 1 leto", "Prenos vseh fotografij (ZIP)", "Galerija v živo (projekcija)", "Prilagojena stran z imeni", "E-poštna obvestila za par"]],
  ["Premium", `${PREMIUM_REGULAR_PRICE_EUR} €`, "Vse za vajino poroko na enem mestu", ["Edinstvena QR-koda", "Prenos fotografij v polni kakovosti", "Neomejeno število gostov", "Neomejeno fotografij", "Neomejeno videoposnetkov", "Neomejen čas hrambe in dostopa", "Prenos vseh fotografij in videov (ZIP)", "Galerija v živo (projekcija)", "Prilagojena stran z imeni", "Foto stena za televizor ali projektor",  "Premium oblikovne predloge", "Prednostna podpora"]],
] as const;

async function Header() {
  let signedIn = false;
  try { signedIn = !!(await auth()).userId; } catch {}
  const nav = [["#how","Kako deluje"],["#events","Dogodki"],["#templates","Predloge"],["#wall","Live Wall"],["#pricing","Cenik"],["/za-podjetja","Za podjetja"],["/blog","Blog"]] as const;
  return <header className="min-w-0 max-w-[calc(100%_-_1.5rem)] sm:max-w-[calc(100%_-_2rem)] lg:max-w-[calc(100%_-_3rem)] sticky top-3 z-50 mx-3 mt-3 rounded-2xl border border-black/10 bg-[#FFFDF8]/96 shadow-[0_12px_32px_rgba(17,17,17,.10)] backdrop-blur-xl sm:top-4 sm:mx-4 sm:mt-4 lg:mx-6">
    <nav className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-5 sm:px-7 lg:h-[80px] lg:px-8">
      <a href="/" aria-label="Guestcam" className="min-w-0"><GuestcamLogo size="md" showMark className="max-w-full [&>span]:truncate" /></a>
      <div className="mx-auto hidden items-center gap-3 lg:flex xl:gap-5">{nav.filter(([href]) => href !== "#templates" && href !== "#wall").flatMap(([href,label]) => { const current = href === "/blog" ? <a key={href} href={href} className="group relative whitespace-nowrap py-2 text-[14px] font-bold text-black/65 hover:text-black xl:text-[15px]">{label}<span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-[#F4B400] transition-transform group-hover:scale-x-100" /></a> : <a key={href} href={href} className="group relative whitespace-nowrap py-2 text-[14px] font-bold text-black/65 hover:text-black xl:text-[15px]">{label}<span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-[#F4B400] transition-transform group-hover:scale-x-100" /></a>; return href === "#pricing" ? [current, <a key="wedding-package" href={localePublicPath("sl", WEDDING_PATHS.sl)} className="group relative whitespace-nowrap py-2 text-[13px] font-black text-[#9A7000] hover:text-black xl:text-[15px]">{weddingCopy("sl").nav}<span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-100 rounded-full bg-[#F4B400]" /></a>] : [current]; })}</div>
      <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex"><LanguageSwitcher current="sl" languages={HOME_HREFLANG} ariaLabel="Spremeni jezik" /><HeaderAuthButtons lang="sl" signedIn={signedIn} />{!signedIn && <a href="/dashboard/new" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">Ustvarite album</a>}</div>
      <div className="ml-auto lg:hidden"><HomeMobileMenu signedIn={signedIn} lang="sl" links={nav.map(([href,label]) => ({href,label}))} labels={{open:"Odpri meni",close:"Zapri meni",language:"Jezik",languageAria:"Spremeni jezik",signIn:"Prijava",dashboard:"Nadzorna plošča",cta:"Ustvarite album"}} /></div>
    </nav>
  <WeddingOfferBanner lang="sl"/></header>;
}

function SectionTitle({ eyebrow, title, text, light=false }: { eyebrow:string; title:string; text?:string; light?:boolean }) {
  return <div className="max-w-4xl"><p className={`text-xs font-black uppercase tracking-[.18em] ${light ? "text-[#F4B400]" : "text-[#8F6900]"}`}>{eyebrow}</p><h2 className={`mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl ${light ? "text-white" : ""}`}>{title}</h2>{text && <p className={`mt-5 text-lg leading-8 ${light ? "text-white/55" : "text-black/55"}`}>{text}</p>}</div>;
}

export async function GuestcamHomePage() {
  const flow = [
    ["Skenira QR-kodo", "Galerija se odpre neposredno v brskalniku — brez aplikacije in računa.", "Gost"],
    ["Izbere fotografije ali videe", "Vsebino izbere na telefonu in jo naloži neposredno v galerijo.", "Telefon"],
    ["Vse je v vaši galeriji", "V organizatorskem delu pregledate vsebino in po želji vključite Live Photo Wall.", "Galerija"],
  ] as const;

  return <main className="min-h-screen overflow-x-clip bg-[#FFFDF8] text-[#111111]">
    <Header />

    <section className="relative border-b border-black/10">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-10 sm:gap-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
        <div className="relative z-10">
          <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black/55 shadow-sm">QR-koda za dogodke · fotografije gostov · poroke · rojstni dnevi · poslovni dogodki</div>
          <h1 className="mt-6 max-w-[760px] text-[clamp(2.5rem,6.5vw,5rem)] font-black leading-[1.07] tracking-[-.05em] sm:mt-7 sm:leading-[1.02] sm:tracking-[-.065em]">Vse fotografije gostov z vašega dogodka.<span className="mt-3 block text-[#B88700] sm:mt-2">En sam album.</span></h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-7 text-black/60 sm:mt-7 sm:text-xl sm:leading-8">Guestcam.si je slovenska QR galerija za dogodke. Gostje skenirajo QR-kodo in dodajo fotografije ter videe neposredno v vaš zasebni album — brez aplikacije in registracije. Primerno za poroke, rojstne dneve, zabave, koncerte in poslovne dogodke.</p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row"><a href="/dashboard/new" className="rounded-full bg-[#F4B400] px-8 py-4 text-center text-base font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.25)]">Začnite brezplačno →</a><a href="/demo" className="rounded-full border border-black/15 bg-white px-8 py-4 text-center text-base font-bold hover:bg-black hover:text-white">Poglejte demo</a></div>
          <p className="mt-4 text-sm font-semibold text-black/45">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>
          <a href="#print-service" className="mt-6 flex max-w-2xl items-start gap-3 rounded-[22px] border border-[#F4B400]/35 bg-[#FFF6CE] p-4 sm:p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400]">▣</span><span><strong className="block text-sm font-black sm:text-base">Ne želite sami tiskati?</strong><span className="mt-1 block text-sm leading-6 text-black/58">QR-kartice in podstavke natisnemo mi ter jih pošljemo pripravljene za dogodek, že od 3,00 € na kos.</span><span className="mt-2 block text-xs font-black text-[#8C6800]">Poglejte tiskane QR-podstavke →</span></span></a>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2">{[["QR","brez aplikacije"],["ZIP","vse datoteke"],["LIVE","Photo Wall"]].map(([a,b]) => <div key={a} className="rounded-[18px] border border-black/8 bg-white p-3.5 shadow-sm"><div className="text-xl font-black">{a}</div><div className="mt-1 text-[10px] font-semibold text-black/45 sm:text-xs">{b}</div></div>)}</div>
        </div>
        <div className="relative"><div className="absolute -left-6 top-20 h-52 w-52 rounded-full bg-[#F4B400]/20 blur-3xl" /><div className="relative grid grid-cols-12 grid-rows-2 gap-2 sm:gap-3">
          <div className="relative col-span-7 row-span-2 min-h-[420px] overflow-hidden rounded-[24px] bg-black/5 shadow-2xl sm:min-h-[540px] sm:rounded-[34px] lg:min-h-[620px]"><Image src="/hero/homepage-wedding-couple.webp" alt="Mladoporočenca med poljubom na poroki" fill priority quality={95} sizes="(max-width:640px) 72vw, (max-width:1024px) 58vw, 44vw" className="object-cover" /><div className="absolute bottom-5 left-5 hidden rounded-full bg-black/75 px-4 py-2 text-xs font-bold text-white sm:block">Poroka · pravi trenutki gostov</div></div>
          <div className="relative col-span-5 overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:rounded-[26px]"><Image src="/hero/party-family.webp" alt="Družinski selfie na poletni zabavi" fill sizes="(max-width:1024px) 42vw, 24vw" className="object-cover" /></div>
          <div className="relative col-span-5 overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:rounded-[26px]"><Image src="/hero/babyshower-friends.webp" alt="Prijateljice na baby showerju" fill sizes="(max-width:1024px) 42vw, 24vw" className="object-cover" /></div>
        </div></div>
      </div>
    </section>

    <PromoVideo />

    <section className="border-y border-black/10 bg-white"><div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-4 sm:px-8">{["Brez aplikacije","Fotografije in videi","Izvirna kakovost","Zasebna galerija"].map(x => <div key={x} className="flex items-center gap-3 rounded-2xl p-2 sm:justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF2B3] font-black">✓</span><span className="text-sm font-extrabold text-black/65">{x}</span></div>)}</div></section>

    <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-end"><SectionTitle eyebrow="Problem, ki ga Guestcam reši" title="Vsak gost fotografira, vi pa večine teh fotografij nikoli ne vidite." /><p className="max-w-2xl text-lg leading-8 text-black/55 lg:ml-auto">Po dogodku so fotografije razpršene med telefoni, skupinami v WhatsAppu in družbenimi omrežji. Guestcam jih z eno QR-kodo zbere na enem mestu.</p></div>
      <div className="mt-14 grid gap-4 lg:grid-cols-3">{[["01","Fotograf ne more biti povsod","Gostje ujamejo spontane trenutke, ki jih fotograf pogosto zamudi."],["02","Fotografije ostanejo na telefonih","Po dogodku se začne iskanje fotografij po telefonih in klepetih, pri tem pa se pogosto izgublja kakovost."],["03","Celotna zgodba dogodka","Guestcam združi poglede vseh gostov v en zasebni album."]].map(([n,t,d]) => <article key={n} className="rounded-[30px] border border-black/10 bg-white p-8 shadow-sm"><span className="text-sm font-black text-[#8F6900]">{n}</span><h3 className="mt-8 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></article>)}</div>
    </section>

    <section id="how" className="bg-[#F4B400] py-24 sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><SectionTitle eyebrow="Kako deluje" title="Trije koraki. To je vse." text="Galerijo pripravite v nekaj minutah, gostje pa potrebujejo samo telefon." /><div className="mt-14 grid gap-4 lg:grid-cols-3">{[["01","Ustvarite dogodek","Takoj dobite zasebno galerijo, povezavo in QR-kodo."],["02","Postavite QR-kodo","Dodajte jo na mize, pri vhodu, na vabilo, jedilnik ali zaslon."],["03","Gostje nalagajo","Fotografije in videi se sproti zbirajo v albumu."]].map(([n,t,d]) => <article key={n} className="rounded-[30px] bg-[#FFFDF8] p-8 shadow-lg"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-black text-white">{n}</div><h3 className="mt-8 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></article>)}</div></div></section>

    <section id="events" className="bg-[#111111] py-24 text-white sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><SectionTitle eyebrow="QR-galerija za dogodke" title="Ena QR-koda za fotografije gostov. Za skoraj vsak dogodek." text="Poroke, rojstni dnevi, baby showerji, zabave, koncerti, mature, krsti in poslovni dogodki." light /><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{EVENTS.map(([title,image,desc,href]) => { const card = <article className="group h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[.04]"><div className="relative aspect-[4/5]"><Image src={image} alt={`${title} — Guestcam QR-galerija`} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{desc}</p>{href ? <span className="mt-4 inline-flex text-xs font-black text-[#F4B400]">Preberite več →</span> : null}</div></article>; return href ? <a key={title} href={href} className="block h-full">{card}</a> : <div key={title}>{card}</div>; })}</div></div></section>

    <section id="templates" className="border-y border-black/5 bg-[#FFFDF8] py-20 sm:py-24 lg:py-28"><div className="mx-auto max-w-[1480px] px-5 sm:px-8">
      <div className="grid items-center gap-5 lg:grid-cols-[auto_1fr_auto]"><p className="text-center text-xs font-black uppercase tracking-[.19em] text-[#8F6900]">Predloge za tisk</p><div className="flex flex-wrap justify-center gap-5 text-xs font-bold text-black/52 sm:text-sm">{["Postavitev v treh korakih","Brez aplikacije","Brezplačen preizkus","Brez prijave za goste"].map(x => <span key={x}>✓ {x}</span>)}</div><a href="#template-showcase" className="mx-auto rounded-full border-2 border-[#F4B400] bg-white px-5 py-3 text-sm font-black hover:bg-[#F4B400]">Poglejte predloge kartic</a></div>
      <div className="mx-auto mt-12 max-w-4xl text-center"><h2 className="font-serif text-[clamp(3.2rem,7vw,6rem)] font-semibold leading-[.94] tracking-[-.05em]">Zberite vse trenutke.<span className="mt-2 block italic text-[#B88700]">Podoživite jih za vedno.</span></h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">Dodajte QR-kodo na mize in omogočite gostom, da v skupni galeriji Guestcam delijo fotografije in videe.</p></div>
      <GuestcamShowcaseCarousel />
      <div className="mt-9 text-center"><a href="/dashboard/new" className="inline-flex rounded-full bg-black px-7 py-4 font-black text-white">Ustvarite galerijo in QR-kodo →</a></div>
      <div id="print-service" className="mt-16 overflow-hidden rounded-[34px] bg-[#151515] text-white shadow-2xl"><div className="grid lg:grid-cols-[1.05fr_.95fr]"><div className="p-7 sm:p-10 lg:p-12"><span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-[11px] font-black uppercase tracking-[.14em] text-black">Tisk in namizni podstavki</span><h3 className="mt-6 text-3xl font-black sm:text-5xl">Mi natisnemo. Vi samo postavite na mize.</h3><p className="mt-5 text-lg leading-8 text-white/58">QR-kartice prilagodimo z vašo Guestcam QR-kodo, jih natisnemo in pošljemo pripravljene za dogodek.</p><div className="mt-7 grid gap-3 text-sm font-semibold text-white/72 sm:grid-cols-2"><span>✓ vaša Guestcam QR-koda</span><span>✓ leseni ali zlati podstavek</span><span>✓ tisk vključen</span><span>✓ dostava na vaš naslov</span></div><a href="/dashboard/new" className="mt-8 inline-flex rounded-full bg-[#F4B400] px-7 py-4 font-black text-black">Dodajte podstavke ob nakupu →</a></div><div className="grid grid-cols-2 gap-px bg-white/10">{[["/print/stand-wood.webp","Leseni podstavek","3,00 € na kos"],["/print/stand-gold.webp","Zlati podstavek","4,50 € na kos"]].map(([src,name,price]) => <div key={name} className="bg-[#202020] p-3 sm:p-5"><div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white"><Image src={src} alt={`${name} za Guestcam QR kartico`} fill sizes="25vw" className="object-cover" /></div><p className="mt-4 font-black">{name}</p><p className="mt-1 text-sm font-semibold text-[#F4B400]">{price}</p></div>)}</div></div></div>
    </div></section>

    <section id="features" className="py-20 sm:py-24"><div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]"><SectionTitle eyebrow="Zakaj Guestcam" title="Vse, kar potrebujete. Nič, česar gostje ne potrebujejo." text="Najpomembnejša je preprostost: gost vidi QR-kodo, jo skenira in naloži fotografije ali videe." /><div className="grid gap-3 sm:grid-cols-2">{FEATURES.map(([title,desc],i) => <article key={title} className={`rounded-[24px] border p-6 ${i===4 ? "border-[#F4B400]/55 bg-[#FFF9E7]" : "border-black/10 bg-white"}`}><div className="ml-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF8D8] font-black ring-1 ring-[#F4B400]/30">✓</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-black/52">{desc}</p></article>)}</div></div></section>

    <section id="wall" className="bg-[#F4B400] py-24 sm:py-32"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-black/55">Foto stena v živo</p><h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl">Fotografije gostov takoj na velikem zaslonu.</h2><p className="mt-6 text-lg leading-8 text-black/62">Odprite Guestcam na televizorju ali projektorju. Nove fotografije se prikažejo v nekaj sekundah.</p><ul className="mt-7 space-y-3 font-bold text-black/65"><li>✓ varna povezava za zaslon</li><li>✓ QR-koda na velikem zaslonu</li><li>✓ nove fotografije se prikažejo v ospredju</li><li>✓ primerno za poroke in poslovne dogodke</li></ul></div><div className="rounded-[34px] bg-black/12 p-3 shadow-2xl sm:p-5"><WallMiniDemo label="GUESTCAM LIVE" /></div></div></section>

    <section className="bg-white py-20 sm:py-24"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><SectionTitle eyebrow="Kako je videti v praksi" title="Kaj gost dejansko naredi po skeniranju QR-kode?" text="Dejanski potek v Guestcam od telefona gosta do vaše galerije — brez zapletenega postopka." /><div className="mt-8 grid gap-3">{flow.map(([title,desc],i) => <article key={title} className="flex gap-4 rounded-[22px] border border-black/10 bg-[#FFFDF8] p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF2B3] text-xs font-black">{String(i+1).padStart(2,"0")}</span><div><h3 className="font-black">{title}</h3><p className="mt-1.5 text-sm leading-6 text-black/52">{desc}</p></div></article>)}</div><a href="/demo" className="mt-8 inline-flex rounded-full bg-black px-7 py-4 font-black text-white">Poglejte pravi demo →</a></div><GuestcamGuestFlowVisual steps={flow} /></div></section>

    <section id="pricing" className="py-24 sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><div className="mx-auto max-w-3xl text-center"><SectionTitle eyebrow="Enkratno plačilo · brez naročnine" title="Preprosti paketi za vsak dogodek." text="Začnite brezplačno. Plačate šele, ko potrebujete več prostora in funkcij." /></div><div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{PLANS.map(([name,price,tag,features]) => <article key={name} className={`relative flex min-h-[480px] flex-col rounded-[30px] p-7 ${name==="Premium" ? "bg-[#111111] text-white ring-4 ring-[#F4B400] shadow-2xl" : name==="Plus" ? "border-2 border-[#F4B400]/60 bg-white shadow-md" : "border border-black/10 bg-white shadow-sm"}`}>{name==="Plus" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F4B400] px-4 py-1.5 text-[11px] font-black uppercase text-black">Najbolj priljubljen</span>}<p className="text-sm font-black uppercase tracking-[.15em]">{name === "Premium" ? weddingCopy("sl").plan : name}</p><p className="mt-2 text-sm opacity-50">{tag}</p>{name==="Premium" ? <WeddingOfferPrice lang="sl" compact/> : <p className="mt-6 text-5xl font-black">{price}</p>}<ul className="mt-8 flex flex-1 flex-col gap-3 text-sm opacity-75">{[...features, ...(name === "Premium" ? weddingFeatures("sl").slice(0,6).map(feature=>feature.title) : [])].map(f => <li key={f}>✓ {f}</li>)}</ul>{name === "Premium" && <a href="/porocni-paket" className="mt-5 text-sm font-bold underline underline-offset-4">{weddingCopy("sl").nav} →</a>}<a href={name === "Premium" ? "/dashboard/new?plan=premium" : "/dashboard/new"} className={`mt-8 rounded-full px-5 py-3.5 text-center font-black ${name==="Premium" ? "bg-[#F4B400] text-black shadow-lg" : name==="Plus" ? "bg-black text-white" : "bg-black text-white"}`}>{name === "Premium" ? weddingCopy("sl").choose : `Izberite ${name}`}</a></article>)}</div></div></section>

    <section id="business" className="bg-[#171717] py-24 text-white sm:py-32"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="relative min-h-[560px] overflow-hidden rounded-[34px]"><Image src="/events/organizacija-dogodkov-dogodek.webp" alt="Poslovni dogodek z Guestcam QR galerijo" fill sizes="50vw" className="object-cover" /></div><div><span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">Guestcam za podjetja</span><h2 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.045em] sm:text-6xl">Naj udeleženci ustvarijo vsebino za vaš dogodek.</h2><p className="mt-6 text-lg leading-8 text-white/58">Za konference, promocije, sejme, športne dogodke in agencije. Udeleženci nalagajo prek QR-kode, vsebine pa lahko prikažete v živo.</p><div className="mt-9 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2"><span>✓ lastna grafična podoba</span><span>✓ Live Photo Wall</span><span>✓ zbiranje kontaktov ob soglasju</span><span>✓ sponzorske slike na zaslonu</span><span>✓ nalaganje prek QR-kode brez aplikacije</span><span>✓ prenos vseh vsebin</span></div><div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5"><p className="text-sm font-semibold text-white/55">Poslovni paket · en dogodek · enkratno plačilo</p><p className="mt-1 text-4xl font-black text-[#F4B400]">149 €</p></div><a href="/za-podjetja" className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Poglejte poslovni cenik →</a></div></div></section>

    <section id="faq" className="bg-white py-24 sm:py-32"><div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[.65fr_1.35fr]"><SectionTitle eyebrow="Pogosta vprašanja" title="Vse, kar želite vedeti pred dogodkom." /><div className="divide-y divide-black/10 border-y border-black/10">{HOME_FAQS.map(([q,a]) => <details key={q} className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-black"><span>{q}</span><span className="text-2xl font-normal text-black/35 group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-6 pr-12 leading-7 text-black/55">{a}</p></details>)}</div></div></section>

    <section className="border-y border-black/10 bg-[#FFF4B8] py-24 text-center sm:py-28"><div className="mx-auto max-w-4xl px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-black/45">Vse fotografije. Ena zgodba.</p><h2 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl">Doživite svoj dogodek skozi oči vseh svojih gostov.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">Vse fotografije in videi na enem mestu. Brez aplikacije, brez zapletov in brez izgubljenih spominov.</p><a href="/dashboard/new" className="mt-9 inline-flex rounded-full bg-black px-9 py-4 font-black text-white">Ustvarite galerijo brezplačno →</a></div></section>
    <SeoFooter lang="sl" />
  </main>;
}
