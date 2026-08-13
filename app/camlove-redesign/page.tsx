import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CamLoveLogo } from "@/components/CamLoveLogo";
import { WallMiniDemo } from "@/components/WallMiniDemo";

export const metadata: Metadata = {
  title: "CamLove — photo-first redesign preview",
  description: "Photo and video led CamLove homepage redesign preview.",
  robots: { index: false, follow: false },
};

const moments = [
  { src: "/events/wedding.webp", label: "Poroke" },
  { src: "/events/party.webp", label: "Zabave" },
  { src: "/events/birthday.webp", label: "Rojstni dnevi" },
  { src: "/events/business.webp", label: "Poslovni dogodki" },
  { src: "/events/babyshower.webp", label: "Baby shower" },
  { src: "/events/matura.webp", label: "Mature" },
];

const steps = [
  ["01", "Ustvari dogodek", "Dobiš zasebno galerijo, QR kodo in povezavo za goste."],
  ["02", "Gostje samo skenirajo", "Brez aplikacije in brez računa. Odprejo kamero, skenirajo in naložijo."],
  ["03", "Vse se zbira v živo", "Fotografije in videi so takoj v tvoji galeriji — pripravljeni za ogled in prenos."],
];

const features = [
  ["Foto + video", "Originalna kakovost brez pošiljanja po chatih."],
  ["Live Photo Wall", "Nove fotografije se prikažejo na TV ali projektorju v nekaj sekundah."],
  ["Zasebno", "Galerija je dostopna samo prek tvoje povezave ali QR kode."],
  ["Brez aplikacije", "Gostje ne nameščajo ničesar in ne ustvarjajo računa."],
  ["ZIP prenos", "Po dogodku vse preneseš naenkrat."],
  ["QR za tisk", "Pripravljene kartice za mize, vabila ali vhod."],
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden>
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Play() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M8 5.5v13l10-6.5-10-6.5Z" />
    </svg>
  );
}

export default function CamLoveRedesignPage() {
  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#111111]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#F7F5EF]/94 backdrop-blur-md">
        <nav className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="CamLove">
            <CamLoveLogo size="sm" showMark />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-black/60 md:flex">
            <a href="#how" className="transition-colors hover:text-black">Kako deluje</a>
            <a href="#wall" className="transition-colors hover:text-black">Live Wall</a>
            <a href="#moments" className="transition-colors hover:text-black">Dogodki</a>
            <a href="#features" className="transition-colors hover:text-black">Funkcije</a>
          </div>

          <Link href="/dashboard/new" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
            Ustvari galerijo <Arrow />
          </Link>
        </nav>
      </header>

      {/* Hero: editorial copy + full-bleed media, intentionally not SaaS cards */}
      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 pb-10 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[.82fr_1.18fr] lg:items-end lg:gap-16">
          <div className="pb-2 lg:pb-10">
            <p className="mb-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8F6900]">Every camera. One story.</p>
            <h1 className="max-w-[720px] text-[clamp(3rem,6.8vw,6.8rem)] font-black leading-[0.91] tracking-[-0.06em]">
              Vsi trenutki,
              <span className="block font-serif font-normal italic text-[#8F6900]">ki jih vidiš šele potem.</span>
            </h1>
            <p className="mt-7 max-w-[560px] text-lg leading-8 text-black/58 sm:text-xl">
              CamLove zbere fotografije in videe vseh gostov v eno zasebno galerijo. Ena QR koda. Brez aplikacije. Brez lovljenja po WhatsAppu.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/dashboard/new" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#F4B400] px-8 text-base font-extrabold text-black transition-transform hover:-translate-y-0.5">
                Začni brezplačno <Arrow />
              </Link>
              <Link href="/demo" className="inline-flex min-h-14 items-center justify-center gap-2 px-4 text-base font-bold underline decoration-black/20 underline-offset-8 hover:decoration-black">
                Poglej demo
              </Link>
            </div>
            <p className="mt-5 text-sm font-medium text-black/42">Brez kreditne kartice · pripravljeno v manj kot 2 minutah</p>
          </div>

          <div className="relative min-h-[620px] sm:min-h-[760px]">
            <div className="absolute inset-x-[5%] top-0 h-[78%] overflow-hidden rounded-[26px] bg-black">
              <Image src="/hero/camlove-hero-photo.webp" alt="Gost uporablja CamLove QR galerijo na dogodku" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 56vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/65">V živo z dogodka</p>
                  <p className="mt-1 text-lg font-bold">Gostje fotografirajo. CamLove zbira.</p>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"><Play /></span>
              </div>
            </div>

            <div className="absolute bottom-[5%] left-0 w-[40%] rotate-[-2deg] overflow-hidden rounded-[18px] border-[8px] border-[#F7F5EF] bg-white shadow-[0_18px_50px_rgba(0,0,0,.16)] sm:w-[36%]">
              <div className="relative aspect-[4/5]">
                <Image src="/events/party.webp" alt="" fill className="object-cover" sizes="22vw" />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-[46%] rotate-[2deg] overflow-hidden rounded-[18px] border-[8px] border-[#F7F5EF] bg-white shadow-[0_18px_50px_rgba(0,0,0,.16)] sm:w-[42%]">
              <div className="relative aspect-[4/3]">
                <Image src="/events/wedding.webp" alt="" fill className="object-cover" sizes="24vw" />
              </div>
              <div className="flex items-center justify-between bg-white px-4 py-3 text-xs font-bold">
                <span>+ nova fotografija</span>
                <span className="text-[#8F6900]">pravkar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-5 px-5 py-7 text-center text-sm font-bold text-black/60 sm:grid-cols-4 sm:px-8">
          <span>Foto + video</span><span>Brez aplikacije</span><span>Originalna kakovost</span><span>Zasebna galerija</span>
        </div>
      </section>

      {/* Visual gallery proof */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8F6900]">Ne samo galerija</p>
              <h2 className="mt-4 text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-6xl">Dogodek skozi oči vseh.</h2>
            </div>
            <p className="max-w-[630px] text-lg leading-8 text-black/55 lg:justify-self-end">Profesionalni fotograf ujame pomembne trenutke. Gostje ujamejo vse vmes — plesišče, mize, zakulisje, reakcije in tiste fotografije, ki običajno ostanejo na telefonu.</p>
          </div>

          <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[230px] lg:grid-cols-12 lg:auto-rows-[210px]">
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-[20px] lg:col-span-5"><Image src="/events/wedding.webp" alt="Poroka" fill className="object-cover" sizes="42vw" /></div>
            <div className="relative col-span-1 overflow-hidden rounded-[20px] lg:col-span-3"><Image src="/events/party.webp" alt="Zabava" fill className="object-cover" sizes="25vw" /></div>
            <div className="relative col-span-1 overflow-hidden rounded-[20px] lg:col-span-4"><Image src="/events/business.webp" alt="Poslovni dogodek" fill className="object-cover" sizes="30vw" /></div>
            <div className="relative col-span-1 overflow-hidden rounded-[20px] lg:col-span-4"><Image src="/events/birthday.webp" alt="Rojstni dan" fill className="object-cover" sizes="30vw" /></div>
            <div className="relative col-span-1 overflow-hidden rounded-[20px] lg:col-span-3"><Image src="/events/babyshower.webp" alt="Baby shower" fill className="object-cover" sizes="25vw" /></div>
          </div>
        </div>
      </section>

      {/* How: typographic, not generic cards */}
      <section id="how" className="bg-black py-24 text-white sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#F4B400]">Kako deluje</p>
          <h2 className="mt-4 max-w-[900px] text-4xl font-black leading-[1] tracking-[-0.05em] sm:text-6xl">Tri stvari. To je vse.</h2>
          <div className="mt-14 border-t border-white/20">
            {steps.map(([no, title, text]) => (
              <div key={no} className="grid gap-4 border-b border-white/20 py-8 sm:grid-cols-[90px_1fr_1fr] sm:items-center sm:gap-8 sm:py-10">
                <span className="font-serif text-3xl italic text-[#F4B400]">{no}</span>
                <h3 className="text-2xl font-black sm:text-3xl">{title}</h3>
                <p className="max-w-[520px] leading-7 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product-in-motion section */}
      <section id="wall" className="bg-[#F4B400] py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-black/55">Live Photo Wall</p>
            <h2 className="mt-4 text-4xl font-black leading-[.98] tracking-[-0.05em] sm:text-6xl">Fotografija gre z gosta naravnost na veliki zaslon.</h2>
            <p className="mt-6 max-w-[560px] text-lg leading-8 text-black/65">Odpri CamLove na TV ali projektorju. Nove fotografije se po nalaganju pojavijo v živo in postanejo del dogodka.</p>
            <Link href="/dashboard/new" className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-black px-7 font-bold text-white">Preizkusi CamLove <Arrow /></Link>
          </div>
          <div className="rounded-[28px] bg-[#E2A600] p-3 sm:p-5"><WallMiniDemo label="CAMLOVE LIVE" /></div>
        </div>
      </section>

      {/* Video / photo split storytelling */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative min-h-[620px] overflow-hidden rounded-[24px] bg-black">
              <Image src="/events/party.webp" alt="Video in fotografije z dogodka" fill className="object-cover opacity-85" sizes="50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"><Play /></span>
                <h3 className="mt-6 max-w-[560px] text-4xl font-black leading-[1] tracking-[-0.04em]">Ne zbiraj samo lepih slik. Zberi cel dogodek.</h3>
                <p className="mt-4 max-w-[520px] leading-7 text-white/65">Fotografije, kratki videi, spontani trenutki in odzivi gostov — vse skupaj v isti zgodbi.</p>
              </div>
            </div>
            <div className="flex min-h-[620px] flex-col justify-between rounded-[24px] bg-[#F7F5EF] p-8 sm:p-10">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8F6900]">Za goste je skoraj nevidno</p>
                <h3 className="mt-4 max-w-[560px] text-4xl font-black leading-[1] tracking-[-0.04em] sm:text-5xl">Sken. Izbira. Upload.</h3>
                <p className="mt-5 max-w-[520px] text-lg leading-8 text-black/55">Ni app store-a, ni registracije, ni gesla za nove uporabnike. To je razlog, da gostje dejansko sodelujejo.</p>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-3">
                {["/events/wedding.webp","/events/birthday.webp","/events/business.webp"].map((src, i) => (
                  <div key={src} className={`relative aspect-[3/4] overflow-hidden rounded-[16px] ${i === 1 ? "-translate-y-5" : ""}`}><Image src={src} alt="" fill className="object-cover" sizes="16vw" /></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-black/10 py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8F6900]">Vse, kar rabiš</p>
              <h2 className="mt-4 text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-5xl">Manj software občutka. Več spominov.</h2>
            </div>
            <div className="grid border-t border-black/15 sm:grid-cols-2">
              {features.map(([title, text], index) => (
                <div key={title} className={`border-b border-black/15 py-7 sm:px-7 ${index % 2 === 0 ? "sm:pl-0" : "sm:border-l"}`}>
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-2 max-w-[390px] text-sm leading-6 text-black/52">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="moments" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8F6900]">Za vse vrste dogodkov</p>
              <h2 className="mt-4 max-w-[760px] text-4xl font-black leading-[1] tracking-[-0.045em] sm:text-6xl">Kjer so ljudje, so trenutki.</h2>
            </div>
            <p className="max-w-[420px] text-base leading-7 text-black/52">Poroka ali brand event — isti problem: najboljše fotografije so razpršene med telefoni gostov.</p>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
            {moments.map((item, index) => (
              <figure key={item.label} className={index % 3 === 1 ? "lg:translate-y-8" : ""}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#EEEAE2]"><Image src={item.src} alt={item.label} fill className="object-cover" sizes="33vw" /></div>
                <figcaption className="mt-4 flex items-center justify-between border-b border-black/10 pb-4 text-lg font-black"><span>{item.label}</span><Arrow /></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#F4B400]">camlove.me</p>
            <h2 className="mt-4 max-w-[900px] text-4xl font-black leading-[.98] tracking-[-0.05em] sm:text-6xl">Ne išči fotografij po dogodku. Zberi jih med njim.</h2>
          </div>
          <Link href="/dashboard/new" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#F4B400] px-8 text-base font-extrabold text-black">Ustvari galerijo <Arrow /></Link>
        </div>
      </section>

      <footer className="bg-[#111111] text-white">
        <div className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 border-b border-white/12 pb-12 md:grid-cols-[1.35fr_.75fr_.75fr_.75fr]">
            <div>
              <CamLoveLogo size="md" showMark variant="onDark" />
              <p className="mt-5 max-w-[360px] text-sm leading-6 text-white/48">Fotografije in videi vseh gostov. Ena QR koda, ena zasebna galerija, brez aplikacije.</p>
              <a href="https://www.instagram.com/camlove.me" className="mt-6 inline-flex text-sm font-bold text-[#F4B400]">Instagram @camlove.me</a>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Produkt</p>
              <div className="mt-5 space-y-3 text-sm text-white/58"><a href="#how" className="block hover:text-white">Kako deluje</a><a href="#wall" className="block hover:text-white">Live Photo Wall</a><a href="#features" className="block hover:text-white">Funkcije</a><Link href="/dashboard/new" className="block hover:text-white">Ustvari galerijo</Link></div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Podpora</p>
              <div className="mt-5 space-y-3 text-sm text-white/58"><Link href="/blog" className="block hover:text-white">Blog</Link><Link href="/contact" className="block hover:text-white">Kontakt</Link><Link href="/dashboard" className="block hover:text-white">Prijava</Link><Link href="/affiliate/apply" className="block hover:text-white">Partnerji</Link></div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Pravno</p>
              <div className="mt-5 space-y-3 text-sm text-white/58"><Link href="/privacy" className="block hover:text-white">Zasebnost</Link><Link href="/terms" className="block hover:text-white">Pogoji uporabe</Link></div>
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-7 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CamLove · camlove.me</p>
            <p>Made for real events, not perfect feeds.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
