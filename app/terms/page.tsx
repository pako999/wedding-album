import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pogoji uporabe | Guestcam",
  description:
    "Pogoji uporabe storitve Guestcam — poročna galerija s QR kodo. Preberite naše pogoje pred uporabo storitve.",
  openGraph: {
    title: "Pogoji uporabe | Guestcam",
    description:
      "Pogoji, pod katerimi vam Guestcam nudi storitev poročne galerije s QR kodo.",
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F8] text-[#0F1729] font-sans">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9820A] mb-3">
              Pravni dokument
            </p>
            <h1 className="font-serif text-4xl font-bold text-[#0F1729] mb-3">
              Pogoji uporabe
            </h1>
            <p className="text-sm text-gray-400">
              Zadnja posodobitev: 1. januar 2025 · Sport group d.o.o.
            </p>
          </div>

          <p className="text-base leading-relaxed text-gray-600 mb-8">
            Dobrodošli v storitvi Guestcam. S tem, ko ustvarite galerijo ali
            naložite fotografije, se strinjate s spodnjimi pogoji. Preberite jih
            pozorno. Storitev zagotavlja Sport group d.o.o. (SI72133449,
            v nadaljevanju &ldquo;Guestcam&rdquo;, &ldquo;mi&rdquo; ali
            &ldquo;naše&rdquo;).
          </p>

          <Section title="1. Opis storitve">
            <p className="text-gray-600">
              Guestcam je spletna platforma, ki organizatorjem porok in
              podobnih prireditev omogoča ustvarjanje zasebnih galerij, kamor
              gostje nalagajo fotografije in videoposnetke prek unikatne QR kode
              — brez obvezne registracije. Storitev vključuje:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600">
              <li>Ustvarjanje zasebne galerije z unikatno QR kodo.</li>
              <li>Shranjevanje fotografij in videoposnetkov v polni kakovosti.</li>
              <li>Prenaziranje vsebine galerije (ZIP).</li>
              <li>
                Personalizirane predloge za tisk QR kartic (odvisno od paketa).
              </li>
              <li>
                Live projekcijo galerije in obvestila za par (odvisno od paketa).
              </li>
            </ul>
          </Section>

          <Section title="2. Pogoji za uporabo">
            <p className="text-gray-600">
              Storitev smete uporabljati le, če:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-600">
              <li>
                Ste starejši od 16 let ali imate privolitev staršev/skrbnika.
              </li>
              <li>
                Naložene vsebine so legalne in ne kršijo pravic tretjih oseb.
              </li>
              <li>
                Ne poskušate zlorabiti storitve (spam, vdori, avtomatizirani
                dostop brez dovoljenja itd.).
              </li>
            </ul>
          </Section>

          <Section title="3. Lastništvo vsebine">
            <p className="text-gray-600">
              <strong>
                Vse fotografije in videoposnetke, ki jih naložite, ostanejo vaša
                last.
              </strong>{" "}
              Guestcam ne prevzema lastništva nad vsebino, ki jo naložite vi
              ali vaši gostje.
            </p>
            <p className="text-gray-600 mt-3">
              Z nalaganjem nam podelite omejeno, neizključno, brezplačno licenco
              za shranjevanje, prikaz in prenos te vsebine izključno z namenom
              zagotavljanja storitve. Licenca preneha ob izbrisu galerije ali
              vsebine.
            </p>
            <p className="text-gray-600 mt-3">
              Organizator galerije je odgovoren, da ima pravice do naložene
              vsebine ali da je pridobil ustrezna dovoljenja od gostov. Ne
              nalagajte vsebine, ki vsebuje osebe, ki se niso strinjale s
              fotografiranjem in objavo.
            </p>
          </Section>

          <Section title="4. Paketi in omejitve">
            <p className="text-gray-600 mb-3">
              Obseg storitve je odvisen od izbranega paketa:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#F2F4F8]">
                    <th className="text-left p-3 font-semibold border border-gray-200">
                      Paket
                    </th>
                    <th className="text-left p-3 font-semibold border border-gray-200">
                      Gostje
                    </th>
                    <th className="text-left p-3 font-semibold border border-gray-200">
                      Fotografije
                    </th>
                    <th className="text-left p-3 font-semibold border border-gray-200">
                      Trajanje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Basic", "do 50", "do 200", "1 mesec"],
                    ["Plus", "neomejeno", "neomejeno", "1 leto"],
                    ["Premium", "neomejeno", "neomejeno + 100 videov", "2 leti"],
                  ].map(([paket, gostje, foto, cas], i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3 border border-gray-200 font-medium">
                        {paket}
                      </td>
                      <td className="p-3 border border-gray-200 text-gray-600">
                        {gostje}
                      </td>
                      <td className="p-3 border border-gray-200 text-gray-600">
                        {foto}
                      </td>
                      <td className="p-3 border border-gray-200 text-gray-600">
                        {cas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Ob prekoračitvi meje fotografij ali gostov bomo organizatorja
              obvestili in mu ponudili nadgradnjo paketa. Vsebina ne bo
              samodejno izbrisana.
            </p>
          </Section>

          <Section title="5. Plačila in vračila">
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>
                Cene so prikazane v evrih in vključujejo DDV, kjer je
                zakonsko predpisano.
              </li>
              <li>
                Plačilo je enkratno (ni naročnina). Galerija je aktivna
                za čas izbranega paketa.
              </li>
              <li>
                Garancija vračila: 30 dni od nakupa, brez vprašanj. Zahtevo
                pošljite na{" "}
                <a
                  href="mailto:hello@guestcam.si"
                  className="text-[#C9820A] hover:underline"
                >
                  hello@guestcam.si
                </a>
                .
              </li>
            </ul>
          </Section>

          <Section title="6. Dovoljene vsebine (Acceptable Use)">
            <p className="text-gray-600 mb-3">
              Prepovedano je nalagati vsebine, ki:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>so nezakonite, žaljive, diskriminatorne ali nasilne;</li>
              <li>kršijo avtorske pravice ali pravice zasebnosti tretjih oseb;</li>
              <li>vsebujejo otroško pornografijo ali spolno zlorabo;</li>
              <li>so namenjene oglaševanju brez naše pisne privolitve;</li>
              <li>vsebujejo zlonamerno programsko kodo ali viruse.</li>
            </ul>
            <p className="text-gray-600 mt-3">
              Pridržujemo si pravico, da takšno vsebino brez predhodnega
              obvestila odstranimo in začasno ali trajno ukinemo dostop do
              računa.
            </p>
          </Section>

          <Section title="7. Razpoložljivost storitve">
            <p className="text-gray-600">
              Trudimo se zagotoviti čim višjo razpoložljivost (SLA 99,5 %),
              vendar ne jamčimo za brezhibno delovanje v primeru višje sile,
              vzdrževalnih del ali napak pri tretjih ponudnikih (Bunny.net,
              Clerk.com, Neon). O načrtovanih vzdrževalnih prekinditvah obvestimo
              organizatorje z vnaprejšnjim obvestilom.
            </p>
          </Section>

          <Section title="8. Omejitev odgovornosti">
            <p className="text-gray-600">
              Guestcam ne odgovarja za:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-gray-600">
              <li>Posredno ali posledično škodo, ki izhaja iz uporabe storitve.</li>
              <li>Izgubo podatkov, ki nastane zaradi napak pri tretjih ponudnikih.</li>
              <li>
                Vsebino, ki jo naložijo gostje in ki krši pravice tretjih oseb.
              </li>
            </ul>
            <p className="text-gray-600 mt-3">
              Skupna odgovornost Guestcam do posameznega naročnika ne more
              preseči zneska, ki ste ga plačali za storitev v zadnjih 12 mesecih.
            </p>
          </Section>

          <Section title="9. Spremembe pogodb">
            <p className="text-gray-600">
              O bistvenih spremembah pogojev vas obvestimo vsaj 30 dni vnaprej
              prek e-pošte. Nadaljnja uporaba storitve po tem roku pomeni sprejetje
              novih pogojev.
            </p>
          </Section>

          <Section title="10. Pravo in reševanje sporov">
            <p className="text-gray-600">
              Za te pogoje velja slovensko pravo. Za morebitne spore je
              pristojno sodišče v Republiki Sloveniji. Pred sodnim reševanjem
              sporov poskušamo doseči sporazumno rešitev — kontaktirajte nas na{" "}
              <a
                href="mailto:hello@guestcam.si"
                className="text-[#C9820A] hover:underline"
              >
                hello@guestcam.si
              </a>
              .
            </p>
          </Section>

          <Section title="11. Kontakt">
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
