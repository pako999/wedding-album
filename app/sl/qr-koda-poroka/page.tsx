import { SITE_URL } from "@/lib/urls";
import { withRegionalHreflang } from "@/lib/seo/hreflang";
import Link from "next/link";
import type { Metadata } from "next";
import { GUIDE_HREFLANG, LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";
import { safeJsonLd } from "@/lib/seo/jsonld-safe";

export const metadata: Metadata = {
  title: "QR-koda za poroko • Fotografije gostov | Guestcam",
  description:
    "Z eno QR-kodo zberite fotografije in videe gostov v zasebni poročni galeriji. Brez aplikacije in registracije, v polni kakovosti.",
  openGraph: {
    url: `${SITE_URL}/sl/qr-koda-poroka`,
    title: "QR-koda za poroko • Fotografije gostov | Guestcam",
    description:
      "Zberite fotografije in videe gostov z eno QR-kodo. Brez aplikacije in registracije, v polni kakovosti.",
    type: "article",
    images: [ogImage("QR-koda za poroko — fotografije gostov")],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR-koda za poroko • Fotografije gostov | Guestcam",
    description: "Z eno QR-kodo zberite fotografije in videe gostov. Brez aplikacije in registracije.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: `${SITE_URL}/sl/qr-koda-poroka`,
    languages: withRegionalHreflang({
      "sl": `${SITE_URL}/sl/qr-koda-poroka`,
      "hr": `${SITE_URL}/hr/qr-kod-vjencanje`,
      "sr": `${SITE_URL}/sr/qr-kod-vencanje`,
      "de": `${SITE_URL}/de/hochzeitsfotos-sammeln`,
      "en": `${SITE_URL}/en/wedding-photo-sharing`,
      "es": `${SITE_URL}/es/fotos-boda-qr`,
      "x-default": `${SITE_URL}/sl/qr-koda-poroka`,
    }),
  },
};


const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "QR-koda za poroko: zberite fotografije in videe gostov",
  description: "Kako z eno QR-kodo zbrati fotografije in videe poročnih gostov v zasebni galeriji brez aplikacije in registracije.",
  inLanguage: "sl-SI",
  dateModified: "2026-10-19",
  author: { "@type": "Organization", name: "Guestcam" },
  publisher: {
    "@type": "Organization",
    name: "Guestcam",
    logo: `${SITE_URL}/icon-512.png`,
  },
  mainEntityOfPage: `${SITE_URL}/sl/qr-koda-poroka`,
};

function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2026 Sport group d.o.o. · SI72133449</p>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Zasebnost
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Pogoji
          </Link>
          <Link href="/cookies" className="hover:text-white transition-colors">
            Piškotki
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
        Pripravite QR-kodo za svojo poroko
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Ustvarite prilagojeno galerijo v nekaj minutah. Začnete lahko brezplačno —
        brez kreditne kartice.
      </p>
      <Link
        href="/dashboard/new?lang=sl"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "#FFC94D",
          boxShadow: "0 10px 30px rgba(255,201,77,0.35)",
        }}
      >
        Začnite brezplačno →
      </Link>
    </div>
  );
}

export default function QrKodaPorokaPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <SiteHeader lang="sl" hreflang={GUIDE_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}>
            Vodnik · Slovenija · 2026
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            QR-koda za poroko: zberite fotografije in videe gostov
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            QR-koda za poroko je preprost način za zbiranje
            fotografij gostov. Namesto da slike ostanejo zaklenjene na telefonih,
            jih gostje z enim skeniranjem pošljejo neposredno v vaš osebni
            poročni album — brez aplikacije, brez prijave, brez stresa.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Čas branja: ~5 minut
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C9820A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Posodobljeno: oktober 2026
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Kaj je QR-koda za poroko?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            QR-koda za poroko je koda, ki jo natisnete na kartice za mize, vabila
            ali stojala na poročnem prizorišču. Ko jo gost skenira s pametnim
            telefonom, ga ta samodejno preusmeri na vašo osebno poročno galerijo,
            kjer naložena fotografija ali videoposnetek takoj pristane v vaši zbirki.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Za razliko od skupinskih klepetov (WhatsApp, Messenger) ali platform,
            kot je Google Photos, QR-koda za poroko gostom omogoči preprost dostop do galerije
            goste — od starejše gospe z osnovnim pametnim telefonom do digitalnega
            domorodca z najnovejšim iPhoneom. Ni potrebna nobena aplikacija, ni
            registracije, ni gesla.
          </p>
        </section>

        <CtaBox />

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Zakaj QR-koda na poroki deluje
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Gostje na poroki posnamejo veliko fotografij in videov, vendar jih po dogodku pogosto ne delijo z mladoporočencema. Najpogostejši razlogi so preprosti:
          </p>
          <div className="grid gap-4 mb-6">
            {[
              {
                title: "Pozabijo poslati",
                desc: "Po poroki minejo dnevi, tedni, meseci. Fotografije ostanejo v telefonu in se jih nihče več ne spomni.",
              },
              {
                title: "Kompresija v aplikacijah",
                desc: "Aplikacije za klepet lahko fotografije stisnejo, zato niso vedno primerne za arhiviranje ali tisk.",
              },
              {
                title: "Kaos z e-poštnimi naslovi",
                desc: "Zbiranje e-poštnih naslovov in čakanje, da vsak gost posebej pošlje fotografije, je zamudno.",
              },
              {
                title: "Prostorske omejitve",
                desc: "Deljene galerije drugih ponudnikov pogosto zahtevajo račun, prijavo ali dodatne korake, ki del gostov odvrnejo od nalaganja.",
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
                  <svg
                    className="w-4 h-4"
                    style={{ color: "#C9820A" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
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
            QR-koda za poroko zmanjša število korakov. Gost odpre galerijo, izbere fotografije ali videe in jih naloži neposredno iz brskalnika — brez aplikacije in brez stiskanja datotek.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Prednosti QR-kode za poroko
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📸",
                title: "Polna kakovost",
                desc: "Vsaka fotografija je shranjena v izvirni ločljivosti — primerna za tisk in fotografske knjige.",
              },
              {
                icon: "📱",
                title: "Brez aplikacije",
                desc: "Gostje odprejo galerijo v brskalniku. Nobene namestitve, nobene registracije.",
              },
              {
                icon: "⚡",
                title: "V živo",
                desc: "Med poroko lahko sproti spremljate fotografije, ki jih nalagajo gostje, in jih prikažete na foto steni v živo.",
              },
              {
                icon: "🌍",
                title: "Večjezično",
                desc: "Galerija podpira slovenščino, hrvaščino, srbščino, angleščino, nemščino in španščino.",
              },
              {
                icon: "🔒",
                title: "Zasebno",
                desc: "Album ni javno izpostavljen. Dostopen je prek QR-kode ali neposredne povezave, po želji pa ga zaščitite z geslom.",
              },
              {
                icon: "💾",
                title: "Prenos v enem kliku",
                desc: "Po poroki prenesete fotografije in videe v ZIP-arhivu — v polni kakovosti in z enim klikom.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#0F1729] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — Step by step */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Kako nastavite QR-kodo za poroko z Guestcam — korak za korakom
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Z Guestcam je postopek hiter in intuitiven. Sledite tem korakom:
          </p>
          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Ustvarite brezplačen račun",
                desc: "Obiščite Guestcam.si in kliknite »Ustvari galerijo brezplačno«. Vnesite e-poštni naslov in geslo — postopek traja manj kot minuto.",
              },
              {
                step: "02",
                title: "Nastavite galerijo",
                desc: "Vnesite ime para (npr. »Ana in Marko«), datum poroke in kraj. Izberete lahko fotografijo ozadja, barvo teme in jezik galerije.",
              },
              {
                step: "03",
                title: "Izberite predlogo za tisk",
                desc: "Guestcam ponuja predloge za QR-kartice — od klasičnih do botaničnih in skandinavskih. Vsaka predloga se samodejno prilagodi z vašim imenom in datumom.",
              },
              {
                step: "04",
                title: "Prenesite in natisnite",
                desc: "Predlogo prenesete kot PDF visoke ločljivosti. Pošljite ga v lokalno tiskarno ali natisnite sami. Priporočamo karton 300 g/m² za najboljši izgled.",
              },
              {
                step: "05",
                title: "Postavite kartice na poroko",
                desc: "Kartice razporedite po mizah, postavite na stojala ob baru, priložite k povabilom ali jih obesite na plakate. Priporočamo vsaj eno kartico na vsako mizo.",
              },
              {
                step: "06",
                title: "Gostje skenirajo in nalagajo",
                desc: "Gostje s telefonom skenirajo QR-kodo in takoj odprejo stran za nalaganje fotografij in videov. Ni aplikacije, ni prijave — le skeniranje in nalaganje.",
              },
              {
                step: "07",
                title: "Prenesete vse v enem kliku",
                desc: "Po poroki se prijavite v nadzorno ploščo in kliknete »Prenesi vse«. Vse fotografije in videi so v ZIP arhivu — v polni kakovosti.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5"
                  style={{ background: "#FFC94D", color: "#0F1729" }}
                >
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

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Nasveti za kar najboljše rezultate
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Natisnite vsaj eno kartico na vsako mizo — ne samo eno pri vhodu.",
              "Poročni voditelj ali DJ naj gostom na kratko razloži uporabo QR-kode.",
              "Večje kartice (A5 ali A4) so bolj vidne in jih gostje hitreje opazijo.",
              "Na kartico dodajte kratko navodilo v slovenščini in morda angleščini za tuje goste.",
              "Preizkusite QR-kodo pred poroko — skenirajte jo in naložite testno fotografijo.",
              "Za prikaz fotografij med dogodkom uporabite funkcijo Foto stena v živo.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(255,201,77,0.15)" }}
                >
                  <svg
                    className="w-3 h-3"
                    style={{ color: "#C9820A" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 6 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Pogosta vprašanja o QR-kodah za poroko
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Ali lahko QR-kodo za poroko preizkusim brezplačno?",
                a: "Da. Brezplačni paket vključuje 1 dogodek, 1 galerijo, do 20 fotografij in 1 videoposnetek. Za več prostora in dodatne funkcije so na voljo plačljivi paketi.",
              },
              {
                q: "Ali morajo gostje prenesti aplikacijo?",
                a: "Absolutno ne. Gostje odprejo galerijo neposredno v brskalniku telefona — ni potrebna nobena aplikacija ali registracija.",
              },
              {
                q: "V kakšni kakovosti se shranjujejo fotografije?",
                a: "V polni izvirni ločljivosti. Guestcam fotografij pri shranjevanju ne zmanjša, zato so primerne tudi za tisk.",
              },
              {
                q: "Kaj se zgodi s fotografijami po poroki?",
                a: "Galerija ostane aktivna toliko časa, kolikor omogoča vaš paket. Kadar koli lahko prenesete fotografije in videe v ZIP-arhivu.",
              },
              {
                q: "Ali je album zaseben?",
                a: "Da. Album je dostopen prek QR-kode ali neposredne povezave. Strani albumov so označene tako, da jih iskalniki ne indeksirajo.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="bg-white border border-gray-100 rounded-2xl group"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#0F1729] list-none text-sm">
                  {q}
                  <svg
                    className="w-4 h-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ background: "#0F1729" }}
        >
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Vaša poroka si zasluži vse spomine
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Ustvarite galerijo s QR-kodo v nekaj minutah — začnete lahko brezplačno, brez
            kreditne kartice.
          </p>
          <Link
            href="/dashboard/new?lang=sl"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Začnite brezplačno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Galerija pripravljena v nekaj minutah · zaščitena povezava · skladno z GDPR
          </p>
        </div>
      </main>

      <SeoFooter lang="sl" />
    </div>
  );
}
