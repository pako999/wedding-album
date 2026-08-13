import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export const metadata: Metadata = {
  title: "Guestcam — design preview",
  description: "Preview novega uredniškega dizajna Guestcam.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    title: "Ustvarite dogodek",
    text: "V nekaj minutah dobite svojo zasebno galerijo in QR kodo, pripravljeno za tisk ali deljenje.",
  },
  {
    title: "Gostje skenirajo QR",
    text: "Odpre se galerija v brskalniku. Brez aplikacije, brez registracije in brez dodatnih navodil.",
  },
  {
    title: "Vse ostane na enem mestu",
    text: "Fotografije in videi se zbirajo v originalni kakovosti. Po dogodku jih prenesete naenkrat.",
  },
];

const benefits = [
  ["Brez aplikacije", "Gostje uporabijo samo kamero telefona in QR kodo."],
  ["Originalna kakovost", "Fotografije niso stisnjene kot pri pošiljanju prek družbenih omrežij."],
  ["Zasebna galerija", "Dostop lahko dodatno zaščitite z geslom."],
  ["Shranjevanje v EU", "Podatki ostanejo na evropski infrastrukturi."],
  ["Prenos ZIP", "Po dogodku prenesete vse fotografije naenkrat."],
  ["Več jezikov", "Gostje lahko uporabljajo vmesnik v svojem jeziku."],
];

const plans = [
  { name: "Basic", price: "39 €", note: "Za manjša praznovanja in dogodke." },
  { name: "Plus", price: "49 €", note: "Najboljša izbira za poroke in večje dogodke.", featured: true },
  { name: "Premium", price: "99 €", note: "Za dogodke, kjer želite največ prostora in možnosti." },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-[#F7F6F2] text-[#171A1F] antialiased selection:bg-[#E7D5B7]">
      <header className="sticky top-0 z-50 border-b border-[#171A1F]/10 bg-[#F7F6F2]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/design-preview" aria-label="Guestcam design preview" className="flex items-center">
            <GuestcamLogo size="sm" showMark={true} />
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] font-medium text-[#575B61] md:flex" aria-label="Glavna navigacija">
            <a href="#how" className="transition-colors hover:text-[#171A1F]">Kako deluje</a>
            <a href="#events" className="transition-colors hover:text-[#171A1F]">Za dogodke</a>
            <a href="#pricing" className="transition-colors hover:text-[#171A1F]">Paketi</a>
            <Link href="/blog" className="transition-colors hover:text-[#171A1F]">Blog</Link>
          </nav>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 rounded-full bg-[#171A1F] px-4 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A1F] sm:px-5"
          >
            Ustvari galerijo
            <ArrowIcon />
          </Link>
        </div>
      </header>

      <section className="border-b border-[#171A1F]/10">
        <div className="mx-auto grid max-w-7xl gap-11 px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-6 lg:pr-6">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6127]">
              Fotografije gostov, na enem mestu
            </p>
            <h1 className="max-w-[720px] text-[clamp(2.55rem,5.3vw,4.65rem)] font-semibold leading-[0.99] tracking-[-0.045em]">
              Vsi spomini z dogodka. Brez lovljenja po WhatsAppu.
            </h1>
            <p className="mt-7 max-w-[560px] text-[17px] leading-7 text-[#5D6166] sm:text-lg">
              Gostje skenirajo QR kodo in svoje fotografije ter videe naložijo naravnost v vašo zasebno galerijo. Brez aplikacije in brez registracije.
            </p>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 rounded-full bg-[#171A1F] px-7 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A1F]"
              >
                Ustvari brezplačen album
                <ArrowIcon />
              </Link>
              <a href="#how" className="text-sm font-semibold underline decoration-[#A16E29]/45 underline-offset-4 transition-colors hover:text-[#8A6127]">
                Poglej, kako deluje
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#171A1F]/10 pt-5 text-[13px] text-[#666A6F]">
              <span>Brez aplikacije</span>
              <span>Originalna kakovost</span>
              <span>Zasebna galerija</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative pb-10 sm:pl-10 sm:pb-12">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#DDD8CF] sm:aspect-[5/6]">
                <Image
                  src="/events/wedding.webp"
                  alt="Poročni dogodek, kjer gostje delijo fotografije z Guestcam"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 hidden w-[42%] overflow-hidden rounded-[10px] border-[6px] border-[#F7F6F2] bg-[#DDD8CF] sm:block">
                <div className="relative aspect-[4/3]">
                  <Image src="/events/party.webp" alt="" fill sizes="260px" className="object-cover" />
                </div>
              </div>
              <div className="absolute right-3 top-4 bg-[#F7F6F2] px-4 py-3 text-right text-xs leading-5 shadow-[0_10px_30px_rgba(23,26,31,0.10)] sm:right-[-18px] sm:top-10">
                <strong className="block text-[13px] font-semibold text-[#171A1F]">QR → fotografija → galerija</strong>
                <span className="text-[#666A6F]">v nekaj sekundah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6127]">Zakaj Guestcam</p>
            <h2 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">
              Fotografije, ki bi sicer ostale na telefonih gostov.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-1">
            <p className="max-w-2xl text-lg leading-8 text-[#5D6166]">
              Fotograf ujame pomembne trenutke. Gostje pa ujamejo vse tisto vmes: priprave, reakcije, smeh za mizo in trenutke, ki jih vidijo samo oni. Guestcam te fotografije zbere brez skupinskih chatov, map in opominjanja po dogodku.
            </p>
            <div className="mt-10 grid gap-0 border-y border-[#171A1F]/10 sm:grid-cols-2">
              <div className="py-6 sm:pr-8">
                <p className="text-sm font-semibold">Za goste</p>
                <p className="mt-2 text-sm leading-6 text-[#666A6F]">Skenirajo. Izberejo fotografije. Naložijo. To je vse.</p>
              </div>
              <div className="border-t border-[#171A1F]/10 py-6 sm:border-l sm:border-t-0 sm:pl-8">
                <p className="text-sm font-semibold">Za organizatorja</p>
                <p className="mt-2 text-sm leading-6 text-[#666A6F]">Ena galerija in en prenos vseh spominov po dogodku.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-[#171A1F]/10 bg-[#F7F6F2] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6127]">Kako deluje</p>
              <h2 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Tri koraki. Nobene aplikacije.</h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#666A6F] lg:col-span-5 lg:col-start-8">
              QR kodo lahko postavite na mize, vabilo, ekran ali kamorkoli jo bodo gostje opazili.
            </p>
          </div>

          <div className="mt-14 grid border-t border-[#171A1F]/15 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className={`py-8 md:min-h-[245px] md:px-8 ${index === 0 ? "md:pl-0" : "border-t border-[#171A1F]/10 md:border-l md:border-t-0"}`}>
                <span className="text-xs tabular-nums text-[#8A6127]">0{index + 1}</span>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-4 max-w-[34ch] text-sm leading-6 text-[#666A6F]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6127]">Za vsak dogodek</p>
              <h2 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Ista preprosta ideja. Čisto različni trenutki.</h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-[#666A6F] lg:col-span-4 lg:col-start-9">
              Poroke, rojstni dnevi, baby showerji, poslovni dogodki, mature in praznovanja vseh vrst.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12">
            <figure className="lg:col-span-7">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[10px] bg-[#E8E3DA]">
                <Image src="/events/wedding.webp" alt="Poroka" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 flex items-center justify-between text-sm"><span className="font-semibold">Poroke</span><span className="text-[#777B80]">vsi pogledi enega dne</span></figcaption>
            </figure>

            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <figure>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] bg-[#E8E3DA]">
                  <Image src="/events/business.webp" alt="Poslovni dogodek" fill sizes="(max-width: 1024px) 50vw, 38vw" className="object-cover" />
                </div>
                <figcaption className="mt-3 text-sm font-semibold">Poslovni dogodki</figcaption>
              </figure>
              <figure>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[10px] bg-[#E8E3DA]">
                  <Image src="/events/birthday.webp" alt="Rojstni dan" fill sizes="(max-width: 1024px) 50vw, 38vw" className="object-cover" />
                </div>
                <figcaption className="mt-3 text-sm font-semibold">Rojstni dnevi in praznovanja</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#EDE8DF] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6127]">Kaj dobite</p>
            <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] sm:text-5xl">Manj razlaganja gostom. Več dejanskih fotografij.</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#666A6F]">
              Osnovna izkušnja je namenoma preprosta. Vsaka dodatna funkcija mora pomagati pri zbiranju, varovanju ali shranjevanju fotografij.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border-t border-[#171A1F]/15">
              {benefits.map(([title, text]) => (
                <div key={title} className="grid gap-3 border-b border-[#171A1F]/15 py-5 sm:grid-cols-[190px_1fr] sm:gap-8">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <span className="text-[#8A6127]"><CheckIcon /></span>
                    {title}
                  </div>
                  <p className="text-sm leading-6 text-[#666A6F]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A6127]">Paketi</p>
            <h2 className="text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Enkratno plačilo. Brez naročnine.</h2>
            <p className="mt-5 text-base leading-7 text-[#666A6F]">Začnete lahko brezplačno in paket izberete, ko veste, kaj potrebujete.</p>
          </div>

          <div className="mt-12 border-y border-[#171A1F]/15">
            {plans.map((plan) => (
              <div key={plan.name} className={`grid items-center gap-4 border-b border-[#171A1F]/10 py-6 last:border-b-0 sm:grid-cols-[1fr_2fr_auto] sm:gap-8 ${plan.featured ? "bg-[#F7F6F2] px-5 sm:-mx-5" : ""}`}>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.featured && <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A6127]">Najbolj priljubljen</span>}
                </div>
                <p className="text-sm leading-6 text-[#666A6F]">{plan.note}</p>
                <p className="text-2xl font-semibold tabular-nums">{plan.price}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <p className="text-sm text-[#666A6F]">Brezplačen preizkus pred nakupom.</p>
            <Link href="/dashboard/new" className="inline-flex items-center gap-2 rounded-full bg-[#171A1F] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px">
              Ustvari svoj dogodek
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#171A1F] py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D3B77C]">Za naslednji dogodek</p>
            <h2 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl">Naj gostje fotografirajo. Guestcam naj poskrbi, da fotografije pridejo do vas.</h2>
          </div>
          <div className="lg:col-span-3 lg:col-start-10">
            <Link href="/dashboard/new" className="inline-flex w-full items-center justify-between rounded-full bg-[#F7F6F2] px-6 py-4 text-sm font-semibold text-[#171A1F] transition-transform hover:-translate-y-px">
              Ustvari galerijo
              <ArrowIcon />
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/55">Brez aplikacije za goste. Začnete lahko brezplačno.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#171A1F]/10 bg-[#F7F6F2]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <GuestcamLogo size="sm" showMark={true} />
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#686C71]">
            <Link href="/privacy" className="hover:text-[#171A1F]">Zasebnost</Link>
            <Link href="/terms" className="hover:text-[#171A1F]">Pogoji</Link>
            <Link href="/gdpr" className="hover:text-[#171A1F]">GDPR</Link>
            <Link href="/contact" className="hover:text-[#171A1F]">Kontakt</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
