import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR — Varstvo osebnih podatkov | Guestcam",
  description:
    "Kako Guestcam zagotavlja skladnost z GDPR. Vaše pravice, osnove obdelave podatkov in kako nas kontaktirati.",
  openGraph: {
    title: "GDPR — Varstvo osebnih podatkov | Guestcam",
    description:
      "Guestcam je v celoti skladen z GDPR. Vaši podatki so shranjeni v EU in ste vedno v nadzoru.",
    type: "website",
  },
};

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0.5">
          <span className="font-serif italic text-xl font-bold text-[#0F1729]">
            Guestcam
          </span>
          <span className="font-black text-2xl leading-none text-[#C9820A]">.</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
          <Link href="/" className="hover:text-[#0F1729] transition-colors">
            Domov
          </Link>
          <Link
            href="/dashboard/new"
            className="px-4 py-2 rounded-full text-sm font-bold border-2 border-[#0F1729] text-[#0F1729] hover:bg-[#0F1729] hover:text-white transition-all duration-200"
          >
            Začni brezplačno
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#0F1729] text-white py-8 mt-16">
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
          <Link href="/gdpr" className="hover:text-white transition-colors">
            GDPR
          </Link>
          <a
            href="mailto:hello@guestcam.si"
            className="hover:text-white transition-colors"
          >
            Kontakt
          </a>
        </div>
      </div>
    </footer>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[#0F1729] mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

const rights = [
  {
    icon: "👁",
    title: "Pravica do dostopa (čl. 15)",
    desc: "Zahtevate kopijo vseh osebnih podatkov, ki jih hranimo o vas, skupaj z informacijo o namenu in roku hrambe.",
  },
  {
    icon: "✏️",
    title: "Pravica do popravka (čl. 16)",
    desc: "Nepravilne ali nepopolne podatke popravimo v najkrajšem možnem roku po vaši zahtevi.",
  },
  {
    icon: "🗑️",
    title: "Pravica do izbrisa ('biti pozabljen') (čl. 17)",
    desc: "Zahtevate trajni izbris vaših podatkov. Izbrišemo jih, razen kjer nas k hrambi zavezuje zakon (npr. računovodski podatki).",
  },
  {
    icon: "⏸️",
    title: "Pravica do omejitve obdelave (čl. 18)",
    desc: "Zahtevate, da omejimo obdelavo vaših podatkov, medtem ko preverjamo točnost ali ugovor.",
  },
  {
    icon: "📦",
    title: "Pravica do prenosljivosti podatkov (čl. 20)",
    desc: "Vaše fotografije in podatke prejmete v standardnem formatu (ZIP / JSON), ki ga lahko prenesete k drugemu ponudniku.",
  },
  {
    icon: "🚫",
    title: "Pravica do ugovora (čl. 21)",
    desc: "Kadar koli se uprouveljavljate pravico do ugovora obdelavi na podlagi legitimnega interesa.",
  },
  {
    icon: "⚖️",
    title: "Pravica do pritožbe (čl. 77)",
    desc: "Pritožbo vložite pri Informacijskem pooblaščencu RS (ip-rs.si) ali drugem pristojnem nadzornem organu EU.",
  },
];

export default function GdprPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-3">
              Varstvo podatkov
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#0F1729] mb-3">
              GDPR — Varstvo osebnih podatkov
            </h1>
            <p className="text-sm text-gray-400">
              Zadnja posodobitev: 1. januar 2025 · Sport group d.o.o.
            </p>
          </div>

          {/* GDPR badge row */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: "🇪🇺", label: "Podatki v EU", sub: "Vsi strežniki v Evropi" },
              { icon: "🔒", label: "GDPR skladen", sub: "Uredba (EU) 2016/679" },
              { icon: "✓", label: "Brez oglaševanja", sub: "Ni prodaje podatkov" },
            ].map(({ icon, label, sub }) => (
              <div
                key={label}
                className="bg-[#F2F4F8] rounded-2xl p-4 text-center border border-gray-100"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <p className="font-semibold text-sm text-[#0F1729]">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <p className="text-base leading-relaxed text-gray-600 mb-8">
            Sport group d.o.o. je upravljavec osebnih podatkov in je zavezan k
            spoštovanju Splošne uredbe o varstvu podatkov (GDPR — Uredba
            (EU) 2016/679). Ta stran pojasnjuje, kako obdelujemo podatke,
            katere pravice imate in kje dobite pomoč.
          </p>

          <Section title="1. Kdo smo">
            <div className="bg-[#F2F4F8] rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-[#0F1729]">Sport group d.o.o.</p>
              <p className="text-sm text-gray-600 mt-1">
                ID za DDV: SI72133449
              </p>
              <p className="text-sm text-gray-600">
                Kontaktna e-pošta za vprašanja o zasebnosti:{" "}
                <a
                  href="mailto:hello@guestcam.si"
                  className="text-[#C9820A] hover:underline"
                >
                  hello@guestcam.si
                </a>
              </p>
            </div>
          </Section>

          <Section title="2. Kateri podatki se obdelujejo">
            <p className="text-gray-600 mb-4">
              Obdelujemo minimalno količino podatkov, ki je nujno potrebna za
              delovanje storitve:
            </p>
            <div className="space-y-3">
              {[
                {
                  cat: "Podatki organizatorja",
                  items: [
                    "E-poštni naslov (za prijavo prek Clerk.com)",
                    "Ime para / organizatorja (za personalizacijo galerije)",
                    "Plačilni podatki (brez številk kartic — le evidenca nakupa)",
                  ],
                },
                {
                  cat: "Podatki gostov",
                  items: [
                    "Fotografije in videoposnetki, ki jih naložijo",
                    "Neobvezno ime ob nalaganju (prikaz v galeriji)",
                    "IP naslov (beležen le za varnostne namene, samodejno izbrisan po 30 dneh)",
                  ],
                },
                {
                  cat: "Tehnični podatki",
                  items: [
                    "Piškotki Clerk.com (samo za organizatorje — za vzdrževanje seje)",
                    "Osnovni dnevniški zapisi strežnika (za odpravljanje napak, hramba 14 dni)",
                  ],
                },
              ].map(({ cat, items }) => (
                <div key={cat} className="rounded-xl border border-gray-100 p-4">
                  <p className="font-semibold text-[#0F1729] mb-2">{cat}</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Pravna podlaga za obdelavo">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F2F4F8]">
                  <tr>
                    <th className="p-3 font-semibold text-[#0F1729]">Obdelava</th>
                    <th className="p-3 font-semibold text-[#0F1729]">
                      Pravna podlaga
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Ustvarjanje računa in galerije",
                      "Izvajanje pogodbe — čl. 6(1)(b)",
                    ],
                    [
                      "Shranjevanje fotografij in videov",
                      "Izvajanje pogodbe — čl. 6(1)(b)",
                    ],
                    [
                      "E-mail obvestila o novih fotografijah",
                      "Legitimen interes — čl. 6(1)(f)",
                    ],
                    [
                      "Varnost in zaščita pred zlorabo",
                      "Legitimen interes — čl. 6(1)(f)",
                    ],
                    [
                      "Hramba računov (10 let)",
                      "Zakonska obveznost — čl. 6(1)(c)",
                    ],
                  ].map(([obdelava, podlaga], i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="p-3 text-gray-700">{obdelava}</td>
                      <td className="p-3 text-gray-600">{podlaga}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Obdelovalci podatkov (podizvajalci)">
            <p className="text-gray-600 mb-4">
              Za zagotavljanje storitve sodelujemo z naslednjimi obdelovalci
              podatkov, ki so vsi v skladu z GDPR:
            </p>
            <div className="space-y-3">
              {[
                {
                  name: "Clerk.com",
                  role: "Avtentikacija",
                  location: "EU",
                  link: "https://clerk.com/privacy",
                },
                {
                  name: "Bunny.net",
                  role: "Hramba in dostava fotografij (CDN)",
                  location: "EU",
                  link: "https://bunny.net/privacy",
                },
                {
                  name: "Neon (PostgreSQL)",
                  role: "Podatkovna baza (metapodatki galerij)",
                  location: "EU",
                  link: "https://neon.tech/privacy",
                },
              ].map(({ name, role, location, link }) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-semibold text-[#0F1729]">{name}</p>
                    <p className="text-sm text-gray-600">{role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {location}
                    </span>
                    <div className="mt-1">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#C9820A] hover:underline"
                      >
                        Politika zasebnosti →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-3 text-sm">
              S vsakim od teh podizvajalcev smo sklenili pogodbo o obdelavi
              podatkov (Data Processing Agreement — DPA).
            </p>
          </Section>

          <Section title="5. Vaše pravice">
            <p className="text-gray-600 mb-4">
              Kot posameznik, na katerega se nanašajo podatki, imate naslednje
              pravice:
            </p>
            <div className="grid gap-3">
              {rights.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-gray-100 p-4 flex gap-3"
                >
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="font-semibold text-[#0F1729] text-sm">{title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="mt-5 rounded-2xl p-4"
              style={{
                background: "rgba(255,201,77,0.08)",
                border: "1px solid rgba(255,201,77,0.2)",
              }}
            >
              <p className="text-sm text-gray-700">
                <strong>Kako uveljavljate svojo pravico:</strong> Pišite nam na{" "}
                <a
                  href="mailto:hello@guestcam.si"
                  className="text-[#C9820A] hover:underline"
                >
                  hello@guestcam.si
                </a>{" "}
                z zadevo &ldquo;GDPR zahteva&rdquo;. Odgovorimo v 30 dneh. Morda
                bomo morali preveriti vašo identiteto, preden obdelamo zahtevo.
              </p>
            </div>
          </Section>

          <Section title="6. Rok hrambe">
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                <strong>Galerije in fotografije</strong> — hranjene za trajanje
                paketa. Po preteku in brez obnove izbrisano v 30 dneh.
              </li>
              <li>
                <strong>Računi brez aktivnih galerij</strong> — samodejno
                izbrisani po 2 letih neaktivnosti.
              </li>
              <li>
                <strong>Strežniški dnevniki</strong> — samodejno izbrisani po
                14 dneh.
              </li>
              <li>
                <strong>IP naslovi</strong> — shranjeni za varnostne namene,
                izbrisani po 30 dneh.
              </li>
              <li>
                <strong>Računovodski podatki</strong> — 10 let v skladu z
                zakonodajo RS.
              </li>
            </ul>
          </Section>

          <Section title="7. Pritožba">
            <p className="text-gray-600">
              Če menite, da kršimo vaše pravice glede varstva podatkov, imate
              pravico vložiti pritožbo pri nacionalnem nadzornem organu:
            </p>
            <div className="mt-3 rounded-xl border border-gray-100 p-4">
              <p className="font-semibold text-[#0F1729]">
                Informacijski pooblaščenec RS
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Dunajska cesta 22, 1000 Ljubljana
              </p>
              <p className="text-sm text-gray-600">
                <a
                  href="https://www.ip-rs.si"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C9820A] hover:underline"
                >
                  www.ip-rs.si
                </a>
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Pred vložitvijo pritožbe vas prosimo, da nas najprej kontaktirate
              — večino vprašanj rešimo hitro in prijazno.
            </p>
          </Section>

          <Section title="8. Kontakt — pooblaščena oseba za varstvo podatkov">
            <p className="text-gray-600 mb-3">
              Za vse GDPR poizvedbe pišite na:
            </p>
            <div className="bg-[#F2F4F8] rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-[#0F1729]">Sport group d.o.o.</p>
              <p className="text-sm text-gray-600 mt-1">
                E-pošta:{" "}
                <a
                  href="mailto:hello@guestcam.si"
                  className="text-[#C9820A] hover:underline"
                >
                  hello@guestcam.si
                </a>{" "}
                (zadeva: &ldquo;GDPR&rdquo;)
              </p>
              <p className="text-sm text-gray-600">ID za DDV: SI72133449</p>
              <p className="text-sm text-gray-600 mt-1">
                Odgovorimo v največ <strong>30 dneh</strong>.
              </p>
            </div>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
