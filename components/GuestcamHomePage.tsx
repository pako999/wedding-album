import Image from "next/image";
import Link from "next/link";
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

export const HOME_FAQS = [
  ["Ali morajo gostje prenesti aplikacijo?", "Ne. Gostje skenirajo QR kodo in fotografije ali videe naložijo neposredno v brskalniku, brez aplikacije in registracije."],
  ["Ali so fotografije zasebne?", "Da. Album je dostopen prek zasebne povezave ali QR kode, po želji pa ga lahko dodatno zaščitite z geslom."],
  ["V kakšni kakovosti se shranjujejo fotografije?", "Fotografije se shranjujejo v originalni kakovosti, brez zmanjševanja ločljivosti."],
  ["Ali Guestcam podpira videe?", "Da. Guestcam podpira fotografije in videe. Razpoložljiva količina je odvisna od izbranega paketa."],
  ["Kaj se zgodi po dogodku?", "Organizator lahko fotografije in videe prenese ter jih varno arhivira. Čas dostopa določa izbrani paket."],
  ["Kaj če je internet na dogodku počasen?", "Hitrost nalaganja je odvisna od povezave gosta. Pri večjih dogodkih priporočamo stabilen Wi‑Fi ali mobilni signal."],
  ["Ali lahko Guestcam pripravi QR kartice in podstavke?", "Da. Ob paketu lahko naročite fizične QR kartice z lesenimi ali zlatimi namiznimi podstavki."],
] as const;

const EVENTS = [
  ["Poroke", "/hero/wedding-avenue.webp", "Vsi spontani trenutki gostov v enem poročnem albumu."],
  ["Rojstni dnevi", "/events/birthday-party.webp", "Fotografije družine in prijateljev brez WhatsApp kaosa."],
  ["Baby shower", "/events/babyshower.webp", "Nežni trenutki in fotografije vseh povabljenih."],
  ["Dekliščine in fantovščine", "/events/gromparty.webp", "Ena QR koda za celotno zabavo in vse telefone."],
  ["Zabave", "/events/party.webp", "Najboljši utrinki večera se sproti zbirajo v galeriji."],
  ["Poslovni dogodki", "/events/organizacija-dogodkov-dogodek.webp", "Konference, promocije, sejmi in aktivacije."],
  ["Krsti in praznovanja", "/events/krst.webp", "Zasebni album za družino in prijatelje."],
  ["Mature in diplome", "/events/matura.webp", "Skupinska galerija za večer, ki ga želite ohraniti."],
] as const;

const FEATURES = [
  ["Brez aplikacije", "Gost skenira QR kodo in naloži neposredno iz brskalnika."],
  ["Originalna kakovost", "Fotografije ostanejo v originalni ločljivosti."],
  ["Zasebna galerija", "Zasebna povezava, QR koda in možnost gesla."],
  ["Fotografije + videi", "Vse vsebine iz različnih telefonov na enem mestu."],
  ["Live Photo Wall", "Nove fotografije v nekaj sekundah na TV-ju ali projektorju."],
  ["Več jezikov", "Pripravljeno za slovenske in mednarodne goste."],
  ["ZIP prenos", "Po dogodku prenesete in arhivirate vsebine."],
  ["QR predloge + tisk", "Predloge, tiskane kartice in namizni podstavki."],
] as const;

const PLANS = [
  ["Free", "0 €", "Preizkusite brez tveganja", ["Unikatna QR koda", "Prenos slik v polni kakovosti", "Do 20 fotografij", "1 videoposnetek", "Dostop 30 dni", "Brez varnostne kopije"]],
  ["Basic", "39 €", "Za manjše dogodke", ["Unikatna QR koda", "Prenos slik v polni kakovosti", "Do 1000 fotografij", "Do 10 videoposnetkov", "Dostop do galerije 3 mesece", "Prenos vseh slik (ZIP)"]],
  ["Plus", "49 €", "Za poroke in večje dogodke", ["Unikatna QR koda", "Prenos slik v polni kakovosti", "Neomejeno število gostov", "Do 5000 fotografij", "Do 100 videoposnetkov", "Dostop do galerije 1 leto", "Prenos vseh slik (ZIP)", "Live galerija (projekcija)", "Personalizirana stran z imeni", "E-mail obvestila za par"]],
  ["Premium", "99 €", "Za tiste, ki želite vse", ["Unikatna QR koda", "Prenos slik v polni kakovosti", "Neomejeno število gostov", "Neomejeno fotografij", "Do 100 videoposnetkov", "Dostop do galerije 2 leti", "Prenos vseh slik (ZIP)", "Live galerija (projekcija)", "Personalizirana stran z imeni", "Foto stena za TV / projektor", "Lastna domena (foto.vase-ime.si)", "Premium design predloge", "Prioritetna podpora"]],
] as const;

async function Header() {
  let signedIn = false;
  try { signedIn = !!(await auth()).userId; } catch {}
  const nav = [["#how","Kako deluje"],["#events","Dogodki"],["#templates","Predloge"],["#wall","Live Wall"],["#pricing","Cenik"],["#business","Za podjetja"],["/blog","Blog"]] as const;
  return <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FFFDF8]/95 backdrop-blur-xl">
    <nav className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-5 sm:px-7 lg:h-[80px] lg:px-8">
      <Link href="/" aria-label="Guestcam" className="shrink-0"><GuestcamLogo size="md" showMark /></Link>
      <div className="mx-auto hidden items-center gap-4 lg:flex xl:gap-6">{nav.map(([href,label]) => href === "/blog" ? <a key={href} href={href} className="group relative whitespace-nowrap py-2 text-[14px] font-bold text-black/65 hover:text-black xl:text-[15px]">{label}<span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-[#F4B400] transition-transform group-hover:scale-x-100" /></a> : <Link key={href} href={href} className="group relative whitespace-nowrap py-2 text-[14px] font-bold text-black/65 hover:text-black xl:text-[15px]">{label}<span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-[#F4B400] transition-transform group-hover:scale-x-100" /></Link>)}</div>
      <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex"><LanguageSwitcher current="sl" languages={HOME_HREFLANG} ariaLabel="Spremeni jezik" /><HeaderAuthButtons lang="sl" signedIn={signedIn} />{!signedIn && <Link href="/dashboard/new" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">Ustvari album</Link>}</div>
      <div className="ml-auto lg:hidden"><HomeMobileMenu signedIn={signedIn} lang="sl" links={nav.map(([href,label]) => ({href,label}))} labels={{open:"Odpri meni",close:"Zapri meni",language:"Jezik",languageAria:"Spremeni jezik",signIn:"Prijava",dashboard:"Nadzorna plošča",cta:"Ustvari album"}} /></div>
    </nav>
  </header>;
}

function SectionTitle({ eyebrow, title, text, light=false }: { eyebrow:string; title:string; text?:string; light?:boolean }) {
  return <div className="max-w-4xl"><p className={`text-xs font-black uppercase tracking-[.18em] ${light ? "text-[#F4B400]" : "text-[#8F6900]"}`}>{eyebrow}</p><h2 className={`mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl ${light ? "text-white" : ""}`}>{title}</h2>{text && <p className={`mt-5 text-lg leading-8 ${light ? "text-white/55" : "text-black/55"}`}>{text}</p>}</div>;
}

export async function GuestcamHomePage() {
  const flow = [
    ["Skenira QR kodo", "Galerija se odpre neposredno v brskalniku. Brez aplikacije in računa.", "Gost"],
    ["Izbere fotografije ali videe", "Vsebino izbere na telefonu in jo naloži neposredno v galerijo.", "Telefon"],
    ["Vse je v vaši galeriji", "V organizatorskem delu pregledate vsebino in po želji vključite Live Photo Wall.", "Galerija"],
  ] as const;

  return <main className="min-h-screen overflow-hidden bg-[#FFFDF8] text-[#111111]">
    <Header />

    <section className="relative border-b border-black/10">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-10 sm:gap-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
        <div className="relative z-10">
          <div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black/55 shadow-sm">QR koda za poroko · fotografije gostov</div>
          <h1 className="mt-6 max-w-[760px] text-[clamp(2.8rem,13vw,6.7rem)] font-black leading-[1.07] tracking-[-.05em] sm:mt-7 sm:leading-[1.02] sm:tracking-[-.065em]">Vse fotografije gostov.<span className="mt-3 block text-[#B88700] sm:mt-2">En sam album.</span></h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-7 text-black/60 sm:mt-7 sm:text-xl sm:leading-8">Gostje skenirajo QR kodo in dodajo fotografije ter videe neposredno v vašo zasebno Guestcam galerijo, brez aplikacije in registracije.</p>
          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row"><Link href="/dashboard/new" className="rounded-full bg-[#F4B400] px-8 py-4 text-center text-base font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.25)]">Začni brezplačno →</Link><Link href="/demo" className="rounded-full border border-black/15 bg-white px-8 py-4 text-center text-base font-bold hover:bg-black hover:text-white">Poglej demo</Link></div>
          <p className="mt-4 text-sm font-semibold text-black/45">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>
          <a href="#print-service" className="mt-6 flex max-w-2xl items-start gap-3 rounded-[22px] border border-[#F4B400]/35 bg-[#FFF6CE] p-4 sm:p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400]">▣</span><span><strong className="block text-sm font-black sm:text-base">Ne želite sami tiskati?</strong><span className="mt-1 block text-sm leading-6 text-black/58">QR kartice in podstavke natisnemo mi ter jih pošljemo pripravljene za dogodek, že od 3,00 €/kos.</span><span className="mt-2 block text-xs font-black text-[#8C6800]">Poglej tiskane QR podstavke →</span></span></a>
          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2">{[["QR","brez aplikacije"],["ZIP","vse datoteke"],["LIVE","Photo Wall"]].map(([a,b]) => <div key={a} className="rounded-[18px] border border-black/8 bg-white p-3.5 shadow-sm"><div className="text-xl font-black">{a}</div><div className="mt-1 text-[10px] font-semibold text-black/45 sm:text-xs">{b}</div></div>)}</div>
        </div>
        <div className="relative"><div className="absolute -left-6 top-20 h-52 w-52 rounded-full bg-[#F4B400]/20 blur-3xl" /><div className="relative grid grid-cols-12 grid-rows-2 gap-2 sm:gap-3">
          <div className="relative col-span-7 row-span-2 min-h-[420px] overflow-hidden rounded-[24px] bg-black/5 shadow-2xl sm:min-h-[540px] sm:rounded-[34px] lg:min-h-[620px]"><Image src="/hero/wedding-kiss.webp" alt="Mladoporočenca med poljubom na poroki" fill priority sizes="(max-width:1024px) 58vw, 33vw" className="object-cover" /><div className="absolute bottom-5 left-5 hidden rounded-full bg-black/75 px-4 py-2 text-xs font-bold text-white sm:block">Poroka · pravi trenutki gostov</div></div>
          <div className="relative col-span-5 overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:rounded-[26px]"><Image src="/hero/party-family.webp" alt="Družinski selfie na poletni zabavi" fill sizes="(max-width:1024px) 42vw, 24vw" className="object-cover" /></div>
          <div className="relative col-span-5 overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:rounded-[26px]"><Image src="/hero/babyshower-friends.webp" alt="Prijateljice na baby showerju" fill sizes="(max-width:1024px) 42vw, 24vw" className="object-cover" /></div>
        </div></div>
      </div>
    </section>

    <PromoVideo />

    <section className="bg-[#FFFDF8] px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto grid max-w-[1400px] overflow-hidden rounded-[30px] border border-black/10 bg-[#140313] text-white shadow-2xl lg:grid-cols-[1.35fr_.65fr]"><div className="relative min-h-[280px] bg-black sm:min-h-[360px]"><Image src="/events/nina-badric-maribox.webp" alt="Nina Badrić — Guestcam na dogodku" fill sizes="(max-width:1024px) 100vw, 68vw" className="object-contain" /></div><div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[.18em] text-[#FFD33D]">Guestcam v živo · 18. 9. 2026</p><h2 className="mt-4 text-3xl font-black leading-[1.04] tracking-[-.045em] sm:text-5xl">Guestcam bo z vami na koncertu Nine Badrić</h2><p className="mt-5 leading-7 text-white/70">Gostje bodo skenirali Guestcam QR kodo ter fotografije in videe takoj delili v skupno galerijo.</p><Link href="/blog" className="mt-7 inline-flex w-fit rounded-full bg-[#FFD33D] px-6 py-3.5 font-black text-black">Več o Guestcam →</Link></div></div></section>

    <section className="border-y border-black/10 bg-white"><div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-4 sm:px-8">{["Brez aplikacije","Fotografije + videi","Originalna kakovost","Zasebna galerija"].map(x => <div key={x} className="flex items-center gap-3 rounded-2xl p-2 sm:justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF2B3] font-black">✓</span><span className="text-sm font-extrabold text-black/65">{x}</span></div>)}</div></section>

    <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-end"><SectionTitle eyebrow="Problem, ki ga Guestcam reši" title="Vsak gost fotografira. Vi pa večine teh slik nikoli ne vidite." /><p className="max-w-2xl text-lg leading-8 text-black/55 lg:ml-auto">Po dogodku so fotografije razpršene med telefoni, WhatsApp skupinami in družbenimi omrežji. Guestcam jih z eno QR kodo zbere na enem mestu.</p></div>
      <div className="mt-14 grid gap-4 lg:grid-cols-3">{[["01","Fotograf ne more biti povsod","Gostje ujamejo spontane trenutke, ki jih fotograf pogosto zamudi."],["02","Fotografije ostanejo na telefonih","Po dogodku se začne prosjačenje za slike in izgubljanje kakovosti."],["03","Celotna zgodba dogodka","Guestcam združi poglede vseh gostov v en zasebni album."]].map(([n,t,d]) => <article key={n} className="rounded-[30px] border border-black/10 bg-white p-8 shadow-sm"><span className="text-sm font-black text-[#8F6900]">{n}</span><h3 className="mt-8 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></article>)}</div>
    </section>

    <section id="how" className="bg-[#F4B400] py-24 sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><SectionTitle eyebrow="Kako deluje" title="Trije koraki. To je vse." text="Galerijo pripravite v nekaj minutah, gostje pa potrebujejo samo telefon." /><div className="mt-14 grid gap-4 lg:grid-cols-3">{[["01","Ustvarite dogodek","Takoj dobite zasebno galerijo, povezavo in QR kodo."],["02","Postavite QR kodo","Dodajte jo na mize, vhod, vabilo, meni ali zaslon."],["03","Gostje nalagajo","Fotografije in videi se sproti zbirajo v albumu."]].map(([n,t,d]) => <article key={n} className="rounded-[30px] bg-[#FFFDF8] p-8 shadow-lg"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-black text-white">{n}</div><h3 className="mt-8 text-2xl font-black">{t}</h3><p className="mt-3 leading-7 text-black/55">{d}</p></article>)}</div></div></section>

    <section id="events" className="bg-[#111111] py-24 text-white sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><SectionTitle eyebrow="Za vsak poseben trenutek" title="En način zbiranja slik. Za skoraj vsak dogodek." text="Poroke, rojstni dnevi, baby showerji, zabave, mature, krsti in poslovni dogodki." light /><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{EVENTS.map(([title,image,desc]) => <article key={title} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[.04]"><div className="relative aspect-[4/5]"><Image src={image} alt={`${title} — Guestcam QR galerija`} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{desc}</p></div></article>)}</div></div></section>

    <section id="templates" className="border-y border-black/5 bg-[#FFFDF8] py-20 sm:py-24 lg:py-28"><div className="mx-auto max-w-[1480px] px-5 sm:px-8">
      <div className="grid items-center gap-5 lg:grid-cols-[auto_1fr_auto]"><p className="text-center text-xs font-black uppercase tracking-[.19em] text-[#8F6900]">Predloge za tisk</p><div className="flex flex-wrap justify-center gap-5 text-xs font-bold text-black/52 sm:text-sm">{["Postavitev v 3 korakih","Brez aplikacije","Brezplačen preizkus","Brez prijave za goste"].map(x => <span key={x}>✓ {x}</span>)}</div><Link href="#template-showcase" className="mx-auto rounded-full border-2 border-[#F4B400] bg-white px-5 py-3 text-sm font-black hover:bg-[#F4B400]">Poglej dizajne kartic</Link></div>
      <div className="mx-auto mt-12 max-w-4xl text-center"><h2 className="font-serif text-[clamp(3.2rem,7vw,6rem)] font-semibold leading-[.94] tracking-[-.05em]">Zberite vsak trenutek.<span className="mt-2 block italic text-[#B88700]">Podoživite jih za vedno.</span></h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">Dodajte QR kodo na mize in omogočite gostom, da v eni Guestcam galeriji delijo fotografije in videe.</p></div>
      <GuestcamShowcaseCarousel />
      <div className="mt-9 text-center"><Link href="/dashboard/new" className="inline-flex rounded-full bg-black px-7 py-4 font-black text-white">Ustvari galerijo in QR kodo →</Link></div>
      <div id="print-service" className="mt-16 overflow-hidden rounded-[34px] bg-[#151515] text-white shadow-2xl"><div className="grid lg:grid-cols-[1.05fr_.95fr]"><div className="p-7 sm:p-10 lg:p-12"><span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-[11px] font-black uppercase tracking-[.14em] text-black">Tisk + namizni podstavki</span><h3 className="mt-6 text-3xl font-black sm:text-5xl">Mi natisnemo. Vi samo postavite na mize.</h3><p className="mt-5 text-lg leading-8 text-white/58">QR kartice personaliziramo z vašo Guestcam QR kodo, natisnemo in pošljemo pripravljene za dogodek.</p><div className="mt-7 grid gap-3 text-sm font-semibold text-white/72 sm:grid-cols-2"><span>✓ vaša Guestcam QR koda</span><span>✓ leseni ali zlati podstavek</span><span>✓ tisk vključen</span><span>✓ dostava na vaš naslov</span></div><Link href="/dashboard/new" className="mt-8 inline-flex rounded-full bg-[#F4B400] px-7 py-4 font-black text-black">Dodaj podstavke ob nakupu →</Link></div><div className="grid grid-cols-2 gap-px bg-white/10">{[["/print/stand-wood.webp","Leseni podstavek","3,00 € / kos"],["/print/stand-gold.webp","Zlati podstavek","4,50 € / kos"]].map(([src,name,price]) => <div key={name} className="bg-[#202020] p-3 sm:p-5"><div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white"><Image src={src} alt={`${name} za Guestcam QR kartico`} fill sizes="25vw" className="object-cover" /></div><p className="mt-4 font-black">{name}</p><p className="mt-1 text-sm font-semibold text-[#F4B400]">{price}</p></div>)}</div></div></div>
    </div></section>

    <section id="features" className="py-20 sm:py-24"><div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]"><SectionTitle eyebrow="Zakaj Guestcam" title="Vse, kar potrebujete. Nič, česar gostje ne potrebujejo." text="Najpomembnejši del je preprostost: gost vidi QR kodo, skenira in naloži." /><div className="grid gap-3 sm:grid-cols-2">{FEATURES.map(([title,desc],i) => <article key={title} className={`rounded-[24px] border p-6 ${i===4 ? "border-[#F4B400]/55 bg-[#FFF9E7]" : "border-black/10 bg-white"}`}><div className="ml-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF8D8] font-black ring-1 ring-[#F4B400]/30">✓</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-black/52">{desc}</p></article>)}</div></div></section>

    <section id="wall" className="bg-[#F4B400] py-24 sm:py-32"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-black/55">Mural fotografij v živo</p><h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl">Fotografije gostov takoj na velikem zaslonu.</h2><p className="mt-6 text-lg leading-8 text-black/62">Odprite Guestcam na TV-ju ali projektorju. Nova fotografija se prikaže v nekaj sekundah.</p><ul className="mt-7 space-y-3 font-bold text-black/65"><li>✓ varen link za zaslon</li><li>✓ QR koda na velikem zaslonu</li><li>✓ nove fotografije pridejo v ospredje</li><li>✓ za poroke in poslovne dogodke</li></ul></div><div className="rounded-[34px] bg-black/12 p-3 shadow-2xl sm:p-5"><WallMiniDemo label="GUESTCAM LIVE" /></div></div></section>

    <section className="bg-white py-20 sm:py-24"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><SectionTitle eyebrow="Kako izgleda v praksi" title="Kaj gost dejansko naredi po skenu QR kode." text="Resnični Guestcam potek od telefona gosta do vaše galerije — brez zapletenega postopka." /><div className="mt-8 grid gap-3">{flow.map(([title,desc],i) => <article key={title} className="flex gap-4 rounded-[22px] border border-black/10 bg-[#FFFDF8] p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF2B3] text-xs font-black">{String(i+1).padStart(2,"0")}</span><div><h3 className="font-black">{title}</h3><p className="mt-1.5 text-sm leading-6 text-black/52">{desc}</p></div></article>)}</div><Link href="/demo" className="mt-8 inline-flex rounded-full bg-black px-7 py-4 font-black text-white">Poglej pravi demo →</Link></div><GuestcamGuestFlowVisual steps={flow} /></div></section>

    <section id="pricing" className="py-24 sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><div className="mx-auto max-w-3xl text-center"><SectionTitle eyebrow="Enkratno plačilo · brez naročnine" title="Preprosti paketi za vsak dogodek." text="Začnite brezplačno. Plačate šele, ko potrebujete več prostora in funkcij." /></div><div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{PLANS.map(([name,price,tag,features]) => <article key={name} className={`relative flex min-h-[480px] flex-col rounded-[30px] p-7 ${name==="Plus" ? "bg-black text-white ring-4 ring-[#F4B400] shadow-2xl" : "border border-black/10 bg-white shadow-sm"}`}>{name==="Plus" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F4B400] px-4 py-1.5 text-[11px] font-black uppercase text-black">Najbolj priljubljen</span>}<p className="text-sm font-black uppercase tracking-[.15em]">{name}</p><p className="mt-2 text-sm opacity-50">{tag}</p><p className="mt-6 text-5xl font-black">{price}</p><ul className="mt-8 flex flex-1 flex-col gap-3 text-sm opacity-75">{features.map(f => <li key={f}>✓ {f}</li>)}</ul><Link href="/dashboard/new" className={`mt-8 rounded-full px-5 py-3.5 text-center font-black ${name==="Plus" ? "bg-[#F4B400] text-black" : "bg-black text-white"}`}>Izberi {name}</Link></article>)}</div></div></section>

    <section id="business" className="bg-[#171717] py-24 text-white sm:py-32"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="relative min-h-[560px] overflow-hidden rounded-[34px]"><Image src="/events/organizacija-dogodkov-dogodek.webp" alt="Poslovni dogodek z Guestcam QR galerijo" fill sizes="50vw" className="object-cover" /></div><div><span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">Guestcam za podjetja</span><h2 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.045em] sm:text-6xl">Naj udeleženci ustvarijo vsebino za vaš dogodek.</h2><p className="mt-6 text-lg leading-8 text-white/58">Za konference, promocije, sejme, športne dogodke in agencije. Udeleženci nalagajo prek QR kode, vsebine pa lahko prikažete v živo.</p><div className="mt-9 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2"><span>✓ lastna grafična podoba</span><span>✓ Live Photo Wall</span><span>✓ zbiranje kontaktov ob soglasju</span><span>✓ sponzorski oglasi</span><span>✓ QR upload brez aplikacije</span><span>✓ prenos vseh vsebin</span></div><Link href="/contact" className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">Ponudba za podjetja →</Link></div></div></section>

    <section id="faq" className="bg-white py-24 sm:py-32"><div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[.65fr_1.35fr]"><SectionTitle eyebrow="Pogosta vprašanja" title="Vse, kar želite vedeti pred dogodkom." /><div className="divide-y divide-black/10 border-y border-black/10">{HOME_FAQS.map(([q,a]) => <details key={q} className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-black"><span>{q}</span><span className="text-2xl font-normal text-black/35 group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-6 pr-12 leading-7 text-black/55">{a}</p></details>)}</div></div></section>

    <section className="border-y border-black/10 bg-[#FFF4B8] py-24 text-center sm:py-28"><div className="mx-auto max-w-4xl px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-black/45">Vse fotografije. Ena zgodba.</p><h2 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl">Doživite svoj dogodek skozi oči vseh svojih gostov.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">Vse fotografije in videi na enem mestu. Brez aplikacije, brez zapletov in brez izgubljenih spominov.</p><Link href="/dashboard/new" className="mt-9 inline-flex rounded-full bg-black px-9 py-4 font-black text-white">Ustvari galerijo brezplačno →</Link></div></section>
    <SeoFooter lang="sl" />
  </main>;
}
