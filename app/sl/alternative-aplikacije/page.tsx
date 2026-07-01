import Link from "next/link";
import type { Metadata } from "next";
import { ALTERNATIVES_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "Najboljše aplikacije za poročne fotografije 2026",
  description:
    "Guestcam vs Google Photos vs WhatsApp vs Dropbox. Katera aplikacija najbolje zbere poročne fotografije? Iskrena primerjava prednosti in pasti.",
  openGraph: {
    title: "Najboljše aplikacije za poročne fotografije 2026",
    description:
      "Iskrena primerjava rešitev za zbiranje poročnih fotografij. Kakovost, zasebnost, cena — vse na enem mestu.",
    type: "article",
    images: [ogImage("Najboljše aplikacije za deljenje poročnih fotografij")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Najboljše aplikacije za poročne fotografije 2026",
    description: "Iskrena primerjava rešitev za zbiranje poročnih fotografij.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://www.guestcam.si/sl/alternative-aplikacije",
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
  headline: "Najboljše aplikacije za poročne fotografije 2026",
  description:
    "Primerjava: Guestcam vs Google Photos vs WhatsApp vs Dropbox. Katera aplikacija je najboljša za zbiranje fotografij s poroke?",
  inLanguage: "sl-SI",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: "https://www.guestcam.si/icon-512.png",
  },
  mainEntityOfPage: "https://www.guestcam.si/sl/alternative-aplikacije",
};


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">Zasebnost</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Pogoji</Link>
          <Link href="/cookies" className="hover:text-white transition-colors">Piškotki</Link>
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

export default function AlternativeAplikacijePage() {
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SiteHeader lang="sl" hreflang={ALTERNATIVES_HREFLANG} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest bg-[#FFF3CC] text-[#C9820A]">
            Primerjava · Slovenija · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            Najboljše aplikacije za deljenje poročnih fotografij
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Načrtujete poroko in iščete preprost način, kako naj gostje delijo
            fotografije. Verjetno ste že razmišljali o Google Photos, WhatsAppu
            ali pošiljanju prek e-pošte. Toda katera rešitev je za poroko
            dejansko najboljša? V tem iskrenem pregledu primerjamo vse glavne
            možnosti — in pokažemo, kje vsaka od njih popušča.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Čas branja: ~8 minut
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 6.108c1.131.094 1.976 1.057 1.976 2.192V18A2.25 2.25 0 0116.226 20.25H7.5A2.25 2.25 0 015.25 18V8.3c0-1.135.844-2.098 1.976-2.192" />
              </svg>
              Posodobljeno: januar 2025
            </span>
          </div>
        </div>

        {/* Criteria */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Kaj iskati v aplikaciji za poročne fotografije
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Preden primerjamo posamezna orodja, je vredno opredeliti, kaj
            naredi rešitev za poročne fotografije resnično dobro. Zahteve
            so precej specifične:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Brez aplikacije za goste", desc: "Vaši gostje so različnih starosti in tehnične spretnosti. Najboljša rešitev deluje vsem, v vsakem brskalniku." },
              { title: "Polna originalna kakovost", desc: "Slike morajo biti primerne za tisk. Brez kompresije, brez zmanjšanja — samo originalne datoteke." },
              { title: "Hiter postopek nalaganja", desc: "Gostje uživajo na poroki, ne želijo izgubljati časa. Nalaganje naj traja manj kot 30 sekund." },
              { title: "Zasebnost po privzetku", desc: "Poročne fotografije so osebne. Ne želite, da jih Google indeksira ali da so dostopne neznancem." },
              { title: "Enostavno upravljanje", desc: "Ustvarjanje galerije, prenos fotografij in upravljanje dostopa mora biti preprosto tudi za netehnične uporabnike." },
              { title: "Poštena cena", desc: "Poroka že stane veliko. Rešitev za fotografije naj bo cenovno dostopna ali brezplačna, brez skritih stroškov." },
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
              Hitra primerjalna tabela
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: "#0F1729" }}>
                    <th className="p-4 text-white font-semibold">Lastnost</th>
                    <th className="p-4 text-center text-[#FFC94D] font-bold">Guestcam</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Google Photos</th>
                    <th className="p-4 text-center text-gray-300 font-medium">WhatsApp</th>
                    <th className="p-4 text-center text-gray-300 font-medium">Dropbox</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Brez aplikacije za goste", wa: true, gp: false, wp: false, db: false, gpNote: "Račun potreben", wpNote: "Aplikacija potrebna", dbNote: "Aplikacija potrebna" },
                    { feature: "Polna originalna kakovost", wa: true, gp: "partial", wp: false, db: true, wpNote: "70 % kompresija", gpNote: "Stisnjeno po privzetku" },
                    { feature: "QR koda za hiter dostop", wa: true, gp: false, wp: false, db: false },
                    { feature: "Zasebno (brez indeksiranja)", wa: true, gp: "partial", wp: true, db: true, gpNote: "Odvisno od nastavitev" },
                    { feature: "Deluje brez prijave gostov", wa: true, gp: false, wp: false, db: false },
                    { feature: "Večjezični vmesnik", wa: true, gp: true, wp: true, db: true },
                    { feature: "Galerija v živo med poroko", wa: true, gp: false, wp: false, db: false },
                    { feature: "Množični prenos (ZIP)", wa: true, gp: "partial", wp: false, db: true, gpNote: "Omejeno", wpNote: "Eno po eno" },
                    { feature: "Namenjeno porokam", wa: true, gp: false, wp: false, db: false },
                    { feature: "Brezplačen paket", wa: true, gp: true, wp: true, db: "partial", dbNote: "Le 2 GB" },
                  ].map(({ feature, wa, gp, wp, db, wpNote, gpNote, dbNote }, i) => (
                    <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-4 font-medium text-[#0F1729]">{feature}</td>
                      <td className="p-4 text-center">{wa === true ? <Check /> : wa === false ? <Cross /> : <Partial label={typeof wa === "string" ? wa : ""} />}</td>
                      <td className="p-4 text-center">{gp === true ? <Check /> : gp === false ? <Cross /> : <Partial label={gpNote ?? "Delno"} />}</td>
                      <td className="p-4 text-center">{wp === true ? <Check /> : wp === false ? <Cross /> : <Partial label={wpNote ?? "Delno"} />}</td>
                      <td className="p-4 text-center">{db === true ? <Check /> : db === false ? <Cross /> : <Partial label={dbNote ?? "Delno"} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Podatki temeljijo na javnih funkcijah januarja 2025. »Delno« pomeni, da funkcija obstaja, a z bistvenimi omejitvami za porocne primere uporabe.
            </p>
          </div>
        </section>

        {/* Individual reviews */}
        <section className="mb-12 space-y-8">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-2">
            Podroben pregled posameznih možnosti
          </h2>

          {/* Guestcam */}
          <div className="bg-white rounded-3xl border-2 p-7 shadow-sm border-[#FFC94D]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 bg-[#FFF3CC] text-[#C9820A]">
                  Naš izbor
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Guestcam</h3>
                <p className="text-sm text-gray-500">Namensko orodje za poročne fotografije z QR kodo</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Brezplačno</p>
                <p className="text-xs text-gray-400">Plačljivi paketi od 39 €</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Guestcam je edina rešitev na tem seznamu, ki je bila zasnovana
              posebej za poroke in podobne dogodke. Celoten potek — od
              ustvarjanja galerije do prenosa vseh fotografij — je zgrajen
              okoli realnih poročnih scenarijev.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Kaj deluje odlično</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gostje skenirajo QR in nalagajo brez prijave",
                    "Fotografije v polni originalni ločljivosti",
                    "Vključene predloge za tisk QR kartic",
                    "Galerija v živo med pogostitvijo",
                    "Šestjezični vmesnik (sl, hr, sr, en, de, es)",
                    "GDPR skladno, podatki v EU",
                    "Prenos vseh fotografij v ZIP z enim klikom",
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
                <p className="font-semibold text-red-600 text-sm mb-2">Omejitve</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Brezplačni paket omejen na 50 gostov / 200 fotografij",
                    "Novejša storitev — manj prepoznavnosti znamke",
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
              Sodba:{" "}
              <span className="font-normal text-gray-600">
                Najboljša izbira za pare, ki želijo enostavno in elegantno
                rešitev, ki deluje za vsakega gosta — tehnično podkovanega ali ne.
              </span>
            </p>
          </div>

          {/* Google Photos */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Google Photos</h3>
                <p className="text-sm text-gray-500">Skupni albumi za zbiranje fotografij</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Brezplačno</p>
                <p className="text-xs text-gray-400">Do 15 GB prostora</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Google Photos je znana, uveljavljena platforma. Funkcija skupnih
              albumov omogoča več osebam, da prispevajo fotografije v isti
              album. Mnogi pari ga izberejo, ker domnevajo, da ga imajo gostje že
              naložen.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Kaj deluje</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Znana znamka — gostje jo morda že uporabljajo",
                    "Dobre funkcije organizacije fotografij",
                    "Prepoznavanje obrazov in iskanje",
                    "Dober brezplačen prostor",
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
                <p className="font-semibold text-red-600 text-sm mb-2">Omejitve</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gostje morajo imeti Google račun",
                    "Vsi gostje ga nimajo (zlasti starejši sorodniki)",
                    "Ni QR kode — povezavo je treba deliti",
                    "Fotografije stisnjene, razen z izrecno nastavitvijo polne kakovosti",
                    "Ni predlog za tisk QR kartic",
                    "Ni zasnovano za poroke",
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
              Sodba:{" "}
              <span className="font-normal text-gray-600">
                Deluje, če imajo vsi vaši gostje Google račun in so tehnično
                podkovani. Za mešane starostne skupine ustvarja oviro.
              </span>
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">WhatsApp skupina</h3>
                <p className="text-sm text-gray-500">Deljenje fotografij v skupinskem klepetu</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Brezplačno</p>
                <p className="text-xs text-gray-400">Z WhatsApp računom</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Ustvariti WhatsApp skupino za poročne fotografije se zdi
              preprosto. Skoraj vsi imajo WhatsApp. Dodajte goste v skupino
              in jih prosite, da delijo. Sliši se popolno — dokler tega
              dejansko ne preizkusite.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Kaj deluje</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Skoraj univerzalna razširjenost",
                    "Gostje imajo aplikacijo že nameščeno",
                    "Obvestila v realnem času",
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
                <p className="font-semibold text-red-600 text-sm mb-2">Omejitve</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Fotografije stisnjene do 70 % — brez visoke kakovosti",
                    "Skupina s 100+ člani postane kaos",
                    "Prenos slik posamično — brez množičnega prenosa",
                    "Telefonske številke gostov so vidne vsem",
                    "Fotografije se izgubijo v pogovornem hrupu",
                    "Brez organizacije, brez albumov, brez iskanja",
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
              Sodba:{" "}
              <span className="font-normal text-gray-600">
                Že sama kompresija slik naredi WhatsApp neprimeren za poročne
                spomine. V redu za hitro deljenje med dnem, slabo za trajno
                ohranjanje spominov.
              </span>
            </p>
          </div>

          {/* Dropbox */}
          <div className="bg-white rounded-3xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0F1729]">Dropbox</h3>
                <p className="text-sm text-gray-500">Oblačni prostor s skupnimi mapami</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-2xl text-[#0F1729]">Brezplačno</p>
                <p className="text-xs text-gray-400">2 GB brezplačno / 9,99 €/mes.+</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-5">
              Dropbox je odlična oblačna shramba. Ustvarite skupno mapo in
              gostom rečete, naj fotografije naložijo vanjo. Datoteke se hranijo
              v polni kakovosti. A izkušnja za goste se izkaže za težavno.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <p className="font-semibold text-green-700 text-sm mb-2">Kaj deluje</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Hranjenje datotek v polni kakovosti",
                    "Zanesljiva, dobro znana znamka",
                    "Dobro za velike datoteke",
                    "Deluje na vseh napravah",
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
                <p className="font-semibold text-red-600 text-sm mb-2">Omejitve</p>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {[
                    "Gostje morajo ustvariti Dropbox račun",
                    "Zapleteno za netehnične uporabnike",
                    "Ni QR kode — samo povezava",
                    "2 GB brezplačno — hitro se zapolni z RAW fotografijami",
                    "Ni zasnovano za dogodke",
                    "Brez galerije v živo ali sprotnega ogleda",
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
              Sodba:{" "}
              <span className="font-normal text-gray-600">
                Odlično za shranjevanje datotek, a mučno za goste. Bolj primerno
                za izmenjavo datotek med kolegi kot za zbiranje fotografij na
                poroki.
              </span>
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Zaključek
          </h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Iskren povzetek: vsako splošno orodje za deljenje fotografij je
            bilo zasnovano za vsakdanjo rabo, ne za specifične zahteve
            poroke. Vsako ima vsaj eno veliko oviro, zaradi katere ni primerno:
          </p>
          <div className="grid gap-3 mb-6">
            {[
              { name: "WhatsApp", problem: "Uničuje kakovost fotografij s kompresijo." },
              { name: "Google Photos", problem: "Zahteva Google račun — ovira za mnoge goste." },
              { name: "Dropbox", problem: "Pretežko za netehnične goste." },
              { name: "iCloud skupni album", problem: "Samo za iPhone — Android gostje izključeni." },
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
            Guestcam je bil od prvega dne zasnovan, da reši natanko te težave.
            Brez nameščanja aplikacije. Brez prijave gostov. Polna kakovost. QR
            koda na mizi. Prenos vsega v ZIP z enim klikom po poroki. Če želite,
            da vsak gost lahko prispeva — od tehnično podkovanega nečaka do
            babice s starejšim telefonom — je Guestcam pravo orodje.
          </p>
        </section>

        {/* Final dark CTA */}
        <div className="rounded-3xl p-8 text-center bg-[#0F1729]">
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Pripravljeni zbrati vse poročne fotografije?
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Ustvarite svojo galerijo z QR kodo v 2 minutah — brezplačno, brez kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Začni brezplačno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Pripravljeno v 2 minutah · SSL zaščita · GDPR skladno · Podatki v EU
          </p>
        </div>
      </main>

      <SeoFooter lang="sl" />
    </div>
  );
}
