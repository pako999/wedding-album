import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika zasebnosti | WeddingAlbum",
  description:
    "Politika zasebnosti storitve WeddingAlbum. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
  openGraph: {
    title: "Politika zasebnosti | WeddingAlbum",
    description:
      "Kako varujemo vaše podatke pri uporabi poročne galerije WeddingAlbum.",
    type: "website",
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
            Začni brezplačno
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-[#2C2825] text-white py-8 mt-16">
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2825] font-sans">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Title */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4738A] mb-3">
              Pravni dokument
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#2C2825] mb-3">
              Politika zasebnosti
            </h1>
            <p className="text-sm text-gray-400">
              Zadnja posodobitev: 1. januar 2025 · Sport group d.o.o.
            </p>
          </div>

          <div className="prose prose-gray max-w-none text-[#2C2825]">
            {/* Intro */}
            <p className="text-base leading-relaxed text-gray-600 mb-8">
              Sport group d.o.o. (v nadaljevanju: &ldquo;mi&rdquo;,
              &ldquo;naše&rdquo;, &ldquo;WeddingAlbum&rdquo;) spoštuje vašo
              zasebnost in varuje osebne podatke v skladu z Uredbo (EU)
              2016/679 (GDPR) ter veljavno slovensko zakonodajo. Ta politika
              opisuje, katere podatke zbiramo, kako jih uporabljamo in kakšne so
              vaše pravice.
            </p>

            {/* Section 1 */}
            <Section title="1. Upravljavec podatkov">
              <p>
                <strong>Sport group d.o.o.</strong>
                <br />
                Davčna številka: SI72133449
                <br />
                E-pošta:{" "}
                <a href="mailto:hello@wedflow.app" className="text-[#C4738A]">
                  hello@wedflow.app
                </a>
              </p>
            </Section>

            {/* Section 2 */}
            <Section title="2. Katere podatke zbiramo">
              <h3 className="font-semibold text-[#2C2825] mt-4 mb-2">
                2.1 Podatki, ki jih vnesete sami
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>
                  <strong>Ime para / organizatorja</strong> – pri ustvarjanju
                  galerije vnesete ime (npr. &ldquo;Ana in Marko&rdquo;), ki je
                  prikazano na QR kodi in v galeriji.
                </li>
                <li>
                  <strong>E-poštni naslov</strong> – za prijavo prek Clerk.com
                  (samo organizator galerije). Gosti za nalaganje fotografij ne
                  potrebujejo računa.
                </li>
                <li>
                  <strong>Datum in kraj dogodka</strong> – neobvezni podatki za
                  personalizacijo galerije.
                </li>
              </ul>

              <h3 className="font-semibold text-[#2C2825] mt-4 mb-2">
                2.2 Vsebina, ki jo naložite
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>
                  Fotografije in video posnetki, ki jih naložijo gostje ali
                  organizator.
                </li>
                <li>
                  Metapodatki datotek (datum nastanka, velikost) – shranjeni le
                  v namen prikaza in prenosa.
                </li>
              </ul>

              <h3 className="font-semibold text-[#2C2825] mt-4 mb-2">
                2.3 Tehnični podatki
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>IP naslov (za zaščito pred zlorabo storitve).</li>
                <li>
                  Vrsta brskalnika in naprave (za optimizacijo prikaza galerije).
                </li>
                <li>Piškotki Clerk.com za vzdrževano sejo (samo organizator).</li>
              </ul>
            </Section>

            {/* Section 3 */}
            <Section title="3. Namen obdelave in pravna podlaga">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="bg-[#FAF7F2]">
                    <th className="text-left p-3 font-semibold border border-gray-200">
                      Namen
                    </th>
                    <th className="text-left p-3 font-semibold border border-gray-200">
                      Pravna podlaga
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Ustvarjanje in upravljanje galerije",
                      "Izvajanje pogodbe (čl. 6(1)(b) GDPR)",
                    ],
                    [
                      "Shranjevanje fotografij in videoposnetkov",
                      "Izvajanje pogodbe (čl. 6(1)(b) GDPR)",
                    ],
                    [
                      "Pošiljanje obvestil o novih fotografijah",
                      "Legitimen interes (čl. 6(1)(f) GDPR)",
                    ],
                    [
                      "Varnost in preprečevanje zlorabe",
                      "Legitimen interes (čl. 6(1)(f) GDPR)",
                    ],
                    [
                      "Izpolnjevanje zakonskih obveznosti",
                      "Pravna obveznost (čl. 6(1)(c) GDPR)",
                    ],
                  ].map(([namen, podlaga], i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3 border border-gray-200 text-gray-600">
                        {namen}
                      </td>
                      <td className="p-3 border border-gray-200 text-gray-600">
                        {podlaga}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            {/* Section 4 */}
            <Section title="4. Kje so shranjeni vaši podatki">
              <p className="text-gray-600">
                Vse fotografije in datoteke shranjujemo prek storitve{" "}
                <strong>Bunny.net</strong> (CDN in hramba podatkov) v podatkovnih
                centrih na ozemlju EU. Uporabniški računi (avtentikacija) so
                upravljani prek storitve <strong>Clerk.com</strong>, ki podatke
                hrani v skladu z GDPR. Podatki galerije (naslovi, datumi,
                metapodatki) so shranjeni v podatkovni bazi{" "}
                <strong>Neon PostgreSQL</strong> na strežnikih v EU.
              </p>
              <p className="text-gray-600 mt-3">
                Nobeni vaši podatki niso posredovani tretjim osebam za oglaševalske
                namene ali prodani naprej.
              </p>
            </Section>

            {/* Section 5 */}
            <Section title="5. Čas hrambe podatkov">
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>
                  <strong>Fotografije in galerija</strong> – shranjene so toliko
                  časa, kolikor traja vaš paket (1 mesec, 1 leto ali 2 leti).
                  Po preteku paketa, če ga ne obnovite, galerija in vse vsebine
                  trajno izbrišemo.
                </li>
                <li>
                  <strong>Račun organizatorja</strong> – hranjen, dokler aktivno
                  vzdržujete vsaj eno galerijo ali dokler ne zahtevate izbrisa.
                  Račun brez aktivnih galerij izbrišemo po <strong>2 letih</strong>{" "}
                  neaktivnosti.
                </li>
                <li>
                  <strong>Računovodski podatki</strong> – računi in plačilni
                  podatki (brez številk kartic) hranimo 10 let v skladu z
                  zakonodajo o računovodstvu.
                </li>
              </ul>
            </Section>

            {/* Section 6 */}
            <Section title="6. Vaše pravice (GDPR)">
              <p className="text-gray-600 mb-3">
                V skladu z GDPR imate naslednje pravice:
              </p>
              <div className="space-y-3">
                {[
                  [
                    "Pravica do dostopa",
                    "Kadar koli lahko zahtevate kopijo svojih osebnih podatkov.",
                  ],
                  [
                    "Pravica do popravka",
                    "Napačne ali nepopolne podatke popravimo na vašo zahtevo.",
                  ],
                  [
                    "Pravica do izbrisa",
                    "Zahtevate lahko, da vaše podatke trajno izbrišemo, razen kjer nas k hrambi zavezuje zakon.",
                  ],
                  [
                    "Pravica do prenosljivosti",
                    "Vaše fotografije in podatke vam dostavimo v standardnem formatu (ZIP / JSON).",
                  ],
                  [
                    "Pravica do ugovora",
                    "Obdelavi na podlagi legitimnega interesa se lahko upreti kadar koli.",
                  ],
                  [
                    "Pravica do pritožbe",
                    "Pritožbo vložite pri Informacijskem pooblaščencu RS (ip-rs.si).",
                  ],
                ].map(([pravica, opis], i) => (
                  <div
                    key={i}
                    className="bg-[#FAF7F2] rounded-xl p-4 border border-gray-100"
                  >
                    <p className="font-semibold text-[#2C2825] mb-1">{pravica}</p>
                    <p className="text-sm text-gray-600">{opis}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mt-4">
                Svojo pravico uveljavljate prek e-pošte{" "}
                <a href="mailto:hello@wedflow.app" className="text-[#C4738A]">
                  hello@wedflow.app
                </a>
                . Odgovorimo v 30 dneh.
              </p>
            </Section>

            {/* Section 7 */}
            <Section title="7. Varnost podatkov">
              <p className="text-gray-600">
                Vse povezave so zaščitene s protokolom HTTPS (TLS 1.3). Dostop do
                galerij je mogoč zgolj z unikatno QR kodo oziroma URL-jem, ki ga
                delite vi. Noben javni iskalnik ne more indeksirati vsebine vaše
                galerije. Interni dostop do podatkov imajo le pooblaščeni
                zaposleni, kadar je to nujno za podporo.
              </p>
            </Section>

            {/* Section 8 */}
            <Section title="8. Piškotki">
              <p className="text-gray-600">
                Za informacije o piškotkih glejte našo{" "}
                <Link href="/cookies" className="text-[#C4738A] hover:underline">
                  Politiko piškotkov
                </Link>
                .
              </p>
            </Section>

            {/* Section 9 */}
            <Section title="9. Spremembe politike zasebnosti">
              <p className="text-gray-600">
                O bistvenih spremembah vas obvestimo prek e-pošte (organizatorje)
                ali z obvestilom v storitvi. Datum zadnje posodobitve je vedno
                naveden na vrhu tega dokumenta.
              </p>
            </Section>

            {/* Section 10 */}
            <Section title="10. Kontakt">
              <p className="text-gray-600">
                Za vse vprašanja glede zasebnosti nas kontaktirajte:
              </p>
              <div className="bg-[#FAF7F2] rounded-xl p-4 mt-3 border border-gray-100">
                <p className="font-semibold text-[#2C2825]">
                  Sport group d.o.o.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  E-pošta:{" "}
                  <a
                    href="mailto:hello@wedflow.app"
                    className="text-[#C4738A] hover:underline"
                  >
                    hello@wedflow.app
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Davčna številka: SI72133449
                </p>
              </div>
            </Section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
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
      <h2 className="text-xl font-bold text-[#2C2825] mb-3 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}
