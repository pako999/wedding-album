import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika piškotkov | WeddingAlbum",
  description:
    "Politika piškotkov storitve WeddingAlbum. Izveste, katere piškotke uporabljamo in zakaj.",
  openGraph: {
    title: "Politika piškotkov | WeddingAlbum",
    description:
      "WeddingAlbum ne uporablja oglaševalskih piškotkov. Preberite, katere piškotke potrebujemo in zakaj.",
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

function CookieRow({
  name,
  provider,
  purpose,
  duration,
  type,
}: {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  type: string;
}) {
  const typeColor =
    type === "Nujen"
      ? "bg-green-100 text-green-700"
      : type === "Funkcionalen"
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";

  return (
    <tr className="border-b border-gray-100">
      <td className="p-3 text-sm font-mono text-[#2C2825]">{name}</td>
      <td className="p-3 text-sm text-gray-600">{provider}</td>
      <td className="p-3 text-sm text-gray-600">{purpose}</td>
      <td className="p-3 text-sm text-gray-500">{duration}</td>
      <td className="p-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor}`}
        >
          {type}
        </span>
      </td>
    </tr>
  );
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2825] font-sans">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C4738A] mb-3">
              Pravni dokument
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#2C2825] mb-3">
              Politika piškotkov
            </h1>
            <p className="text-sm text-gray-400">
              Zadnja posodobitev: 1. januar 2025 · Sport group d.o.o.
            </p>
          </div>

          {/* Highlight box */}
          <div
            className="rounded-2xl p-5 mb-8 flex gap-4"
            style={{ background: "rgba(196,115,138,0.08)", border: "1px solid rgba(196,115,138,0.2)" }}
          >
            <svg
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#C4738A" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>WeddingAlbum ne uporablja oglaševalskih ali sledilnih
              piškotkov.</strong> Nalagamo samo piškotke, ki so nujni za
              delovanje storitve in avtentikacijo. Ne delimo vaših podatkov z
              oglaševalci.
            </p>
          </div>

          <Section title="1. Kaj so piškotki?">
            <p className="text-gray-600">
              Piškotki so majhne besedilne datoteke, ki jih spletna stran shrani
              v vaš brskalnik ob obisku. Omogočajo, da si stran zapomni vaše
              nastavitve ali stanje seje (npr. da ostanete prijavljeni).
              Piškotki ne morejo izvajati programske kode in ne vsebujejo
              virusov.
            </p>
          </Section>

          <Section title="2. Piškotki, ki jih uporabljamo">
            <p className="text-gray-600 mb-4">
              Spodnja tabela prikazuje vse piškotke, ki jih nastavi spletno
              mesto WeddingAlbum:
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-[#FAF7F2]">
                  <tr>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Piškotek
                    </th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Ponudnik
                    </th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Namen
                    </th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Trajanje
                    </th>
                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Vrsta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <CookieRow
                    name="__session"
                    provider="Clerk.com"
                    purpose="Vzdržuje prijavljeno sejo organizatorja. Brez tega piškotka ni mogoče ostati prijavljen."
                    duration="Seja / 7 dni"
                    type="Nujen"
                  />
                  <CookieRow
                    name="__client_uat"
                    provider="Clerk.com"
                    purpose="Preveri veljavnost seje med brskalnikom in strežnikom (varnostni mehanizem)."
                    duration="7 dni"
                    type="Nujen"
                  />
                  <CookieRow
                    name="__clerk_db_jwt"
                    provider="Clerk.com"
                    purpose="JWT žeton za sinhronizacijo stanja med zavihki brskalnika."
                    duration="Seja"
                    type="Nujen"
                  />
                  <CookieRow
                    name="wf_lang"
                    provider="WeddingAlbum"
                    purpose="Shrani izbiro jezika galerije, da ob naslednjem obisku prikaže pravi jezik."
                    duration="1 leto"
                    type="Funkcionalen"
                  />
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Gostje, ki dostopajo do galerije samo za nalaganje fotografij in
              niso prijavljeni, prejmejo <em>le</em> funkcionalni piškotek
              (wf_lang). Clerk piškotki se nastavijo samo ob prijavi.
            </p>
          </Section>

          <Section title="3. Piškotki tretjih oseb">
            <p className="text-gray-600">
              Poleg naših lastnih piškotkov sta aktivni naslednji storitvi:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-600">
              <li>
                <strong>Clerk.com</strong> – storitev za avtentikacijo.
                Piškotki so opisani v tabeli zgoraj. Več informacij:{" "}
                <a
                  href="https://clerk.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C4738A] hover:underline"
                >
                  clerk.com/privacy
                </a>
                .
              </li>
              <li>
                <strong>Bunny.net</strong> – CDN za dostavo fotografij. Bunny.net
                ne nastavi piškotkov v vaš brskalnik pri serviranje slik.
              </li>
            </ul>
            <p className="text-gray-600 mt-3">
              Storitev <strong>ne vključuje</strong> Google Analytics, Meta
              Pixel, Hotjar ali kakršnih koli oglaševalskih orodij. Vaše
              brskanje po naši spletni strani ni sledeno za oglaševalske namene.
            </p>
          </Section>

          <Section title="4. Upravljanje in zavrnitev piškotkov">
            <p className="text-gray-600">
              Piškotke lahko kadar koli izbrišete v nastavitvah brskalnika:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600 text-sm">
              <li>
                <strong>Chrome:</strong> Nastavitve → Zasebnost in varnost →
                Piškotki in drugi podatki spletnih mest
              </li>
              <li>
                <strong>Firefox:</strong> Nastavitve → Zasebnost in varnost →
                Piškotki in podatki spletnih mest
              </li>
              <li>
                <strong>Safari:</strong> Nastavitve → Zasebnost → Upravljanje
                podatkov spletnih strani
              </li>
              <li>
                <strong>Edge:</strong> Nastavitve → Piškotki in dovoljenja za
                spletna mesta
              </li>
            </ul>
            <p className="text-gray-600 mt-3">
              Upoštevajte: zavrnitev nujnih piškotkov (Clerk) onemogoči prijavo
              in upravljanje galerije. Gostje, ki ne naložijo funkcionalnega
              piškotka, bodo ob vsakem obisku videli okno za izbiro jezika.
            </p>
          </Section>

          <Section title="5. Kontakt">
            <p className="text-gray-600 mb-3">
              Vprašanja glede piškotkov pišite na:
            </p>
            <div className="bg-[#FAF7F2] rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-[#2C2825]">Sport group d.o.o.</p>
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
      </main>

      <SiteFooter />
    </div>
  );
}
