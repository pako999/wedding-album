import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

export const metadata: Metadata = {
  title: "QR kod za vjenčanje — skupite fotografije gostiju 2026 | Guestcam",
  description:
    "Aplikacija za fotografije s vjenčanja preko QR koda: gosti skeniraju, vi dobivate sve slike u punoj kvaliteti. Bez instalacije. Postavite za 2 minute.",
  openGraph: {
    title: "QR kod za vjenčanje — skupite fotografije gostiju 2026",
    description:
      "Skupite sve fotografije s vjenčanja od gostiju jednim QR kodom. Bez aplikacije, u punoj kvaliteti.",
    type: "article",
    images: [ogImage("QR kod za vjenčanje — skupite fotografije gostiju")],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR kod za vjenčanje — skupite fotografije gostiju 2026",
    description: "Skupite sve fotografije s vjenčanja jednim QR kodom. Bez aplikacije.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: "https://guestcam.si/hr/qr-kod-vjencanje",
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


function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privatnost
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Uvjeti
          </Link>
          <a
            href="mailto:info@guestcam.si"
            className="hover:text-white transition-colors"
          >
            Kontakt
          </a>
        </div>
      </div>
    </footer>
  );
}

function CtaBox() {
  return (
    <div
      className="rounded-3xl p-8 my-12 text-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,201,77,0.12) 0%, rgba(255,201,77,0.12) 100%)",
        border: "1px solid rgba(255,201,77,0.2)",
      }}
    >
      <p className="font-serif text-2xl font-bold text-[#0F1729] mb-3">
        Pripremite QR kod za vaše vjenčanje
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Kreirajte personaliziranu galeriju za 2 minute. Besplatno zauvijek —
        bez kreditne kartice.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "#FFC94D",
          boxShadow: "0 10px 30px rgba(255,201,77,0.35)",
        }}
      >
        Počnite besplatno →
      </Link>
    </div>
  );
}

export default function QrKodVjencanjePage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="hr" hreflang={GUIDE_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}
          >
            Vodič · Hrvatska · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            QR kod za vjenčanje — skupite sve fotografije gostiju
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Aplikacija za fotografije s vjenčanja preko QR koda — najpametniji
            način da skupite slike svih gostiju. Umjesto da fotografije ostanu
            zarobljene na telefonima, gosti ih jednim skeniranjem šalju izravno
            u vašu privatnu galeriju — bez aplikacije, bez registracije, bez stresa.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vrijeme čitanja: ~5 minuta
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Ažurirano: siječanj 2025
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Što je QR kod za vjenčanje?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            QR kod za vjenčanje poseban je kod koji isprintate na stolove, pozivnice
            ili stalke na vjenčanom prostoru. Kada ga gost skenira pametnim
            telefonom, automatski se preusmjerava na vašu osobnu vjenčanu galeriju
            gdje uploadana fotografija ili video odmah pristaje u vašu kolekciju.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Za razliku od grupnih razgovora (WhatsApp, Messenger) ili platformi
            poput Google Photosa, QR kod za vjenčanje funkcionira savršeno za sve
            goste — od starije gospođe s osnovnim pametnim telefonom do digitalnog
            urođenika s najnovijim iPhoneom. Nije potrebna nikakva aplikacija,
            nikakva registracija, nikakva lozinka.
          </p>
        </section>

        <CtaBox />

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Zašto QR kod na vjenčanju zaista funkcionira
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Statistike su jasne: na prosječnom vjenčanju sa 100 gostiju, svaki
            gost snimi najmanje 15–30 fotografija. To je 1.500 do 3.000
            fotografija koje nikada ne dođu do para. Razlozi su uvijek isti:
          </p>
          <div className="grid gap-4 mb-6">
            {[
              {
                title: "Zaborave poslati",
                desc: "Nakon vjenčanja prolaze dani, tjedni, mjeseci. Fotografije ostaju na telefonu i nitko ih se više ne sjeti.",
              },
              {
                title: "Kompresija u aplikacijama",
                desc: "WhatsApp slike komprimira i do 70 %. Dobili biste samo fotografije loše kvalitete koje ne možete printati.",
              },
              {
                title: "Kaos s e-mail adresama",
                desc: "Skupljati e-mail adrese od 100 gostiju i čekati da vam svaki pošalje fotografije — logistička noćna mora.",
              },
              {
                title: "Prostorna ograničenja",
                desc: "Google Photos i Dropbox zahtijevaju prijavu, dovoljno prostora i preuzimanje aplikacije.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,201,77,0.1)" }}
                >
                  <svg className="w-4 h-4" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
            QR kod za vjenčanje rješava sve ove probleme odjednom. Gost snimi
            fotografiju, skenira kod, uploadano je — u punoj kvaliteti, bez
            frke, bez aplikacija.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Prednosti QR koda za vjenčanje
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📸", title: "Puna kvaliteta", desc: "Svaka fotografija je pohranjena u originalnoj rezoluciji — prikladna za tisak i foto knjige." },
              { icon: "📱", title: "Bez aplikacije", desc: "Gosti otvaraju galeriju u pregledniku. Nikakva instalacija, nikakva registracija." },
              { icon: "⚡", title: "U stvarnom vremenu", desc: "Za vrijeme vjenčanja već vidite fotografije koje gosti uploadaju. Idealno za live projekciju." },
              { icon: "🌍", title: "Višejezično", desc: "Galerija se prilagođava jeziku gosta — hrvaski, slovenaçki, engleski, njemçaki…" },
              { icon: "🔒", title: "Privatno", desc: "Album nije javan. Dostupan je samo s vašim QR kodom ili direktnim linkom." },
              { icon: "💾", title: "Preuzimanje jednim klikom", desc: "Nakon vjenčanja preuzimate sve fotografije kao ZIP arhiv — u punoj kvaliteti, za sekundu." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Kako postaviti QR kod za vjenčanje s Guestcam — korak po korak
          </h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Kreirajte besplatni račun", desc: "Posjetite Guestcam.si i kliknite »Kreiraj galeriju besplatno«. Unesite e-mail adresu i lozinku — postupak traje manje od minute." },
              { step: "02", title: "Postavite galeriju", desc: "Unesite ime para (npr. »Ana i Marko«), datum vjenčanja i lokaciju. Odaberete pozadinsku fotografiju, boju teme i jezik galerije." },
              { step: "03", title: "Odaberite predložak za tisak", desc: "Guestcam nudi 8 elegantnih predložaka za QR kartice — od klasičnih do botaničkih i skandinavskih. Svaki predložak se automatski prilagođava s vašim imenom i datumom." },
              { step: "04", title: "Preuzmite i isprintajte", desc: "Predložak preuzimate kao PDF visoke rezolucije. Pošaljite ga u lokalnu tiskaru ili isprintajte sami. Preporučujemo karton 300 g/m² za najbolji izgled." },
              { step: "05", title: "Postavite kartice na vjenčanje", desc: "Kartice rasporedite po stolovima, postavite na stalke kraj bara, priložite pozivnicama ili okačite na plakate. Preporučujemo najmanje jednu karticu po stolu." },
              { step: "06", title: "Gosti skeniraju i uploadaju", desc: "Gosti telefonom skeniraju QR kod i odmah vide obrazac za upload fotografija. Nema aplikacije, nema prijave — samo skeniranje i upload." },
              { step: "07", title: "Preuzmete sve jednim klikom", desc: "Nakon vjenčanja prijavite se na nadzornu ploču i kliknete »Preuzmi sve«. Sve fotografije i videi su u ZIP arhivu — u punoj kvaliteti." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5" style={{ background: "#FFC94D", color: "#0F1729" }}>
                  {step}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm">
                  <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 — Tips */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Savjeti za najbolje rezultate
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Isprintajte najmanje jednu karticu po stolu — ne samo jednu kod ulaza.",
              "Voditelj ili MC neka ukratko objasni gostima QR kod na početku vjenčanja.",
              "Veće kartice (A5 ili A4) su vidljivije i gosti ih brže primjećuju.",
              "Na kartici dodajte kratku uputu na hrvatskom i eventualno engleskom za strane goste.",
              "Testirajte QR kod prije vjenčanja — sami ga skenirajte i uploadajte testnu fotografiju.",
              "Za live projekciju tijekom domjenka uključite funkciju »Prikaži fotografije uživo« u postavkama.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,201,77,0.15)" }}>
                  <svg className="w-3 h-3" style={{ color: "#C9820A" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
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
            Česta pitanja o QR kodu za vjenčanje
          </h2>
          <div className="space-y-3">
            {[
              { q: "Je li QR kod za vjenčanje stvarno besplatan?", a: "S Guestcamom je kreiranje galerije i QR koda besplatno zauvijek (do određenih ograničenja). Za veća vjenčanja dostupni su plaćeni paketi s neograničenim fotografijama." },
              { q: "Moraju li gosti preuzeti aplikaciju?", a: "Apsolutno ne. Gosti otvaraju galeriju izravno u pregledniku telefona — nije potrebna nikakva aplikacija ni registracija." },
              { q: "U kojoj kvaliteti se pohranjuju fotografije?", a: "U punoj originalnoj rezoluciji. Guestcam fotografije ne komprimira ni smanjuje. Dobit ćete točno ono što je gost snimio." },
              { q: "Što se događa s fotografijama nakon vjenčanja?", a: "Galerija ostaje aktivna koliko traje vaš paket. Bilo kada preuzimate sve fotografije kao ZIP arhiv." },
              { q: "Je li album privatan?", a: "Da. Album je dostupan samo s vašim QR kodom ili direktnim linkom. Nikakva tražilica neće ga indeksirati." },
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

        {/* Final CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: "#0F1729" }}>
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Vaše vjenčanje zaslužuje sve uspomene
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Kreirajte galeriju s QR kodom za 2 minute — besplatno, bez kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Počnite besplatno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Galerija za 2 minute · SSL zaštita · GDPR usklađeno
          </p>
        </div>
      </main>

      <SeoFooter lang="hr" />
    </div>
  );
}
