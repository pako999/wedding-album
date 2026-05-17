import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR koda za poroko — Popoln vodnik 2025 | WeddingAlbum",
  description:
    "Vse, kar morate vedeti o QR kodi za poroko. Kako deluje, zakaj jo potrebujete in kako jo v 2 minutah nastavite z WeddingAlbum.",
  openGraph: {
    title: "QR koda za poroko — Popoln vodnik 2025",
    description:
      "Zberi vse fotografije gostov z eno samo QR kodo. Brez aplikacije, v polni kakovosti.",
    type: "article",
  },
  alternates: {
    canonical: "https://weddingalbum.si/sl/qr-koda-poroka",
  },
};

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-serif italic text-xl font-bold text-[#2C2825]">
            WeddingAlbum
          </span>
          <span className="font-black text-2xl leading-none text-[#C4738A]">.</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-[#2C2825] transition-colors">
            Domov
          </Link>
          <Link
            href="/dashboard/new"
            className="px-4 py-2 rounded-full text-sm font-bold border-2 border-[#2C2825] text-[#2C2825] hover:bg-[#2C2825] hover:text-white transition-all duration-200"
          >
            Ustvari galerijo
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#2C2825] text-white py-8 mt-20">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© 2025 Sport group d.o.o. · SI72133449</p>
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
            href="mailto:hello@wedflow.app"
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
          "linear-gradient(135deg, rgba(196,115,138,0.12) 0%, rgba(201,169,110,0.12) 100%)",
        border: "1px solid rgba(196,115,138,0.2)",
      }}
    >
      <p className="font-serif text-2xl font-bold text-[#2C2825] mb-3">
        Pripravite QR kodo za vašo poroko
      </p>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Ustvarite personalizirano galerijo v 2 minutah. Brezplačno za vedno —
        brez kreditne kartice.
      </p>
      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-base transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: "#C4738A",
          boxShadow: "0 10px 30px rgba(196,115,138,0.35)",
        }}
      >
        Začni brezplačno zdaj →
      </Link>
    </div>
  );
}

export default function QrKodaPorokaPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2825] font-sans">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
            style={{ background: "rgba(196,115,138,0.1)", color: "#C4738A" }}>
            Vodnik · Slovenija · 2025
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2C2825] leading-tight mb-5">
            QR koda za poroko — vse, kar morate vedeti
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            QR koda za poroko je danes eden najpametnejših načinov za zbiranje
            fotografij gostov. Namesto da slike ostanejo zaklenjene na telefonih,
            jih gostje z enim skeniranjem pošljejo neposredno v vaš osebni
            poročni album — brez aplikacije, brez prijave, brez stresa.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Čas branja: ~5 minut
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#C4738A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              Posodobljeno: januar 2025
            </span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#2C2825] mb-4">
            Kaj je QR koda za poroko?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            QR koda za poroko je posebna koda, ki jo natisnite na mize, povabila
            ali stojala na poročnem prizorišču. Ko jo gost skenira s pametnim
            telefonom, ga ta samodejno preusmeri na vašo osebno poročno galerijo,
            kjer naložena fotografija ali videoposnetek takoj pristane v vaši zbirki.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Za razliko od skupinskih klepetov (WhatsApp, Messenger) ali platform,
            kot je Google Photos, QR koda za poroko deluje brezhibno za vse
            goste — od starejše gospe z osnovnim pametnim telefonom do digitalnega
            domorodca z najnovejšim iPhoneom. Ni potrebna nobena aplikacija, ni
            registracije, ni gesla.
          </p>
        </section>

        <CtaBox />

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#2C2825] mb-4">
            Zakaj QR koda na poroki resnično deluje
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Statistike so jasne: na povprečni poroki s 100 gosti vsak gost posname
            vsaj 15–30 fotografij. To je 1.500 do 3.000 fotografij, ki nikoli ne
            pridejo do para. Razlogi so vedno enaki:
          </p>
          <div className="grid gap-4 mb-6">
            {[
              {
                title: "Pozabijo poslati",
                desc: "Po poroki minejo dnevi, tedni, meseci. Fotografije ostanejo v telefonu in se jih nihče več ne spomni.",
              },
              {
                title: "Kompresija v aplikacijah",
                desc: "WhatsApp slike stisne za do 70 %. Prejeli bi le slike slabe kakovosti, ki jih ne morete natisniti.",
              },
              {
                title: "Kaos z e-poštnimi naslovi",
                desc: "Zbirati e-poštne naslove od 100 gostov in čakati, da vam vsak pošlje fotografije, je logistična mora.",
              },
              {
                title: "Prostorske omejitve",
                desc: "Google Photos in Dropbox zahtevata prijavo, dovolj prostora in prenos aplikacije.",
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(196,115,138,0.1)" }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: "#C4738A" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#2C2825]">{title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 leading-relaxed">
            QR koda za poroko reši vse te težave naenkrat. Gost posname fotografijo,
            skenira kodo, naložena je — v polni kakovosti, brez strmin, brez aplikacij.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#2C2825] mb-4">
            Prednosti QR kode za poroko
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📸",
                title: "Polna kakovost",
                desc: "Vsaka fotografija je shranjena v originalni ločljivosti — primerna za tisk in fotografske knjige.",
              },
              {
                icon: "📱",
                title: "Brez aplikacije",
                desc: "Gostje odprejo galerijo v brskalniku. Nobene namestitve, nobene registracije.",
              },
              {
                icon: "⚡",
                title: "V realnem času",
                desc: "Med poroko že vidite fotografije, ki jih nalagajo gostje. Idealno za live projekcijo.",
              },
              {
                icon: "🌍",
                title: "Večjezično",
                desc: "Galerija se prilagodi jeziku gosta — slovensko, hrvaško, angleško, nemško…",
              },
              {
                icon: "🔒",
                title: "Zasebno",
                desc: "Album ni javen. Dostopen je samo z vašo QR kodo ali direktno povezavo.",
              },
              {
                icon: "💾",
                title: "Prenos v enem kliku",
                desc: "Po poroki prenesete vse fotografije kot ZIP arhiv — v polni kakovosti, v sekundi.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-semibold text-[#2C2825] mb-1">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — Step by step */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#2C2825] mb-4">
            Kako nastavite QR kodo za poroko z WeddingAlbum — korak za korakom
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Z WeddingAlbum je postopek hiter in intuitiven. Sledite tem korakom:
          </p>
          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Ustvarite brezplačen račun",
                desc: "Obiščite WeddingAlbum.si in kliknite »Ustvari galerijo brezplačno«. Vnesite e-poštni naslov in geslo — postopek traja manj kot minuto.",
              },
              {
                step: "02",
                title: "Nastavite galerijo",
                desc: "Vnesite ime para (npr. »Ana in Marko«), datum poroke in kraj. Izberete lahko fotografijo ozadja, barvo teme in jezik galerije.",
              },
              {
                step: "03",
                title: "Izberite predlogo za tisk",
                desc: "WeddingAlbum ponuja 8 elegantnih predlog za QR kartice — od klasičnih do botaničnih in skandinavskih. Vsaka predloga se samodejno prilagodi z vašim imenom in datumom.",
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
                desc: "Gostje s telefonom skenirajo QR kodo in takoj vidijo obrazec za nalaganje fotografij. Ni aplikacije, ni prijave — le skeniranje in nalaganje.",
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
                  style={{ background: "#C4738A", color: "white" }}
                >
                  {step}
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 flex-1 shadow-sm">
                  <p className="font-semibold text-[#2C2825] mb-1">{title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-[#2C2825] mb-4">
            Nasveti za kar najboljše rezultate
          </h2>
          <ul className="space-y-3 text-gray-600">
            {[
              "Natisnite vsaj eno kartico na vsako mizo — ne samo eno pri vhodu.",
              "Prosnik ali MC naj gostom na kratko razloži QR kodo ob začetku poroke.",
              "Večje kartice (A5 ali A4) so bolj vidne in jih gostje hitreje opazijo.",
              "Na kartico dodajte kratko navodilo v slovenščini in morda angleščini za tuje goste.",
              "Preizkusite QR kodo pred poroko — sami jo skenirajte in naložite testno fotografijo.",
              "Za live projekcijo med pogostitvijo vklopite funkcijo »Prikaži fotografije v živo« v nastavitvah.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(196,115,138,0.15)" }}
                >
                  <svg
                    className="w-3 h-3"
                    style={{ color: "#C4738A" }}
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
          <h2 className="font-serif text-2xl font-bold text-[#2C2825] mb-4">
            Pogosta vprašanja o QR kodah za poroko
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Ali je QR koda za poroko res brezplačna?",
                a: "Z WeddingAlbum je ustvarjanje galerije in QR kode brezplačno za vedno (do določenih omejitev). Za večje poroke so na voljo plačljivi paketi z neomejenimi fotografijami.",
              },
              {
                q: "Ali morajo gostje prenesti aplikacijo?",
                a: "Absolutno ne. Gostje odprejo galerijo neposredno v brskalniku telefona — ni potrebna nobena aplikacija ali registracija.",
              },
              {
                q: "V kakšni kakovosti se shranjujejo fotografije?",
                a: "V polni originalni ločljivosti. WeddingAlbum fotografij ne stisne ali zmanjša. Prejeli boste natanko tisto, kar je gost posnel.",
              },
              {
                q: "Kaj se zgodi s fotografijami po poroki?",
                a: "Galerija ostane aktivna toliko časa, kolikor traja vaš paket. Kadarkoli prenesete vse fotografije kot ZIP arhiv.",
              },
              {
                q: "Ali je album zaseben?",
                a: "Da. Album je dostopen zgolj z vašo QR kodo ali direktno povezavo. Nobena iskalna baza ga ne bo indeksirala.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="bg-white border border-gray-100 rounded-2xl group"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-[#2C2825] list-none text-sm">
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
          style={{ background: "#2C2825" }}
        >
          <p className="font-serif text-3xl font-bold text-white mb-3">
            Vaša poroka si zasluži vse spomine
          </p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Ustvarite galerijo z QR kodo v 2 minutah — brezplačno, brez
            kreditne kartice.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "#C4738A", color: "white" }}
          >
            Začni brezplačno →
          </Link>
          <p className="mt-4 text-xs text-gray-500">
            Galerija pripravljena v 2 minutah · SSL zaščita · GDPR skladno
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
