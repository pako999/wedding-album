import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "QR kod za venčanje i svadbu — sakupite slike gostiju 2026 | Guestcam",
  description:
    "QR kod za svadbu i venčanje: sakupite sve slike i fotografije gostiju jednim skeniranjem. Bez aplikacije, u punom kvalitetu. Postavite za 2 minuta.",
  openGraph: {
    title: "QR kod za venčanje i svadbu — sakupite slike gostiju 2026",
    description:
      "Sakupite sve slike i fotografije sa svadbe i venčanja jednim QR kodom. Bez aplikacije, u punom kvalitetu.",
    type: "article",
    images: [ogImage("QR kod za venčanje i svadbu")],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR kod za venčanje i svadbu — sakupite slike gostiju 2026",
    description: "Sakupite sve slike sa svadbe jednim QR kodom. Bez aplikacije.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://guestcam.si/sr/qr-kod-vencanje",
    languages: {
      "sl": "https://guestcam.si/sl/qr-koda-poroka",
      "hr": "https://guestcam.si/hr/qr-kod-vjencanje",
      "sr": "https://guestcam.si/sr/qr-kod-vencanje",
      "de": "https://guestcam.si/de/hochzeitsfotos-sammeln",
      "en": "https://guestcam.si/en/wedding-photo-sharing",
      "es": "https://guestcam.si/es/fotos-boda-qr",
      "x-default": "https://guestcam.si/sl/qr-koda-poroka",
    },
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "QR kod za venčanje — Potpuni vodič 2025",
  description:
    "Sve što treba da znate o QR kodu za venčanje: kako funkcioniše, zašto vam treba i kako ga za 2 minuta postavite sa Guestcam.",
  inLanguage: "sr-RS",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: "https://guestcam.si/icon-512.png",
  },
  mainEntityOfPage: "https://guestcam.si/sr/qr-kod-vencanje",
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

function CtaBox() {
  return (
    <div className="rounded-3xl p-8 my-12 text-center bg-[#FFF9EC] border border-[#FFE08A]">
      <p className="font-serif text-2xl font-bold text-[#0F1729] mb-3">
        Spremite QR kod za vaše venčanje
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Napravite personalizovanu galeriju za 2 minuta. Besplatno zauvek — bez kreditne kartice.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
      >
        Započni besplatno →
      </Link>
    </div>
  );
}

export default function QrKodVencanjePage() {
  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <SiteHeader lang="sr" hreflang={GUIDE_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest bg-[#FFF3CC] text-[#C9820A]">
            Vodič · Srbija · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            QR kod za venčanje i svadbu — sakupite sve slike gostiju
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            QR kod za svadbu ili venčanje je danas najpametniji način da sakupite
            slike i fotografije sa svadbe od svih gostiju. Umesto da slike ostanu
            zaključane na telefonima, gosti ih jednim skeniranjem šalju direktno
            u vašu privatnu galeriju — bez aplikacije, bez registracije, bez
            nervoze.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vreme čitanja: ~5 minuta
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M16.5 6.108c1.131.094 1.976 1.057 1.976 2.192V18A2.25 2.25 0 0116.226 20.25H7.5A2.25 2.25 0 015.25 18V8.3c0-1.135.844-2.098 1.976-2.192" />
              </svg>
              Ažurirano: januar 2025
            </span>
          </div>
        </div>

        {/* What is */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Šta je QR kod za svadbu i venčanje?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            QR kod za svadbu (ili venčanje — sve je isto) je posebna koda koju
            štampate na stolove, pozivnice ili stalke na svadbenom mestu. Kada
            je gost skenira pametnim telefonom, telefon ga automatski preusmerava
            u vašu ličnu galeriju, gde se otpremljena slika sa svadbe ili video
            snimak odmah pojavljuje u vašoj zbirci.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Za razliku od grupa na WhatsAppu, Vajberu ili Mesendžeru — ili platformi
            poput Google Photos — QR kod za venčanje besprekorno radi svim gostima.
            Od bake sa osnovnim telefonom do tehno-entuzijaste sa najnovijim modelom:
            ne treba im nikakva aplikacija, registracija ni lozinka. Skenirao —
            otpremio. Toliko.
          </p>
        </section>

        <CtaBox />

        {/* Why it works */}
        <section className="mb-10 -mx-6 px-6 py-12 bg-[#FFF9EC]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
              Zašto QR kod na venčanju zaista funkcioniše
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Statistika je jasna: na prosečnom venčanju sa 100 zvanica, svaki gost
              snimi najmanje 15–30 fotografija. To je 1.500 do 3.000 slika koje nikada
              ne stignu do mladenaca. Razlozi su uvek isti:
            </p>
            <div className="grid gap-4 mb-6">
              {[
                {
                  title: "Zaborave da pošalju",
                  desc: "Posle venčanja prođu dani, nedelje, meseci. Fotografije ostanu u telefonu i niko se više ne seti da ih prosledi.",
                },
                {
                  title: "Kompresija u aplikacijama",
                  desc: "WhatsApp i drugi mesendžeri smanje sliku i do 70%. Dobićete samo kompresovane fajlove koje ne možete kvalitetno odštampati.",
                },
                {
                  title: "Haos sa imejlovima",
                  desc: "Skupljati imejl adrese od 100 ljudi i čekati da vam svako pošalje fotografije je logistička noćna mora.",
                },
                {
                  title: "Tehničke prepreke",
                  desc: "Google Photos i Dropbox traže nalog, dovoljno prostora i instalaciju aplikacije. Stariji gosti to često ne mogu.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FFF3CC]">
                    <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F1729]">{title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 leading-relaxed">
              QR kod za venčanje rešava sve ove probleme odjednom. Gost snimi
              fotografiju, skenira kod, otpremi — u punom kvalitetu, bez prepreka,
              bez ikakve aplikacije.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Prednosti QR koda za venčanje
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📸", title: "Pun kvalitet", desc: "Svaka fotografija je sačuvana u originalnoj rezoluciji — idealna za štampu i foto-knjige." },
              { icon: "📱", title: "Bez aplikacije", desc: "Gosti otvaraju galeriju u pretraživaču. Nema instalacije, nema registracije." },
              { icon: "⚡", title: "U realnom vremenu", desc: "Tokom venčanja već vidite fotografije koje gosti otpremaju. Savršeno za projekciju uživo." },
              { icon: "🌍", title: "Višejezično", desc: "Galerija se prilagođava jeziku gosta — srpski, hrvatski, engleski, nemački…" },
              { icon: "🔒", title: "Privatno", desc: "Album nije javan. Dostupan je samo preko vašeg QR koda ili direktnog linka." },
              { icon: "💾", title: "Preuzimanje u jednom kliku", desc: "Posle venčanja preuzmete sve fotografije kao ZIP arhivu — u punom kvalitetu, za par sekundi." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Step by step */}
        <section className="mb-10 -mx-6 px-6 py-12 bg-[#FFF9EC]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
              Kako podesiti QR kod za venčanje sa Guestcam — korak po korak
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Sa Guestcam-om je proces brz i intuitivan. Pratite ove korake:
            </p>
            <div className="space-y-4">
              {[
                { step: "01", title: "Napravite besplatan nalog", desc: "Posetite Guestcam i kliknite na »Napravi galeriju besplatno«. Unesite imejl i lozinku — postupak traje manje od minuta." },
                { step: "02", title: "Podesite galeriju", desc: "Unesite ime para (npr. »Ana i Marko«), datum venčanja i mesto. Možete da izaberete pozadinsku fotografiju, boju teme i jezik galerije." },
                { step: "03", title: "Izaberite šablon za štampu", desc: "Guestcam nudi 8 elegantnih šablona za QR kartice — od klasičnih do botaničkih i skandinavskih. Svaki šablon se automatski popunjava vašim imenom i datumom." },
                { step: "04", title: "Preuzmite i odštampajte", desc: "Šablon preuzimate kao PDF visoke rezolucije. Pošaljite ga lokalnoj štampariji ili odštampajte sami. Preporučujemo karton 300 g/m² za najbolji izgled." },
                { step: "05", title: "Postavite kartice na venčanju", desc: "Kartice rasporedite po stolovima, postavite na stalke pored šanka, dodajte ih uz pozivnice ili okačite na panoe. Preporučujemo bar jednu karticu po stolu." },
                { step: "06", title: "Gosti skeniraju i otpremaju", desc: "Gosti telefonom skeniraju QR kod i odmah vide obrazac za otpremanje fotografija. Nema aplikacije, nema registracije — samo skeniranje i otpremanje." },
                { step: "07", title: "Preuzmite sve jednim klikom", desc: "Posle venčanja se prijavite u kontrolnu tablu i kliknete »Preuzmi sve«. Sve fotografije i video snimci stižu kao ZIP arhiva — u punom kvalitetu." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 bg-[#FFC94D] text-[#0F1729]">
                    {step}
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm">
                    <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Saveti za najbolje rezultate
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Odštampajte bar jednu karticu po stolu — ne samo jednu na ulazu.",
              "Voditelj ceremonije ili kum neka gostima ukratko objasni QR kod na početku slavlja.",
              "Veće kartice (A5 ili A4) su vidljivije i gosti ih brže primete.",
              "Na karticu dodajte kratko uputstvo na srpskom i po potrebi na engleskom za strane goste.",
              "Testirajte QR kod pre venčanja — sami ga skenirajte i otpremite probnu fotografiju.",
              "Za projekciju tokom slavlja uključite opciju »Prikaži fotografije uživo« u podešavanjima galerije.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-[#FFF3CC]">
                  <svg className="w-3 h-3 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Često postavljana pitanja
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Da li je QR kod za venčanje zaista besplatan?",
                a: "Sa Guestcam-om je pravljenje galerije i QR koda besplatno zauvek (do određenih ograničenja). Za veća venčanja postoje plaćeni paketi sa više fotografija i naprednim funkcijama.",
              },
              {
                q: "Da li gosti moraju da preuzmu aplikaciju?",
                a: "Apsolutno ne. Gosti otvaraju galeriju direktno u pretraživaču telefona — ne treba im nikakva aplikacija ni registracija.",
              },
              {
                q: "U kom kvalitetu se čuvaju fotografije?",
                a: "U punoj originalnoj rezoluciji. Guestcam ne kompresuje i ne smanjuje fotografije. Dobićete tačno ono što je gost snimio — spremno za štampu.",
              },
              {
                q: "Šta se dešava sa fotografijama posle venčanja?",
                a: "Galerija ostaje aktivna onoliko koliko traje vaš paket. U bilo kom trenutku možete da preuzmete sve fotografije kao ZIP arhivu ili da ih sačuvate direktno na Google Drive.",
              },
              {
                q: "Da li je album privatan?",
                a: "Da. Album je dostupan samo preko vašeg QR koda ili direktnog linka. Google ga ne indeksira, a po želji ga možete zaštititi i lozinkom.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#0F1729] list-none text-sm">
                  {q}
                  <svg className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final dark CTA */}
        <div className="rounded-3xl p-8 text-center bg-[#0F1729]">
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Vaše venčanje zaslužuje sve uspomene
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Napravite galeriju sa QR kodom za 2 minuta — besplatno, bez kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FFC94D] text-[#0F1729] font-bold text-base transition-all duration-200 hover:scale-[1.02] hover:brightness-95"
          >
            Započni besplatno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Galerija spremna za 2 minuta · SSL zaštita · GDPR usklađeno
          </p>
        </div>
      </main>

      <SeoFooter lang="sr" />
    </div>
  );
}
