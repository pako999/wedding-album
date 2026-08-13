import { SITE_URL } from "@/lib/urls";
import Link from "next/link";
import type { Metadata } from "next";
import { HOME_HREFLANG } from "@/components/LanguageSwitcher";
import { SeoFooter } from "@/components/SeoFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE_URL, ogImage } from "@/lib/og";

// NOTE: this landing page currently only exists in Slovenian. The
// `alternates.languages` map below intentionally lists only "sl" +
// "x-default" — declaring hr/sr/de/en/es entries for pages that don't
// exist yet would be broken hreflang (see the warning in app/sitemap.ts).
// Once the other locales are built, add them here AND to a new
// CORPORATE_HREFLANG map in components/LanguageSwitcher.tsx (mirroring
// GUIDE_HREFLANG), then pass it as the `hreflang` prop to <SiteHeader>
// below instead of the HOME_HREFLANG fallback.
export const metadata: Metadata = {
  title: "QR koda za poslovne dogodke — fotografije 2026",
  description:
    "Aplikacija za fotografije s poslovnih dogodkov: QR koda, brez aplikacije, GDPR-skladno. Zberite fotografije zaposlenih in gostov v polni kakovosti.",
  openGraph: {
    url: `${SITE_URL}/sl/qr-koda-za-poslovne-dogodke`,
    title: "QR koda za poslovne dogodke — fotografije 2026",
    description:
      "Zberite vse fotografije udeležencev poslovnega dogodka z eno samo QR kodo. Brez aplikacije, moderacija pred objavo, GDPR-skladno.",
    type: "article",
    images: [ogImage("QR koda za poslovne dogodke — zberite fotografije udeležencev")],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR koda za poslovne dogodke — fotografije 2026",
    description: "Zberite vse fotografije udeležencev z eno samo QR kodo. Brez aplikacije.",
    images: [OG_IMAGE_URL],
  },
  alternates: {
    canonical: `${SITE_URL}/sl/qr-koda-za-poslovne-dogodke`,
    languages: {
      "sl": `${SITE_URL}/sl/qr-koda-za-poslovne-dogodke`,
      "x-default": `${SITE_URL}/sl/qr-koda-za-poslovne-dogodke`,
    },
  },
};

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
        Pripravite QR kodo za vaš poslovni dogodek
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Ustvarite galerijo v 2 minutah. Brezplačno za začetek — brez kreditne
        kartice.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "#FFC94D",
          boxShadow: "0 10px 30px rgba(255,201,77,0.35)",
        }}
      >
        Začni brezplačno zdaj →
      </Link>
    </div>
  );
}

export default function QrKodaPoslovniDogodekPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="sl" hreflang={HOME_HREFLANG} />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(255,201,77,0.1)", color: "#C9820A" }}>
            Vodnik · Poslovni dogodki · 2026
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0F1729] leading-tight mb-5">
            QR koda za poslovne dogodke: zberite vse fotografije udeležencev (brez aplikacije)
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            Konferenca, team building, novoletna zabava ali predstavitev izdelka —
            fotograf ujame le uradne trenutke, vse ostalo pa ostane razpršeno po
            telefonih udeležencev in ducatih Teams ali WhatsApp klepetov. QR koda za
            poslovni dogodek reši to v enem koraku: udeleženec skenira, izbere
            fotografije in jih pošlje neposredno v vašo zasebno galerijo — brez
            aplikacije, brez prijave.
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
              Posodobljeno: 2026
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Kaj je QR koda za poslovne dogodke?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            QR koda za poslovni dogodek je koda, ki jo natisnete na priponke
            udeležencev, mize, roll-up panoje ali prikažete na zaslonu med odmori.
            Ko jo udeleženec skenira s pametnim telefonom, se odpre vaša zasebna
            galerija dogodka, kamor takoj naloži fotografije in videoposnetke v
            polni kakovosti.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Za razliko od internih Teams ali Slack klepetov, ki so razpršeni po
            oddelkih, ali osebnih WhatsApp skupin, ki mešajo zasebno in poslovno,
            QR koda deluje enako za vsakega udeleženca — od vodstva do gostov
            iz partnerskih podjetij. Ni potrebna nobena aplikacija, ni
            registracije, ni gesla.
          </p>
        </section>

        <CtaBox />

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Zakaj klasično zbiranje fotografij na poslovnih dogodkih ne deluje
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Na povprečni konferenci ali korporativnem dogodku s 100 udeleženci
            profesionalni fotograf ujame le peščico uradnih trenutkov — govorca na
            odru, skupinsko fotografijo, rokovanje na koncu. Vse spontane trenutke
            iz mreženja, team buildinga in odmorov posnamejo udeleženci sami, a
            fotografije nikoli ne pridejo do organizatorja. Razlogi so vedno enaki:
          </p>
          <div className="grid gap-4 mb-6">
            {[
              {
                title: "Razpršeno po klepetih",
                desc: "Fotografije končajo v ducatih Teams, Slack in WhatsApp klepetov po oddelkih — nihče nima časa vsega zbrati na enem mestu.",
              },
              {
                title: "Fotograf ujame le uradne trenutke",
                desc: "Govorci, skupinska fotografija, rokovanja — a ne smeh na odmoru, backstage priprave ali trenutki na after-party.",
              },
              {
                title: "Tvegana zasebnost potrošniških aplikacij",
                desc: "WhatsApp skupina ali osebni Google Photos račun za poslovni dogodek pomeni, da podjetje nima nadzora nad tem, kje in kako se slike shranjujejo.",
              },
              {
                title: "Brez nadzora nad vsebino",
                desc: "Brez moderacije lahko neprimerna ali interno občutljiva fotografija pristane v skupnem klepetu ali na velikem zaslonu, preden jo kdorkoli pregleda.",
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
            QR koda za poslovni dogodek reši vse to naenkrat: en naslov, kamor
            pošljejo slike vsi udeleženci, moderacija pred objavo in podatki na
            strežnikih v EU.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#0F1729] mb-4">
            Prednosti QR kode za poslovne dogodke
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📸",
                title: "Polna kakovost",
                desc: "Vsaka fotografija je shranjena v originalni ločljivosti — primerna za interno komunikacijo, spletno stran ali družbena omrežja.",
              },
              {
                icon: "📱",
                title: "Brez aplikacije",
                desc: "Udeleženci odprejo galerijo v brskalniku. Nobene namestitve, nobenega prijavljanja z osebnim računom.",
              },
              {
                icon: "⚡",
                title: "V realnem času",
                desc: "Med dogodkom že vidite fotografije, ki jih nalagajo udeleženci. Idealno za live projekcijo med mreženjem ali po odru.",
              },
              {
                icon: "✅",
                title: "Moderacija pred objavo",
                desc: "Vklopite pregled fotografij, preden postanejo vidne — pomembno, če galerijo prikazujete v živo na velikem zaslonu.",
              },
              {
                icon: "🔒",
                title: "Zasebno in GDPR-skladno",
                desc: "Galerija ni javna in ni indeksirana. Podatki so shranjeni na strežnikih v EU (Bunny.net CDN + Neon PostgreSQL).",
              },
              {
                icon: "🏢",
                title: "Lastna domena",
                desc: "S Premium paketom galerijo povežete z lastno domeno (npr. foto.vase-podjetje.si) za bolj profesionalen videz.",
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
            Kako nastavite QR kodo za poslovni dogodek z CamLove — korak za korakom
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Postopek je hiter in ne zahteva vključenosti IT oddelka. Sledite tem
            korakom:
          </p>
          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Ustvarite brezplačen račun",
                desc: "Obiščite camlove.me in kliknite »Ustvari galerijo brezplačno«. Vnesite e-poštni naslov in geslo — postopek traja manj kot minuto.",
              },
              {
                step: "02",
                title: "Nastavite galerijo dogodka",
                desc: "Vnesite ime dogodka ali podjetja, datum in kraj. Izberete lahko barvo teme in jezik galerije.",
              },
              {
                step: "03",
                title: "Vklopite moderacijo fotografij",
                desc: "Za poslovne dogodke priporočamo, da vklopite pregled fotografij pred objavo — v nastavitvah galerije, pod »Moderacija fotografij pred objavo«.",
              },
              {
                step: "04",
                title: "Izberite predlogo za tisk",
                desc: "CamLove ponuja predloge za QR kartice, primerne za priponke, mize ali roll-up panoje. Vsaka se samodejno prilagodi z imenom dogodka.",
              },
              {
                step: "05",
                title: "Natisnite in postavite",
                desc: "Kartice namestite na priponke udeležencev, mize v prostoru za mreženje in zaslone med odmori. Priporočamo vsaj tri vidne točke.",
              },
              {
                step: "06",
                title: "Udeleženci skenirajo in nalagajo",
                desc: "Z eno kamero telefona skenirajo QR kodo in takoj vidijo obrazec za nalaganje. Ni aplikacije, ni prijave.",
              },
              {
                step: "07",
                title: "Prenesete vse v enem kliku",
                desc: "Po dogodku se prijavite v nadzorno ploščo in kliknete »Prenesi vse«. Vse fotografije so v ZIP arhivu — pripravljene za interno komunikacijo ali objave.",
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
              "QR kodo natisnite na priponko vsakega udeleženca — ne le na eno tablo pri vhodu.",
              "Voditelj dogodka naj galerijo na kratko omeni v uvodnem nagovoru.",
              "Prikažite QR kodo na velikih zaslonih med odmori in po glavnem programu.",
              "Vklopite moderacijo, če boste galerijo prikazovali v živo na skupnem zaslonu.",
              "Po dogodku delite povezavo do galerije prek internih kanalov (e-pošta, Teams, Slack).",
              "Za mednarodne konference izkoristite večjezični vmesnik — udeleženci vidijo galerijo v svojem jeziku.",
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
            Pogosta vprašanja o QR kodah za poslovne dogodke
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Ali je QR koda za poslovne dogodke res brezplačna?",
                a: "Z CamLove je ustvarjanje galerije in QR kode brezplačno za vedno (do 20 fotografij). Za konference in dogodke z več udeleženci so na voljo plačljivi paketi z neomejenim številom fotografij.",
              },
              {
                q: "Ali lahko fotografije pregledamo, preden so vidne vsem?",
                a: "Da. V nastavitvah galerije vklopite moderacijo — vsaka fotografija čaka na vašo potrditev, preden se pojavi v galeriji ali na live projekciji.",
              },
              {
                q: "Kje se shranjujejo fotografije in ali je to skladno z GDPR?",
                a: "Fotografije se shranjujejo na strežnikih v EU (Bunny.net CDN + Neon PostgreSQL). Galerija ni javna in ni indeksirana v iskalnikih.",
              },
              {
                q: "Ali lahko dodamo logotip podjetja ali lastno domeno?",
                a: "S Premium paketom lahko galerijo povežete z lastno domeno (npr. foto.vase-podjetje.si) za bolj profesionalen videz na dogodku.",
              },
              {
                q: "Ali morajo udeleženci prenesti aplikacijo?",
                a: "Ne. Udeleženci odprejo galerijo neposredno v brskalniku telefona — ni potrebna nobena aplikacija ali osebni račun.",
              },
              {
                q: "Kaj se zgodi s fotografijami po dogodku?",
                a: "Galerija ostane aktivna toliko časa, kolikor traja vaš paket. Kadarkoli prenesete vse fotografije kot ZIP arhiv za interno uporabo.",
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
            Vaš dogodek si zasluži vse trenutke
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Ustvarite galerijo z QR kodo v 2 minutah — brezplačno, brez
            kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#FFC94D", color: "#0F1729" }}
          >
            Začni brezplačno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Galerija pripravljena v 2 minutah · SSL zaščita · GDPR skladno
          </p>
        </div>
      </main>

      <SeoFooter lang="sl" />
    </div>
  );
}
