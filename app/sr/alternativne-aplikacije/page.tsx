import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";

export const metadata: Metadata = {
  title: "Najbolje aplikacije za venčane fotografije 2026",
  description:
    "Guestcam vs Google Photos vs WhatsApp vs Dropbox. Koja aplikacija najbolje sakuplja fotografije sa venčanja? Iskreno poređenje prednosti i mana.",
  openGraph: {
    url: "https://www.guestcam.si/sr/alternativne-aplikacije",
    title: "Najbolje aplikacije za venčane fotografije 2026",
    description:
      "Iskreno poređenje rešenja za sakupljanje fotografija sa venčanja. Kvalitet, privatnost, cena — sve na jednom mestu.",
    type: "article",
    images: [ogImage("Najbolje aplikacije za deljenje fotografija sa venčanja")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Najbolje aplikacije za venčane fotografije 2026",
    description: "Iskreno poređenje rešenja za sakupljanje fotografija sa venčanja.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.guestcam.si/sr/alternativne-aplikacije",
    languages: {
      "sl": "https://www.guestcam.si/sl/alternative-aplikacije",
      "hr": "https://www.guestcam.si/hr/alternativne-aplikacije",
      "sr": "https://www.guestcam.si/sr/alternativne-aplikacije",
      "de": "https://www.guestcam.si/de/alternativen",
      "en": "https://www.guestcam.si/en/alternatives",
      "es": "https://www.guestcam.si/es/alternativas",
      "x-default": "https://www.guestcam.si/sl/alternative-aplikacije",
    },
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Najbolje aplikacije za venčane fotografije 2026",
  description:
    "Poređenje: Guestcam vs Google Photos vs WhatsApp vs Dropbox. Koja aplikacija je najbolja za sakupljanje fotografija sa venčanja?",
  inLanguage: "sr-RS",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: "https://www.guestcam.si/icon-512.png",
  },
  mainEntityOfPage: "https://www.guestcam.si/sr/alternativne-aplikacije",
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">Privatnost</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Uslovi</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Kolačići</Link>
          <a href="mailto:info@guestcam.si" className="hover:text-white transition-colors">Kontakt</a>
        </div>
      </div>
    </footer>
  );
}

function Check() {
  return (
    <svg className="w-5 h-5 mx-auto text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function Cross() {
  return (
    <svg className="w-5 h-5 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function Partial({ label }: { label: string }) {
  return (
    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export default function AlternativneAplikacijePage() {
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <SiteHeader lang="sr" hreflang={ALTERNATIVES_HREFLANG} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest bg-[#FFF3CC] text-[#C9820A]">
            Poređenje · Srbija · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Najbolje aplikacije za deljenje fotografija sa venčanja
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Planirate venčanje i tražite jednostavan način da gosti dele
            fotografije. Verovatno ste već razmišljali o Google Photos, WhatsApp
            grupi ili slanju mejlom. A koje rešenje je za venčanje stvarno
            najbolje? U ovom iskrenom poređenju prolazimo kroz sve glavne opcije
            — i jasno pokazujemo gde svaka od njih zataji.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vreme čitanja: ~8 minuta
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 6.108c1.131.094 1.976 1.057 1.976 2.192V18A2.25 2.25 0 0116.226 20.25H7.5A2.25 2.25 0 015.25 18V8.3c0-1.135.844-2.098 1.976-2.192" />
              </svg>
              Ažurirano: januar 2025
            </span>
          </div>
        </div>

        {/* Criteria */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Šta tražiti u aplikaciji za fotografije sa venčanja
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Pre nego što uporedimo pojedina rešenja, dobro je definisati šta
            čini rešenje za venčanje stvarno dobrim. Zahtevi su prilično
            specifični:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Bez aplikacije za goste", desc: "Vaši gosti su različitog uzrasta i tehničke spretnosti. Najbolje rešenje radi svima, u svakom pretraživaču." },
              { title: "Pun originalni kvalitet", desc: "Fotografije moraju da budu pogodne za štampu. Bez kompresije, bez smanjivanja — samo originalne datoteke." },
              { title: "Brzo otpremanje", desc: "Gosti uživaju na venčanju i ne žele da gube vreme. Otpremanje treba da traje manje od 30 sekundi." },
              { title: "Privatnost po podrazumevanom", desc: "Fotografije sa venčanja su lične. Ne želite da ih Google indeksira ili da budu dostupne strancima." },
              { title: "Lako upravljanje", desc: "Pravljenje galerije, preuzimanje fotografija i upravljanje pristupom mora biti jednostavno i za netehničke korisnike." },
              { title: "Poštena cena", desc: "Venčanje već košta dosta. Rešenje za fotografije treba da bude pristupačno ili besplatno, bez skrivenih troškova." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FFF3CC]">
                  <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">{title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-12 -mx-6 px-6 py-12 bg-[#FFF9EC]">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
              Brzo poređenje
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: "#0F1729" }}>
                    <th className="p-4 text-white font-semibold">Funkcija</th>
                    <th className="p-4 text-center text-[#FFC94D] font-bold">Guestcam</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Google Photos</th>
                    <th className="p-4 text-center text-gray-300 font-medium">WhatsApp</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Dropbox</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bez aplikacije za goste", wa: true, gp: false, wp: false, db: false, gpNote: "Nalog potreban", wpNote: "Aplikacija potrebna", dbNote: "Aplikacija potrebna" },
                    { feature: "Pun originalni kvalitet", wa: true, gp: "partial", wp: false, db: true, wpNote: "70 % kompresija", gpNote: "Komprimovano podrazumevano" },
                    { feature: "QR kod za brz pristup", wa: true, gp: false, wp: false, db: false },
                    { feature: "Privatno (bez indeksiranja)", wa: true, gp: "partial", wp: true, db: true, gpNote: "Zavisi od podešavanja" },
                    { feature: "Radi bez prijave gostiju", wa: true, gp: false, wp: false, db: false },
                    { feature: "Višejezični interfejs", wa: true, gp: true, wp: true, db: true },
                    { feature: "Galerija uživo tokom slavlja", wa: true, gp: false, wp: false, db: false },
                    { feature: "Masovno preuzimanje (ZIP)", wa: true, gp: "partial", wp: false, db: true, gpNote: "Ograničeno", wpNote: "Jedna po jedna" },
                    { feature: "Namenjeno venčanjima", wa: true, gp: false, wp: false, db: false },
                    { feature: "Besplatan paket", wa: true, gp: true, wp: true, db: "partial", dbNote: "Samo 2 GB" },
                  ].map(({ feature, wa, gp, wp, db, wpNote, gpNote, dbNote }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium text-[#0F1729]">{feature}</td>
                      <td className="p-4 text-center">{wa === true ? <Check /> : wa === false ? <Cross /> : <Partial label={typeof wa === "string" ? wa : ""} />}</td>
                      <td className="p-4 text-center">{gp === true ? <Check /> : gp === false ? <Cross /> : <Partial label={gpNote ?? "Delimično"} />}</td>
                      <td className="p-4 text-center">{wp === true ? <Check /> : wp === false ? <Cross /> : <Partial label={wpNote ?? "Delimično"} />}</td>
                      <td className="p-4 text-center">{db === true ? <Check /> : db === false ? <Cross /> : <Partial label={dbNote ?? "Delimično"} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Podaci se zasnivaju na javno dostupnim funkcijama u januaru 2025. »Delimično« znači da funkcija postoji, ali sa značajnim ograničenjima za venčanja.
            </p>
          </div>
        </section>

        {/* Individual reviews */}
        <section className="mb-12 space-y-8">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-2">
            Detaljan pregled pojedinih opcija
          </h2>

          {/* Guestcam */}
          <div className="bg-white rounded-3xl border-2 p-7 shadow-sm border-[#FFC94D]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#FFF3CC] text-[#C9820A]">
                  Naš izbor
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Guestcam</h3>
                <p className="text-sm text-gray-500">Namenski alat za fotografije sa venčanja sa QR kodom</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">Plaćeni paketi od 39 €</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Guestcam je jedino rešenje na ovoj listi koje je osmišljeno
              isključivo za venčanja i slične događaje. Ceo tok — od pravljenja
              galerije do preuzimanja svih fotografija — izgrađen je oko
              stvarnih scenarija sa venčanja.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Šta odlično radi</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gosti skeniraju QR i otpremaju bez prijave",
                    "Fotografije u punoj originalnoj rezoluciji",
                    "Uključeni šabloni za štampu QR kartica",
                    "Galerija uživo tokom slavlja",
                    "Šestojezični interfejs (sl, hr, sr, en, de, es)",
                    "Usklađeno sa GDPR-om, podaci u EU",
                    "Preuzimanje svih fotografija u ZIP jednim klikom",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Ograničenja</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Besplatan paket ograničen na 20 fotografija i 30 dana pristupa",
                    "Noviji servis — manja prepoznatljivost brenda",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Presuda:{" "}
              <span className="font-normal text-gray-600">
                Najbolji izbor za parove koji žele jednostavno i elegantno
                rešenje koje radi svakom gostu — tehnički potkovanom ili ne.
              </span>
            </p>
          </div>

          {/* Google Photos */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Google Photos</h3>
                <p className="text-sm text-gray-500">Deljeni albumi za sakupljanje fotografija</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">Do 15 GB prostora</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Google Photos je poznata, etablirana platforma. Funkcija deljenih
              albuma omogućava više ljudima da dodaju fotografije u isti album.
              Mnogi parovi je razmatraju jer pretpostavljaju da je gosti već
              imaju.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Šta dobro radi</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Poznat brend — gosti ga možda već koriste",
                    "Dobre funkcije organizacije fotografija",
                    "Prepoznavanje lica i pretraga",
                    "Dovoljno besplatnog prostora",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Ograničenja</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gosti moraju da imaju Google nalog",
                    "Mnogi gosti ga nemaju (naročito stariji rođaci)",
                    "Nema QR koda — morate da delite link",
                    "Fotografije se komprimuju osim u podešavanju punog kvaliteta",
                    "Nema šablona za štampu QR kartica",
                    "Nije osmišljeno za venčanja",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Presuda:{" "}
              <span className="font-normal text-gray-600">
                Radi ako svi vaši gosti imaju Google nalog i tehnički su vešti.
                Za mešovite starosne grupe pravi nepotrebnu prepreku.
              </span>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">WhatsApp grupa</h3>
                <p className="text-sm text-gray-500">Deljenje fotografija u grupnom razgovoru</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">Sa WhatsApp nalogom</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Otvoriti WhatsApp grupu za fotografije sa venčanja deluje
              jednostavno. Skoro svi imaju WhatsApp. Samo dodajte goste u grupu
              i zamolite ih da podele slike. Zvuči savršeno — sve dok stvarno
              ne probate.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Šta dobro radi</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Skoro univerzalna prisutnost",
                    "Gosti već imaju aplikaciju",
                    "Obaveštenja u realnom vremenu",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Ograničenja</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Fotografije komprimovane do 70 % — bez visokog kvaliteta",
                    "Grupa od 100+ ljudi postaje haos",
                    "Preuzimanje slika jedna po jedna — bez masovnog preuzimanja",
                    "Brojevi telefona gostiju vidljivi su svima",
                    "Fotografije se gube u poplavi poruka",
                    "Bez organizacije, bez albuma, bez pretrage",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Presuda:{" "}
              <span className="font-normal text-gray-600">
                Već sama kompresija slika čini WhatsApp neprikladnim za trajne
                uspomene sa venčanja. Dobar za brzo deljenje tokom dana, loš
                izbor za dugoročno čuvanje.
              </span>
            </p>
          </div>

          {/* Dropbox */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Dropbox</h3>
                <p className="text-sm text-gray-500">Skladište u oblaku sa deljenim folderima</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">2 GB besplatno / 9,99 €/mes.+</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Dropbox je odlično skladište u oblaku. Možete napraviti deljeni
              folder i reći gostima da tamo otpreme fotografije. Datoteke se
              čuvaju u punom kvalitetu. Ali iskustvo za goste je tu problem.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Šta dobro radi</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Čuvanje datoteka u punom kvalitetu",
                    "Pouzdan, dobro poznat brend",
                    "Dobro za velike datoteke",
                    "Radi na svim uređajima",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-600 text-sm mb-2">Ograničenja</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gosti moraju da otvore Dropbox nalog",
                    "Komplikovano za netehničke korisnike",
                    "Nema QR koda — samo link",
                    "2 GB besplatno — brzo se popuni RAW fotografijama",
                    "Nije osmišljeno za događaje",
                    "Bez galerije uživo ili pregleda u realnom vremenu",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm font-semibold text-[#0F1729]">
              Presuda:{" "}
              <span className="font-normal text-gray-600">
                Odlično za čuvanje datoteka, ali mučno za goste. Prikladnije za
                razmenu datoteka među kolegama nego za sakupljanje fotografija
                na venčanju.
              </span>
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Zaključak
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Iskren sažetak: svaki alat za deljenje fotografija opšte namene
            osmišljen je za svakodnevnu upotrebu, ne za specifične zahteve
            venčanja. Svaki ima bar jednu veliku prepreku zbog koje nije
            prikladan:
          </p>
          <div className="grid gap-3 mb-6">
            {[
              { name: "WhatsApp", problem: "Uništava kvalitet fotografija kompresijom." },
              { name: "Google Photos", problem: "Zahteva Google nalog — prepreka za mnoge goste." },
              { name: "Dropbox", problem: "Suviše komplikovano za netehničke goste." },
              { name: "iCloud deljeni album", problem: "Samo za iPhone — Android gosti su isključeni." },
            ].map(({ name, problem }) => (
              <div key={name} className="flex gap-4 items-start bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm">{name}</p>
                  <p className="text-sm text-gray-500">{problem}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed">
            Guestcam je od prvog dana izgrađen da reši baš ove probleme. Bez
            instaliranja aplikacije. Bez prijave gostiju. Pun kvalitet. QR kod
            na stolu. Preuzimanje svega u ZIP jednim klikom. Ako želite da
            svaki gost može da učestvuje — od tehnički veštog sestrića do bake
            sa starijim telefonom — Guestcam je pravi alat.
          </p>
        </section>

        {/* Final dark CTA */}
        <div className="rounded-3xl p-8 text-center bg-[#0F1729]">
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Spremni da sakupite sve fotografije sa venčanja?
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Napravite svoju galeriju sa QR kodom za 2 minuta — besplatno, bez kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Započni besplatno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Spremno za 2 minuta · SSL zaštita · GDPR usklađeno · Podaci u EU
          </p>
        </div>
      </main>

      <SeoFooter lang="sr" />
    </div>
  );
}
