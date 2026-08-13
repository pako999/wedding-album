import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export const metadata: Metadata = {
  title: "Guestcam — playful preview",
  description: "Kululu-inspired Guestcam design preview.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    no: "01",
    title: "Ustvari svoj dogodek",
    text: "V nekaj minutah dobiš zasebno galerijo in svojo QR kodo, pripravljeno za tisk ali deljenje.",
    image: "/events/wedding.webp",
  },
  {
    no: "02",
    title: "Gostje skenirajo in naložijo",
    text: "Brez aplikacije in brez registracije. Samo sken, izbira fotografij in nalaganje.",
    image: "/events/party.webp",
  },
  {
    no: "03",
    title: "Vse spomine imaš na enem mestu",
    text: "Fotografije in videi se zbirajo v tvoji galeriji, pripravljeni za ogled, deljenje in prenos.",
    image: "/events/birthday.webp",
  },
];

const features = [
  ["Brez aplikacije", "Gostje odprejo galerijo kar v brskalniku telefona."],
  ["Polna kakovost", "Fotografije ostanejo v originalni ločljivosti."],
  ["Live Photo Wall", "Nove slike se lahko prikazujejo na TV ali projektorju v živo."],
  ["QR predloge", "Pripravljene kartice za mize, vhod ali vabila."],
  ["Zasebna galerija", "Dostop samo prek povezave ali QR kode, po želji tudi z geslom."],
  ["Prenos vseh slik", "Po dogodku preneseš vse naenkrat kot ZIP."],
];

const occasions = [
  { label: "Poroke", image: "/events/wedding.webp" },
  { label: "Rojstni dnevi", image: "/events/birthday.webp" },
  { label: "Baby shower", image: "/events/babyshower.webp" },
  { label: "Poslovni eventi", image: "/events/business.webp" },
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function KululuPreviewPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF8] text-[#0F1729]">
      <header className="sticky top-0 z-50 border-b border-[#0F1729]/8 bg-[#FFFDF8]/95 backdrop-blur">
        <nav className="mx-auto flex h-[70px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Guestcam">
            <GuestcamLogo size="sm" showMark />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-[#0F1729]/65 md:flex">
            <a href="#how" className="hover:text-[#0F1729]">Kako deluje</a>
            <a href="#features" className="hover:text-[#0F1729]">Funkcionalnosti</a>
            <a href="#events" className="hover:text-[#0F1729]">Za dogodke</a>
            <Link href="/blog" className="hover:text-[#0F1729]">Blog</Link>
          </div>
          <Link href="/dashboard/new" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FFC94D] px-5 text-sm font-extrabold text-[#0F1729] transition-transform hover:-translate-y-0.5">
            Ustvari dogodek
            <Arrow />
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1240px] px-5 pb-12 pt-14 text-center sm:px-8 sm:pb-16 sm:pt-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#0F1729]/10 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#0F1729]/65">
            <span className="h-2 w-2 rounded-full bg-[#FFC94D]" />
            QR foto album za vsak dogodek
          </div>

          <h1 className="mx-auto mt-7 max-w-[980px] text-[clamp(3rem,7vw,6.6rem)] font-black leading-[0.92] tracking-[-0.055em]">
            Zberi fotografije
            <span className="block text-[#C77A00]">od vsakega gosta.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-[710px] text-lg leading-8 text-[#0F1729]/62 sm:text-xl">
            Gostje skenirajo QR kodo in dodajo fotografije ter videe v tvojo zasebno galerijo. Brez aplikacije, brez registracije in brez lovljenja slik po WhatsAppu.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard/new" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#FFC94D] px-8 text-base font-extrabold text-[#0F1729] shadow-[0_8px_0_#D99A1A] transition-transform hover:-translate-y-1">
              Začni brezplačno
              <Arrow />
            </Link>
            <Link href="/demo" className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[#0F1729]/12 bg-white px-7 text-base font-extrabold text-[#0F1729] hover:border-[#0F1729]/30">
              Poglej demo
            </Link>
          </div>

          <p className="mt-5 text-sm font-medium text-[#0F1729]/48">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>
        </div>

        <div className="mx-auto max-w-[1180px] px-5 pb-24 sm:px-8">
          <div className="relative mx-auto max-w-[980px]">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_32px_80px_rgba(15,23,41,.14)]">
              <Image src="/hero/guestcam-hero-photo.webp" alt="Guestcam QR foto album na dogodku" width={794} height={930} priority className="h-auto w-full object-cover sm:max-h-[690px]" />
            </div>
            <div className="absolute -bottom-7 left-3 hidden rotate-[-3deg] rounded-2xl bg-[#0F1729] px-5 py-4 text-left text-white shadow-xl sm:block">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FFC94D]">Gostje</p>
              <p className="mt-1 text-lg font-black">Skenirajo → naložijo → končano.</p>
            </div>
            <div className="absolute -right-2 top-12 hidden rotate-[3deg] rounded-2xl bg-[#FFC94D] px-5 py-4 text-left shadow-xl lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#0F1729]/55">Ti</p>
              <p className="mt-1 text-lg font-black">Vse slike dobiš na enem mestu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#0F1729]/8 bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-6 px-5 py-7 text-sm font-bold text-[#0F1729]/65 sm:grid-cols-3 sm:px-8">
          <div className="flex items-center justify-center gap-2 sm:justify-start"><Check /> Brez aplikacije</div>
          <div className="flex items-center justify-center gap-2"><Check /> Fotografije v originalni kakovosti</div>
          <div className="flex items-center justify-center gap-2 sm:justify-end"><Check /> Zasebna galerija</div>
        </div>
      </section>

      <section id="how" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="mx-auto max-w-[760px] text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C77A00]">Kako deluje</p>
            <h2 className="mt-4 text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-6xl">Tako preprosto, da ne rabiš ničesar razlagati gostom.</h2>
          </div>

          <div className="mt-16 space-y-6">
            {steps.map((step, index) => (
              <article key={step.no} className={`grid overflow-hidden rounded-[24px] border border-[#0F1729]/8 bg-white lg:grid-cols-2 ${index % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                <div className="relative min-h-[320px] bg-[#EEE7DA] sm:min-h-[420px]">
                  <Image src={step.image} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
                <div className="flex items-center p-8 sm:p-12 lg:p-16">
                  <div>
                    <span className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-[#FFC94D] px-3 text-sm font-black">{step.no}</span>
                    <h3 className="mt-6 text-3xl font-black tracking-[-0.035em] sm:text-4xl">{step.title}</h3>
                    <p className="mt-4 max-w-[520px] text-base leading-7 text-[#0F1729]/58 sm:text-lg">{step.text}</p>
                    {index === 0 && <Link href="/dashboard/new" className="mt-6 inline-flex items-center gap-2 font-extrabold underline decoration-[#FFC94D] decoration-4 underline-offset-4">Ustvari dogodek <Arrow /></Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#0F1729] py-24 text-white sm:py-32">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#FFC94D]">Vse, kar rabiš</p>
              <h2 className="mt-4 max-w-[760px] text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-6xl">En QR. Ena galerija. Cel dogodek.</h2>
            </div>
            <p className="max-w-[470px] text-base leading-7 text-white/55 lg:justify-self-end">Od prvega skena do zadnjega prenosa — Guestcam je narejen tako, da čim manj moti dogodek in čim več fotografij pride do tebe.</p>
          </div>

          <div className="mt-14 grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, text], index) => (
              <div key={title} className={`border-b border-white/15 py-8 sm:px-8 ${index % 2 === 0 ? "sm:pl-0 lg:px-8" : ""} ${index % 3 !== 0 ? "lg:border-l" : ""}`}>
                <p className="text-xl font-black">{title}</p>
                <p className="mt-3 text-sm leading-6 text-white/52">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFC94D] py-24 sm:py-28">
        <div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F1729]/55">Live Photo Wall</p>
            <h2 className="mt-4 text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-6xl">Fotografija pride na veliki zaslon nekaj trenutkov po nalaganju.</h2>
            <p className="mt-6 max-w-[560px] text-lg leading-8 text-[#0F1729]/65">Odpri Photo Wall na TV ali projektorju in pusti gostom, da v živo soustvarjajo vizualno zgodbo dogodka.</p>
            <Link href="/dashboard/new" className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-xl bg-[#0F1729] px-7 font-extrabold text-white">Preizkusi Guestcam <Arrow /></Link>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="relative col-span-7 row-span-2 min-h-[430px] overflow-hidden rounded-[22px] bg-black/10">
              <Image src="/events/party.webp" alt="Live photo wall na dogodku" fill className="object-cover" sizes="45vw" />
            </div>
            <div className="relative col-span-5 min-h-[205px] overflow-hidden rounded-[22px] bg-black/10">
              <Image src="/events/wedding.webp" alt="" fill className="object-cover" sizes="30vw" />
            </div>
            <div className="relative col-span-5 min-h-[210px] overflow-hidden rounded-[22px] bg-black/10">
              <Image src="/events/business.webp" alt="" fill className="object-cover" sizes="30vw" />
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C77A00]">Za vsak dogodek</p>
            <h2 className="mx-auto mt-4 max-w-[780px] text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-6xl">Kjer so ljudje, so fotografije vredne zbiranja.</h2>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {occasions.map((event, index) => (
              <figure key={event.label} className={index % 2 ? "lg:translate-y-8" : ""}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#EEE7DA]">
                  <Image src={event.image} alt={event.label} fill className="object-cover" sizes="25vw" />
                </div>
                <figcaption className="mt-4 text-lg font-black">{event.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#0F1729]/8 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#C77A00]">Pripravljeno za tvoj dogodek</p>
            <h2 className="mt-4 max-w-[780px] text-4xl font-black leading-[1] tracking-[-0.04em] sm:text-5xl">Ne prosi gostov za slike naslednji dan. Zberi jih že med dogodkom.</h2>
          </div>
          <Link href="/dashboard/new" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#FFC94D] px-8 text-base font-extrabold text-[#0F1729] shadow-[0_7px_0_#D99A1A]">Ustvari svoj QR album <Arrow /></Link>
        </div>
      </section>

      <footer className="bg-[#0F1729] py-10 text-white">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <GuestcamLogo size="sm" showMark variant="onDark" />
          <div className="flex flex-wrap gap-5 text-sm text-white/55">
            <Link href="/contact">Kontakt</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/privacy">Zasebnost</Link>
            <Link href="/terms">Pogoji</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
