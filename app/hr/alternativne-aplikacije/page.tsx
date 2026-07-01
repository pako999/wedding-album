import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Najbolje aplikacije za dijeljenje vjenčanih fotografija 2025 | Guestcam",
  description:
    "Usporedba: Guestcam vs Google Photos vs WhatsApp vs Dropbox. Koja je aplikacija najbolja za skupljanje fotografija s vjenčanja? Iskren pregled prednosti i zamki.",
  openGraph: {
    title: "Najbolje aplikacije za dijeljenje vjenčanih fotografija 2025",
    description:
      "Iskrena usporedba rješenja za skupljanje vjenčanih fotografija. Kvaliteta, privatnost, cijena — sve na jednom mjestu.",
    type: "article",
    images: [ogImage("Najbolje aplikacije za dijeljenje vjenčanih fotografija")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Najbolje aplikacije za dijeljenje vjenčanih fotografija 2025",
    description: "Iskrena usporedba rješenja za skupljanje vjenčanih fotografija.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.guestcam.si/hr/alternativne-aplikacije",
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
  headline: "Najbolje aplikacije za dijeljenje vjenčanih fotografija 2025",
  description:
    "Usporedba: Guestcam vs Google Photos vs WhatsApp vs Dropbox. Koja je aplikacija najbolja za skupljanje fotografija s vjenčanja?",
  inLanguage: "hr-HR",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: "https://www.guestcam.si/icon-512.png",
  },
  mainEntityOfPage: "https://www.guestcam.si/hr/alternativne-aplikacije",
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">Privatnost</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Uvjeti</Link>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SiteHeader lang="hr" hreflang={ALTERNATIVES_HREFLANG} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest bg-[#FFF3CC] text-[#C9820A]">
            Usporedba · Hrvatska · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Najbolje aplikacije za dijeljenje vjenčanih fotografija
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Planirate vjenčanje i tražite jednostavan način da gosti podijele
            fotografije. Vjerojatno ste već razmišljali o Google Photos, WhatsAppu
            ili slanju mailom. No koje rješenje je za vjenčanje stvarno najbolje?
            U ovoj iskrenoj usporedbi prolazimo kroz sve glavne opcije — i jasno
            pokazujemo gdje svaka od njih zakaže.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vrijeme čitanja: ~8 minuta
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 6.108c1.131.094 1.976 1.057 1.976 2.192V18A2.25 2.25 0 0116.226 20.25H7.5A2.25 2.25 0 015.25 18V8.3c0-1.135.844-2.098 1.976-2.192" />
              </svg>
              Ažurirano: siječanj 2025
            </span>
          </div>
        </div>

        {/* Criteria */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Što tražiti u aplikaciji za vjenčane fotografije
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Prije nego što usporedimo pojedina rješenja, vrijedi definirati što
            čini rješenje za vjenčane fotografije stvarno dobrim. Zahtjevi su
            prilično specifični:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Bez aplikacije za goste", desc: "Vaši gosti su različitih dobi i tehničke vještine. Najbolje rješenje radi svima, u svakom pregledniku." },
              { title: "Puna originalna kvaliteta", desc: "Fotografije moraju biti prikladne za tisak. Bez kompresije, bez smanjivanja — samo originalne datoteke." },
              { title: "Brz postupak učitavanja", desc: "Gosti uživaju na vjenčanju, ne žele gubiti vrijeme. Učitavanje treba potrajati manje od 30 sekundi." },
              { title: "Privatnost po zadanim postavkama", desc: "Vjenčane fotografije su osobne. Ne želite da ih Google indeksira ili da su dostupne strancima." },
              { title: "Jednostavno upravljanje", desc: "Stvaranje galerije, preuzimanje fotografija i upravljanje pristupom mora biti jednostavno i za netehničke korisnike." },
              { title: "Poštena cijena", desc: "Vjenčanje već stoji puno. Rješenje za fotografije treba biti pristupačno ili besplatno, bez skrivenih troškova." },
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
              Brza usporedba
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: "#0F1729" }}>
                    <th className="p-4 text-white font-semibold">Značajka</th>
                    <th className="p-4 text-center text-[#FFC94D] font-bold">Guestcam</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Google Photos</th>
                    <th className="p-4 text-center text-gray-300 font-medium">WhatsApp</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Dropbox</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Bez aplikacije za goste", wa: true, gp: false, wp: false, db: false, gpNote: "Račun potreban", wpNote: "Aplikacija potrebna", dbNote: "Aplikacija potrebna" },
                    { feature: "Puna originalna kvaliteta", wa: true, gp: "partial", wp: false, db: true, wpNote: "70 % kompresija", gpNote: "Stisnuto po zadanom" },
                    { feature: "QR kod za brzi pristup", wa: true, gp: false, wp: false, db: false },
                    { feature: "Privatno (bez indeksiranja)", wa: true, gp: "partial", wp: true, db: true, gpNote: "Ovisno o postavkama" },
                    { feature: "Radi bez prijave gostiju", wa: true, gp: false, wp: false, db: false },
                    { feature: "Višejezično sučelje", wa: true, gp: true, wp: true, db: true },
                    { feature: "Galerija uživo tijekom vjenčanja", wa: true, gp: false, wp: false, db: false },
                    { feature: "Masovno preuzimanje (ZIP)", wa: true, gp: "partial", wp: false, db: true, gpNote: "Ograničeno", wpNote: "Jedna po jedna" },
                    { feature: "Namijenjeno vjenčanjima", wa: true, gp: false, wp: false, db: false },
                    { feature: "Besplatan plan", wa: true, gp: true, wp: true, db: "partial", dbNote: "Samo 2 GB" },
                  ].map(({ feature, wa, gp, wp, db, wpNote, gpNote, dbNote }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium text-[#0F1729]">{feature}</td>
                      <td className="p-4 text-center">{wa === true ? <Check /> : wa === false ? <Cross /> : <Partial label={typeof wa === "string" ? wa : ""} />}</td>
                      <td className="p-4 text-center">{gp === true ? <Check /> : gp === false ? <Cross /> : <Partial label={gpNote ?? "Djelomično"} />}</td>
                      <td className="p-4 text-center">{wp === true ? <Check /> : wp === false ? <Cross /> : <Partial label={wpNote ?? "Djelomično"} />}</td>
                      <td className="p-4 text-center">{db === true ? <Check /> : db === false ? <Cross /> : <Partial label={dbNote ?? "Djelomično"} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Podaci se temelje na javno dostupnim značajkama u siječnju 2025. »Djelomično« znači da značajka postoji, ali sa značajnim ograničenjima za vjenčanja.
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
                <p className="text-sm text-gray-500">Namjenski alat za vjenčane fotografije s QR kodom</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">Plaćeni planovi od 39 €</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Guestcam je jedino rješenje na ovom popisu koje je zamišljeno
              isključivo za vjenčanja i slične događaje. Cijeli tijek — od
              stvaranja galerije do preuzimanja svih fotografija — izgrađen je
              oko stvarnih vjenčanih scenarija.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Što odlično radi</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gosti skeniraju QR i učitavaju bez prijave",
                    "Fotografije u punoj originalnoj razlučivosti",
                    "Uključeni predlošci za tisak QR kartica",
                    "Galerija uživo tijekom svečanog dijela",
                    "Šestjezično sučelje (sl, hr, sr, en, de, es)",
                    "Usklađeno s GDPR-om, podaci u EU",
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
                    "Besplatan plan ograničen na 50 gostiju / 200 fotografija",
                    "Mlađi servis — manje prepoznatljivosti marke",
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
                rješenje koje radi za svakog gosta — tehnički potkovanog ili ne.
              </span>
            </p>
          </div>

          {/* Google Photos */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Google Photos</h3>
                <p className="text-sm text-gray-500">Dijeljeni albumi za skupljanje fotografija</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">Do 15 GB pohrane</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Google Photos je poznata, etablirana platforma. Značajka dijeljenih
              albuma omogućuje više osoba da dodaju fotografije u isti album.
              Mnogi parovi ga razmatraju jer pretpostavljaju da ga gosti već imaju.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Što dobro radi</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Poznata marka — gosti je možda već koriste",
                    "Dobre značajke organizacije fotografija",
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
                    "Gosti moraju imati Google račun",
                    "Mnogi gosti ga nemaju (osobito stariji rođaci)",
                    "Nema QR koda — morate dijeliti poveznicu",
                    "Fotografije se kompresiraju osim u postavci pune kvalitete",
                    "Nema predložaka za tisak QR kartica",
                    "Nije namijenjeno vjenčanjima",
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
                Radi ako svi vaši gosti imaju Google račun i tehnički su vješti.
                Za miješane dobne skupine stvara nepotrebnu prepreku.
              </span>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">WhatsApp grupa</h3>
                <p className="text-sm text-gray-500">Dijeljenje fotografija u grupnom razgovoru</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">S WhatsApp računom</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Otvoriti WhatsApp grupu za vjenčane fotografije čini se jednostavno.
              Gotovo svi imaju WhatsApp. Samo dodajte goste u grupu i zamolite ih
              da podijele slike. Zvuči savršeno — sve dok stvarno ne pokušate.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Što radi dobro</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gotovo univerzalna prisutnost",
                    "Gosti već imaju aplikaciju",
                    "Obavijesti u stvarnom vremenu",
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
                    "Fotografije stisnute do 70 % — bez visoke kvalitete",
                    "Grupa od 100+ ljudi postaje kaos",
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
                Sama kompresija slika čini WhatsApp neprikladnim za trajne
                vjenčane uspomene. U redu za brzo dijeljenje tijekom dana, loš
                izbor za trajno čuvanje.
              </span>
            </p>
          </div>

          {/* Dropbox */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Dropbox</h3>
                <p className="text-sm text-gray-500">Pohrana u oblaku s dijeljenim mapama</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Besplatno</p>
                <p className="text-xs text-gray-400">2 GB besplatno / 9,99 €/mj.+</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Dropbox je odlična pohrana u oblaku. Možete napraviti dijeljenu
              mapu i gostima reći neka tamo učitaju fotografije. Datoteke se
              čuvaju u punoj kvaliteti. No iskustvo za goste tu zapinje.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Što radi dobro</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Pohrana datoteka u punoj kvaliteti",
                    "Pouzdana, dobro poznata marka",
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
                    "Gosti moraju otvoriti Dropbox račun",
                    "Komplicirano za netehničke korisnike",
                    "Nema QR koda — samo poveznica",
                    "2 GB besplatno — brzo se napuni RAW fotografijama",
                    "Nije zamišljeno za događaje",
                    "Bez galerije uživo ili pregleda u stvarnom vremenu",
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
                Odlično za pohranu datoteka, ali mučno za goste. Prikladnije za
                razmjenu datoteka među kolegama nego za skupljanje fotografija
                na vjenčanju.
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
            Iskren sažetak: svaki alat za dijeljenje fotografija opće namjene
            zamišljen je za svakodnevnu upotrebu, a ne za specifične potrebe
            vjenčanja. Svaki ima barem jednu veliku prepreku zbog koje nije
            prikladan:
          </p>
          <div className="grid gap-3 mb-6">
            {[
              { name: "WhatsApp", problem: "Uništava kvalitetu fotografija kompresijom." },
              { name: "Google Photos", problem: "Zahtijeva Google račun — prepreka za mnoge goste." },
              { name: "Dropbox", problem: "Prekomplicirano za netehničke goste." },
              { name: "iCloud zajednički album", problem: "Samo za iPhone — Android gosti su isključeni." },
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
            Guestcam je od prvog dana izgrađen da riješi upravo ove probleme.
            Bez instaliranja aplikacije. Bez prijave gostiju. Puna kvaliteta.
            QR kod na stolu. Preuzimanje svega u ZIP jednim klikom. Ako želite
            da svaki gost može sudjelovati — od tehnički vještog nećaka do bake
            sa starijim telefonom — Guestcam je pravi alat.
          </p>
        </section>

        {/* Final dark CTA */}
        <div className="rounded-3xl p-8 text-center bg-[#0F1729]">
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Spremni skupiti sve vjenčane fotografije?
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Napravite svoju galeriju s QR kodom za 2 minute — besplatno, bez kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Započni besplatno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Spremno za 2 minute · SSL zaštita · GDPR usklađeno · Podaci u EU
          </p>
        </div>
      </main>

      <SeoFooter lang="hr" />
    </div>
  );
}
