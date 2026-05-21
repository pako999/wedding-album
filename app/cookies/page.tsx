import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Politika piškotkov | Guestcam",
  description:
    "Politika piškotkov storitve Guestcam. Izveste, katere piškotke uporabljamo in zakaj.",
  openGraph: {
    title: "Politika piškotkov | Guestcam",
    description:
      "Guestcam ne uporablja oglaševalskih piškotkov. Preberite, katere piškotke potrebujemo in zakaj.",
    type: "website",
  },
};


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
      <td className="p-3 text-sm font-mono text-[#0F1729]">{name}</td>
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
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader lang="sl" />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-3">
              Pravni dokument
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#0F1729] mb-3">
              Politika piškotkov
            </h1>
            <p className="text-sm text-gray-400">
              Zadnja posodobitev: 1. januar 2025 · Sport group d.o.o.
            </p>
          </div>

          {/* Highlight box */}
          <div
            className="rounded-2xl p-5 mb-8 flex gap-4"
            style={{ background: "rgba(255,201,77,0.08)", border: "1px solid rgba(255,201,77,0.2)" }}
          >
            <svg
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#C9820A" }}
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
              <strong>Guestcam ne uporablja oglaševalskih ali sledilnih
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
              mesto Guestcam:
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left">
                <thead className="bg-[#F2F4F8]">
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
                    provider="Guestcam"
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
                  className="text-[#C9820A] hover:underline"
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
            <div className="bg-[#F2F4F8] rounded-xl p-4 border border-gray-100">
              <p className="font-semibold text-[#0F1729]">Sport group d.o.o.</p>
              <p className="text-sm text-gray-600 mt-1">
                E-pošta:{" "}
                <a
                  href="mailto:hello@guestcam.si"
                  className="text-[#C9820A] hover:underline"
                >
                  hello@guestcam.si
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
