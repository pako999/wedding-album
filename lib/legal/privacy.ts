import type { LangCode } from "@/components/LanguageSwitcher";
import type { LegalDoc } from "./types";

/** Shared GDPR legal-basis table — identical content across languages,
 *  only the column labels and row text are translated. */
const legalBasisRows: Record<LangCode, { headers: [string, string]; rows: [string, string][] }> = {
  sl: {
    headers: ["Namen", "Pravna podlaga"],
    rows: [
      ["Ustvarjanje in upravljanje galerije", "Izvajanje pogodbe (čl. 6(1)(b) GDPR)"],
      ["Shranjevanje fotografij in videoposnetkov", "Izvajanje pogodbe (čl. 6(1)(b) GDPR)"],
      ["Pošiljanje obvestil o novih fotografijah", "Legitimen interes (čl. 6(1)(f) GDPR)"],
      ["Varnost in preprečevanje zlorabe", "Legitimen interes (čl. 6(1)(f) GDPR)"],
      ["Izpolnjevanje zakonskih obveznosti", "Pravna obveznost (čl. 6(1)(c) GDPR)"],
    ],
  },
  hr: {
    headers: ["Svrha", "Pravna osnova"],
    rows: [
      ["Stvaranje i upravljanje galerijom", "Izvršavanje ugovora (čl. 6(1)(b) GDPR)"],
      ["Pohrana fotografija i videozapisa", "Izvršavanje ugovora (čl. 6(1)(b) GDPR)"],
      ["Slanje obavijesti o novim fotografijama", "Legitimni interes (čl. 6(1)(f) GDPR)"],
      ["Sigurnost i sprječavanje zlouporabe", "Legitimni interes (čl. 6(1)(f) GDPR)"],
      ["Ispunjavanje zakonskih obveza", "Pravna obveza (čl. 6(1)(c) GDPR)"],
    ],
  },
  sr: {
    headers: ["Svrha", "Pravna osnova"],
    rows: [
      ["Kreiranje i upravljanje galerijom", "Izvršenje ugovora (čl. 6(1)(b) GDPR)"],
      ["Čuvanje fotografija i video zapisa", "Izvršenje ugovora (čl. 6(1)(b) GDPR)"],
      ["Slanje obaveštenja o novim fotografijama", "Legitimni interes (čl. 6(1)(f) GDPR)"],
      ["Bezbednost i sprečavanje zloupotrebe", "Legitimni interes (čl. 6(1)(f) GDPR)"],
      ["Ispunjavanje zakonskih obaveza", "Pravna obaveza (čl. 6(1)(c) GDPR)"],
    ],
  },
  de: {
    headers: ["Zweck", "Rechtsgrundlage"],
    rows: [
      ["Erstellung und Verwaltung der Galerie", "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)"],
      ["Speicherung von Fotos und Videos", "Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)"],
      ["Benachrichtigungen über neue Fotos", "Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)"],
      ["Sicherheit und Missbrauchsschutz", "Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)"],
      ["Erfüllung gesetzlicher Pflichten", "Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO)"],
    ],
  },
  en: {
    headers: ["Purpose", "Legal basis"],
    rows: [
      ["Creating and managing the gallery", "Performance of contract (Art. 6(1)(b) GDPR)"],
      ["Storing photos and videos", "Performance of contract (Art. 6(1)(b) GDPR)"],
      ["Sending notifications about new photos", "Legitimate interest (Art. 6(1)(f) GDPR)"],
      ["Security and abuse prevention", "Legitimate interest (Art. 6(1)(f) GDPR)"],
      ["Compliance with legal obligations", "Legal obligation (Art. 6(1)(c) GDPR)"],
    ],
  },
  es: {
    headers: ["Finalidad", "Base jurídica"],
    rows: [
      ["Creación y gestión de la galería", "Ejecución del contrato (art. 6(1)(b) RGPD)"],
      ["Almacenamiento de fotos y vídeos", "Ejecución del contrato (art. 6(1)(b) RGPD)"],
      ["Notificaciones sobre nuevas fotos", "Interés legítimo (art. 6(1)(f) RGPD)"],
      ["Seguridad y prevención de abusos", "Interés legítimo (art. 6(1)(f) RGPD)"],
      ["Cumplimiento de obligaciones legales", "Obligación legal (art. 6(1)(c) RGPD)"],
    ],
  },
};

const gdprRightsCards: Record<LangCode, { title: string; desc: string }[]> = {
  sl: [
    { title: "Pravica do dostopa", desc: "Kadar koli lahko zahtevate kopijo svojih osebnih podatkov." },
    { title: "Pravica do popravka", desc: "Napačne ali nepopolne podatke popravimo na vašo zahtevo." },
    { title: "Pravica do izbrisa", desc: "Zahtevate lahko, da vaše podatke trajno izbrišemo, razen kjer nas k hrambi zavezuje zakon." },
    { title: "Pravica do prenosljivosti", desc: "Vaše fotografije in podatke vam dostavimo v standardnem formatu (ZIP / JSON)." },
    { title: "Pravica do ugovora", desc: "Obdelavi na podlagi legitimnega interesa se lahko upreti kadar koli." },
    { title: "Pravica do pritožbe", desc: "Pritožbo vložite pri Informacijskem pooblaščencu RS (ip-rs.si)." },
  ],
  hr: [
    { title: "Pravo na pristup", desc: "U svakom trenutku možete zatražiti kopiju svojih osobnih podataka." },
    { title: "Pravo na ispravak", desc: "Pogrešne ili nepotpune podatke ispravljamo na vaš zahtjev." },
    { title: "Pravo na brisanje", desc: "Možete zatražiti trajno brisanje podataka, osim kada nas zakon obvezuje na čuvanje." },
    { title: "Pravo na prenosivost", desc: "Vaše fotografije i podatke dostavljamo u standardnom formatu (ZIP / JSON)." },
    { title: "Pravo na prigovor", desc: "Obradi na temelju legitimnog interesa možete prigovoriti u svakom trenutku." },
    { title: "Pravo na pritužbu", desc: "Pritužbu možete podnijeti AZOP-u (azop.hr)." },
  ],
  sr: [
    { title: "Pravo na pristup", desc: "U svakom trenutku možete zatražiti kopiju svojih ličnih podataka." },
    { title: "Pravo na ispravku", desc: "Pogrešne ili nepotpune podatke ispravljamo na vaš zahtev." },
    { title: "Pravo na brisanje", desc: "Možete zatražiti trajno brisanje podataka, osim kada nas zakon obavezuje na čuvanje." },
    { title: "Pravo na prenosivost", desc: "Vaše fotografije i podatke dostavljamo u standardnom formatu (ZIP / JSON)." },
    { title: "Pravo na prigovor", desc: "Obradi na osnovu legitimnog interesa možete se usprotiviti u svakom trenutku." },
    { title: "Pravo na pritužbu", desc: "Pritužbu možete podneti Povereniku za informacije od javnog značaja (poverenik.rs)." },
  ],
  de: [
    { title: "Auskunftsrecht", desc: "Sie können jederzeit eine Kopie Ihrer personenbezogenen Daten anfordern." },
    { title: "Recht auf Berichtigung", desc: "Falsche oder unvollständige Daten korrigieren wir auf Ihre Anfrage hin." },
    { title: "Recht auf Löschung", desc: "Sie können die endgültige Löschung Ihrer Daten verlangen, soweit keine gesetzliche Aufbewahrungspflicht besteht." },
    { title: "Recht auf Datenübertragbarkeit", desc: "Wir stellen Ihre Fotos und Daten in einem Standardformat (ZIP / JSON) bereit." },
    { title: "Widerspruchsrecht", desc: "Der Verarbeitung auf Grundlage berechtigter Interessen können Sie jederzeit widersprechen." },
    { title: "Beschwerderecht", desc: "Sie können Beschwerde bei der zuständigen Datenschutzbehörde einlegen." },
  ],
  en: [
    { title: "Right of access", desc: "You may request a copy of your personal data at any time." },
    { title: "Right to rectification", desc: "We correct inaccurate or incomplete data on your request." },
    { title: "Right to erasure", desc: "You may request permanent deletion of your data, except where retention is legally required." },
    { title: "Right to portability", desc: "We deliver your photos and data in a standard format (ZIP / JSON)." },
    { title: "Right to object", desc: "You may object to processing based on legitimate interest at any time." },
    { title: "Right to lodge a complaint", desc: "You may complain to your national data-protection authority." },
  ],
  es: [
    { title: "Derecho de acceso", desc: "Puedes solicitar una copia de tus datos personales en cualquier momento." },
    { title: "Derecho de rectificación", desc: "Corregimos datos incorrectos o incompletos a petición tuya." },
    { title: "Derecho de supresión", desc: "Puedes solicitar la eliminación permanente de tus datos, salvo cuando la ley nos obligue a conservarlos." },
    { title: "Derecho a la portabilidad", desc: "Te entregamos tus fotos y datos en un formato estándar (ZIP / JSON)." },
    { title: "Derecho de oposición", desc: "Puedes oponerte en cualquier momento al tratamiento basado en interés legítimo." },
    { title: "Derecho a presentar reclamación", desc: "Puedes presentar reclamación ante la AEPD (aepd.es)." },
  ],
};

export const privacyDoc: Record<LangCode, LegalDoc> = {
  sl: {
    heading: "Politika zasebnosti",
    eyebrow: "Pravni dokument",
    lastUpdated: "Datum ucinkovitosti: 19. junij 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. si prizadeva za odlicno storitev za stranke. Del nase zaveze je odgovorno upravljanje osebnih podatkov, zbranih prek spletnega mesta guestcam.si. Nasi primarni cilji pri obdelavi teh informacij so: izboljsanje uporabniske izkusnje, zagotavljanje pravocasne podpore, izboljsanje izdelkov in storitev ter izvajanje potrebnih poslovnih operacij.",
    sections: [
      {
        title: "1. Uvod in informacije o organizaciji",
        blocks: [
          { type: "p", text: "Sport group d.o.o. si prizadeva za odlicno storitev za stranke. Del nase zaveze je odgovorno upravljanje osebnih podatkov, zbranih prek spletnega mesta guestcam.si. Nasi primarni cilji pri obdelavi teh informacij vkljucujejo:" },
          { type: "ul", items: [
            "Izboljsanje uporabniske izkusnje na nasi platformi",
            "Zagotavljanje pravocasne podpore in odgovarjanje na povprasevanja ali zahteve za storitve",
            "Izboljsanje nasih izdelkov in storitev",
            "Izvajanje potrebnih poslovnih operacij (racunovodstvo, upravljanje racunov)",
          ] },
          { type: "p", text: "Nimamo imenovanega pooblascenca za varstvo podatkov (DPO), vendar ostajamo popolnoma zavezani resevanju vasih pomislekov glede zasebnosti." },
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-posta: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
      {
        title: "2. Obseg in uporaba",
        blocks: [
          { type: "p", text: "Ta politika sciti osebne podatke vseh deležnikov: obiskovalcev spletnega mesta, registriranih uporabnikov in strank, ki uporabljajo guestcam.si." },
        ],
      },
      {
        title: "3. Shranjevanje in zascita podatkov",
        blocks: [
          { type: "p", text: "Osebni podatki so shranjeni na varnih strežnikih, ki se nahajajo v: SI, DE. Sodelujemo z uglednimi ponudniki gostovanja podatkov, ki so zavezani k uporabi najsodobnejsih varnostnih ukrepov." },
          { type: "p", text: "Nasi partnerji za gostovanje podatkov so zavezani k visoki ravni tehnicnih in organizacijskih varnostnih ukrepov, ki zagotavljajo zascito vasih osebnih podatkov pred nepooblascenim dostopom, izgubo ali unicevanjem." },
        ],
      },
      {
        title: "4. Deljenje podatkov in pogodbeni obdelovalci",
        blocks: [
          { type: "p", text: "Vase osebne podatke lahko delimo z naslednjimi ponudniki storitev tretjih oseb:" },
          { type: "h3", text: "Google Tag Manager" },
          { type: "ul", items: [
            "Ponudnik: Google Ireland Limited",
            "Namen: Upravljanje oznak, zbrani podatki o sprožanju oznak",
            "Politika zasebnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Ads" },
          { type: "ul", items: [
            "Ponudnik: Google Ireland Limited",
            "Namen: Prilagajanje uporabniske izkusnje, analitika, trzenje in oglaševanje",
            "Zbrani podatki: E-posta/telefon, ID naprave, IP naslov, prstni odtis brskalnika, lokacija, dnevniki interakcij, nacin placila",
            "Politika zasebnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Analytics" },
          { type: "ul", items: [
            "Ponudnik: Google Ireland Limited",
            "Namen: Trzenje, analitika",
            "Zbrani podatki: Ime, datum rojstva, nacionalna ID, e-posta/telefon, naslov, ID naprave, IP, OS, prstni odtis brskalnika, lokacija, zgodovina brskanja, dnevniki interakcij, zgodovina nakupov",
            "Politika zasebnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Meta" },
          { type: "ul", items: [
            "Ponudnik: Meta Platforms Ireland Ltd.",
            "Namen: Prilagajanje UX, analitika, trzenje",
            "Zbrani podatki: Ime, datum rojstva, e-posta/telefon, naslov, podatki o placilu, ID naprave, IP, informacije o brskalniku, OS, prstni odtis brskalnika, lokacija, dnevniki interakcij, zgodovina brskanja",
            "Politika zasebnosti: https://www.facebook.com/privacy/explanation",
          ] },
        ],
      },
      {
        title: "5. Sporazumi o obdelavi podatkov",
        blocks: [
          { type: "p", text: "Sporazumi o obdelavi podatkov (DPA) zagotavljajo, da tretje osebe uvedejo ustrezne tehnicne in organizacijske ukrepe v skladu z GDPR." },
        ],
      },
      {
        title: "6. Vase pravice (GDPR)",
        blocks: [
          { type: "cards", items: gdprRightsCards.sl },
          { type: "p", text: "Za uveljavljanje vasih pravic nas kontaktirajte na info@guestcam.si ali +386 71604980. Odgovorimo v zakonsko dolocenem roku." },
        ],
      },
      {
        title: "7. Piskotki in tehnologije sledenja",
        blocks: [
          { type: "p", text: "Ob vasem prvem obisku se prikaže pasica za soglasje k piskotkom. Uporabljamo naslednje vrste piskotkov:" },
          { type: "ul", items: [
            "Nujni piskotki",
            "Piskotki za zmogljivost/analitiko",
            "Funkcionalni piskotki",
            "Oglaševalski/ciljni piskotki",
          ] },
          { type: "link", text: "Vec podrobnosti o piskotkih", href: "/cookies" },
        ],
      },
      {
        title: "8. Mednarodni prenosi podatkov",
        blocks: [
          { type: "p", text: "Vase osebne podatke lahko prenesemo na lokacije izven vase države. Vsi prenosi so v skladu z GDPR." },
        ],
      },
      {
        title: "9. Obvestilo o krsitvi podatkov",
        blocks: [
          { type: "ul", items: [
            "Zaznavanje prek internega nadzora",
            "Ce je potrebno, obvestimo regulatorne organe v 30 dneh",
            "Prizadete posameznike obvestimo v 30 dneh",
          ] },
        ],
      },
      {
        title: "10. Posodobitve politike",
        blocks: [
          { type: "p", text: "O spremembah vas obvestimo prek e-posta ali obvestil na spletnem mestu. Nadaljnja uporaba po spremembah pomeni sprejetje novih pogojev." },
        ],
      },
      {
        title: "11. Kontakt",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-posta: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
    ],
  },
  hr: {
    heading: "Politika privatnosti",
    eyebrow: "Pravni dokument",
    lastUpdated: "Datum stupanja na snagu: 19. lipnja 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. posvecan je pružanju izvrsne usluge nasim klijentima. Dio nase predanosti ukljucuje odgovorno upravljanje osobnim podacima prikupljenim putem naseg web mjesta guestcam.si. Nasi primarni ciljevi u obradi ovih informacija ukljucuju: poboljsanje korisnickog iskustva, pružanje pravovremene podrske, poboljsanje proizvoda i usluga te provodenje nužnih poslovnih operacija.",
    sections: [
      {
        title: "1. Uvod i informacije o organizaciji",
        blocks: [
          { type: "p", text: "Sport group d.o.o. posvecan je pružanju izvrsne usluge nasim klijentima. Dio nase predanosti ukljucuje odgovorno upravljanje osobnim podacima prikupljenim putem naseg web mjesta guestcam.si. Nasi primarni ciljevi u obradi ovih informacija ukljucuju:" },
          { type: "ul", items: [
            "Poboljsanje korisnickog iskustva na nasoj platformi",
            "Pružanje pravovremene podrske i odgovaranje na upite ili zahtjeve za uslugama",
            "Poboljsanje nasih proizvoda i usluga",
            "Provodenje nužnih poslovnih operacija (naplata, upravljanje racunima)",
          ] },
          { type: "p", text: "Nemamo imenovanog službenika za zastitu podataka (DPO), ali ostajemo potpuno predani rjesavanju vasih briga o privatnosti." },
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-posta: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
      {
        title: "2. Opseg i primjena",
        blocks: [
          { type: "p", text: "Ova politika stiti osobne podatke svih dionika: posjetitelja web mjesta, registriranih korisnika i klijenata koji koriste guestcam.si." },
        ],
      },
      {
        title: "3. Pohrana i zastita podataka",
        blocks: [
          { type: "p", text: "Osobni podaci pohranjeni su na sigurnim poslužiteljima koji se nalaze u: SI, DE. Suradujemo s uglednim pružateljima usluga pohrane podataka koji su predani korištenju najsuvremenijih sigurnosnih mjera." },
          { type: "p", text: "Nasi partneri za pohrane podataka obvezani su na visoku razinu tehnickih i organizacijskih sigurnosnih mjera kako bi osigurali zastitu vasih osobnih podataka od neovlastenog pristupa, gubitka ili unistavanja." },
        ],
      },
      {
        title: "4. Dijeljenje podataka i trecestrani obradivaci",
        blocks: [
          { type: "p", text: "Vase osobne podatke možemo dijeliti s navedenim pružateljima usluga trecih strana:" },
          { type: "h3", text: "Google Tag Manager" },
          { type: "ul", items: [
            "Pružatelj: Google Ireland Limited",
            "Svrha: Upravljanje oznakama, agregirani podaci o aktiviranju oznaka",
            "Politika privatnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Ads" },
          { type: "ul", items: [
            "Pružatelj: Google Ireland Limited",
            "Svrha: Prilagodba korisnickog iskustva, analitika, marketing i oglasavanje",
            "Prikupljeni podaci: E-posta/telefon, ID uredaja, IP adresa, otisak prsta preglednika, lokacija, zapisnici interakcija, nacin placanja",
            "Politika privatnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Analytics" },
          { type: "ul", items: [
            "Pružatelj: Google Ireland Limited",
            "Svrha: Marketing, analitika",
            "Prikupljeni podaci: Ime, datum rodenja, nacionalni ID, e-posta/telefon, adresa, ID uredaja, IP, OS, otisak prsta preglednika, lokacija, povijest pregledavanja, zapisnici interakcija, povijest kupnje",
            "Politika privatnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Meta" },
          { type: "ul", items: [
            "Pružatelj: Meta Platforms Ireland Ltd.",
            "Svrha: Prilagodba UX-a, analitika, marketing",
            "Prikupljeni podaci: Ime, datum rodenja, e-posta/telefon, adresa, podaci o placanju, ID uredaja, IP, informacije o pregledniku, OS, otisak prsta preglednika, lokacija, zapisnici interakcija, povijest pregledavanja",
            "Politika privatnosti: https://www.facebook.com/privacy/explanation",
          ] },
        ],
      },
      {
        title: "5. Ugovori o obradi podataka",
        blocks: [
          { type: "p", text: "Ugovori o obradi podataka (DPA) osiguravaju da trece strane provode odgovarajuce tehnicke i organizacijske mjere sukladno GDPR-u." },
        ],
      },
      {
        title: "6. Vasa prava (GDPR)",
        blocks: [
          { type: "cards", items: gdprRightsCards.hr },
          { type: "p", text: "Za ostvarivanje vasih prava kontaktirajte nas na info@guestcam.si ili +386 71604980. Odgovaramo u zakonski propisanom roku." },
        ],
      },
      {
        title: "7. Kolacici i tehnologije pracenja",
        blocks: [
          { type: "p", text: "Pri vasem prvom posjetu prikazuje se natpis za privolu za kolacice. Koristimo sljedece vrste kolacica:" },
          { type: "ul", items: [
            "Nužni kolacici",
            "Kolacici za izvedbu/analitiku",
            "Funkcionalni kolacici",
            "Oglasivacki/ciljani kolacici",
          ] },
          { type: "link", text: "Vise pojedinosti o kolacicima", href: "/cookies" },
        ],
      },
      {
        title: "8. Medunarodna prijevoz podataka",
        blocks: [
          { type: "p", text: "Vase osobne podatke možemo prenijeti na lokacije izvan vase države. Svi prijenosi su u skladu s GDPR-om." },
        ],
      },
      {
        title: "9. Obavijest o povredi podataka",
        blocks: [
          { type: "ul", items: [
            "Otkrivanje putem internog nadzora",
            "Ako je potrebno, obavjestavamo regulatorna tijela u roku od 30 dana",
            "Pogodjene pojedince obavjestavamo u roku od 30 dana",
          ] },
        ],
      },
      {
        title: "10. Azuriranja politike",
        blocks: [
          { type: "p", text: "Obavjestavamo vas putem e-poste ili obavijesti na web mjestu. Nastavak koristenja nakon promjena znaci prihvacanje novih uvjeta." },
        ],
      },
      {
        title: "11. Kontakt",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-posta: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
    ],
  },
  sr: {
    heading: "Politika privatnosti",
    eyebrow: "Pravni dokument",
    lastUpdated: "Datum stupanja na snagu: 19. jun 2026. · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. posvecan je pruzanju izvrsne usluge nasim klijentima. Deo nase posvecnosti ukljucuje odgovorno upravljanje licnim podacima prikupljenim putem naseg web sajta guestcam.si. Nasi primarni ciljevi u obradi ovih informacija ukljucuju: poboljsanje korisnickog iskustva, pruzanje pravovremene podrske, poboljsanje proizvoda i usluga te obavljanje neophodnih poslovnih operacija.",
    sections: [
      {
        title: "1. Uvod i informacije o organizaciji",
        blocks: [
          { type: "p", text: "Sport group d.o.o. posvecan je pruzanju izvrsne usluge nasim klijentima. Deo nase posvecnosti ukljucuje odgovorno upravljanje licnim podacima prikupljenim putem naseg web sajta guestcam.si. Nasi primarni ciljevi u obradi ovih informacija ukljucuju:" },
          { type: "ul", items: [
            "Poboljsanje korisnickog iskustva na nasoj platformi",
            "Pruzanje pravovremene podrske i odgovaranje na upite ili zahteve za uslugama",
            "Poboljsanje nasih proizvoda i usluga",
            "Obavljanje neophodnih poslovnih operacija (naplata, upravljanje nalozima)",
          ] },
          { type: "p", text: "Nemamo imenovanog sluzbenika za zastitu podataka (DPO), ali ostajemo potpuno posvecenicni resavanju vasih briga o privatnosti." },
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-posta: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
      {
        title: "2. Obuhvat i primena",
        blocks: [
          { type: "p", text: "Ova politika stiti licne podatke svih zainteresovanih strana: posetilaca web sajta, registrovanih korisnika i klijenata koji koriste guestcam.si." },
        ],
      },
      {
        title: "3. Cuvanje i zastita podataka",
        blocks: [
          { type: "p", text: "Licni podaci se cuvaju na sigurnim serverima koji se nalaze u: SI, DE. Saradsujemo sa uglednim pružaocima usluga hostinga podataka koji su posveceni koriscenju najsavremenijih bezbednosnih mera." },
          { type: "p", text: "Nasi partneri za hosting podataka obavezani su na visok nivo tehnickih i organizacionih bezbednosnih mera kako bi osigurali zastitu vasih licnih podataka od neovlascenog pristupa, gubitka ili unistavanja." },
        ],
      },
      {
        title: "4. Deljenje podataka i obradivaci trecih strana",
        blocks: [
          { type: "p", text: "Vase licne podatke mozemo deliti sa sledecim pružaocima usluga trecih strana:" },
          { type: "h3", text: "Google Tag Manager" },
          { type: "ul", items: [
            "Pružalac: Google Ireland Limited",
            "Svrha: Upravljanje oznakama, agregirani podaci o aktiviranju oznaka",
            "Politika privatnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Ads" },
          { type: "ul", items: [
            "Pružalac: Google Ireland Limited",
            "Svrha: Prilagodavanje korisnickog iskustva, analitika, marketing i oglasavanje",
            "Prikupljeni podaci: E-posta/telefon, ID uredaja, IP adresa, otisak prsta pregledaca, lokacija, zapisi interakcija, nacin placanja",
            "Politika privatnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Analytics" },
          { type: "ul", items: [
            "Pružalac: Google Ireland Limited",
            "Svrha: Marketing, analitika",
            "Prikupljeni podaci: Ime, datum rodenja, nacionalni ID, e-posta/telefon, adresa, ID uredaja, IP, OS, otisak prsta pregledaca, lokacija, istorija pregledanja, zapisi interakcija, istorija kupovine",
            "Politika privatnosti: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Meta" },
          { type: "ul", items: [
            "Pružalac: Meta Platforms Ireland Ltd.",
            "Svrha: Prilagodavanje UX-a, analitika, marketing",
            "Prikupljeni podaci: Ime, datum rodenja, e-posta/telefon, adresa, podaci o placanju, ID uredaja, IP, informacije o pregledacu, OS, otisak prsta pregledaca, lokacija, zapisi interakcija, istorija pregledanja",
            "Politika privatnosti: https://www.facebook.com/privacy/explanation",
          ] },
        ],
      },
      {
        title: "5. Ugovori o obradi podataka",
        blocks: [
          { type: "p", text: "Ugovori o obradi podataka (DPA) osiguravaju da trece strane primene odgovarajuce tehnicke i organizacione mere u skladu sa GDPR-om." },
        ],
      },
      {
        title: "6. Vasa prava (GDPR)",
        blocks: [
          { type: "cards", items: gdprRightsCards.sr },
          { type: "p", text: "Za ostvarivanje vasih prava kontaktirajte nas na info@guestcam.si ili +386 71604980. Odgovaramo u zakonski propisanom roku." },
        ],
      },
      {
        title: "7. Kolacici i tehnologije pracenja",
        blocks: [
          { type: "p", text: "Pri vasoj prvoj poseti prikazuje se baner za pristanak na kolacice. Koristimo sledece vrste kolacica:" },
          { type: "ul", items: [
            "Neophodni kolacici",
            "Kolacici za performanse/analitiku",
            "Funkcionalni kolacici",
            "Oglasivacki/ciljani kolacici",
          ] },
          { type: "link", text: "Vise detalja o kolacicima", href: "/cookies" },
        ],
      },
      {
        title: "8. Medunarodni prenosi podataka",
        blocks: [
          { type: "p", text: "Vase licne podatke mozemo preneti na lokacije van vase drzave. Svi prenosi su u skladu sa GDPR-om." },
        ],
      },
      {
        title: "9. Obavestenje o povredi podataka",
        blocks: [
          { type: "ul", items: [
            "Otkrivanje putem internog nadzora",
            "Ako je potrebno, obavestavamo regulatorna tela u roku od 30 dana",
            "Pogodjene pojedince obavestavamo u roku od 30 dana",
          ] },
        ],
      },
      {
        title: "10. Azuriranja politike",
        blocks: [
          { type: "p", text: "Obavestavamo vas putem e-poste ili obavestenja na web sajtu. Nastavak koristenja nakon izmena znaci prihvatanje novih uslova." },
        ],
      },
      {
        title: "11. Kontakt",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-posta: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
    ],
  },
  de: {
    heading: "Datenschutzerklärung",
    eyebrow: "Rechtsdokument",
    lastUpdated: "Datum des Inkrafttretens: 19. Juni 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. ist bestrebt, unseren Kunden einen hervorragenden Service zu bieten. Teil unseres Engagements ist der verantwortungsvolle Umgang mit personenbezogenen Daten, die über unsere Website guestcam.si erhoben werden. Unsere primären Ziele bei der Verarbeitung dieser Informationen umfassen: Verbesserung der Benutzererfahrung, zeitnahe Unterstützung, Verbesserung unserer Produkte und Dienste sowie die Durchführung notwendiger Geschäftsvorgänge.",
    sections: [
      {
        title: "1. Einleitung und Organisationsangaben",
        blocks: [
          { type: "p", text: "Sport group d.o.o. ist bestrebt, unseren Kunden einen hervorragenden Service zu bieten. Teil unseres Engagements ist der verantwortungsvolle Umgang mit personenbezogenen Daten, die über unsere Website guestcam.si erhoben werden. Unsere primären Ziele bei der Verarbeitung dieser Informationen umfassen:" },
          { type: "ul", items: [
            "Verbesserung der Benutzererfahrung auf unserer Plattform",
            "Bereitstellung zeitnaher Unterstützung und Beantwortung von Anfragen oder Serviceanfragen",
            "Verbesserung unserer Produkte und Dienste",
            "Durchführung notwendiger Geschäftsvorgänge (Abrechnung, Kontoverwaltung)",
          ] },
          { type: "p", text: "Wir haben keinen benannten Datenschutzbeauftragten (DSB), bleiben aber vollständig verpflichtet, Ihre Datenschutzanliegen zu behandeln." },
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-Mail: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
      {
        title: "2. Geltungsbereich und Anwendung",
        blocks: [
          { type: "p", text: "Diese Richtlinie schützt personenbezogene Daten aller Beteiligten: Website-Besucher, registrierte Benutzer und Kunden, die guestcam.si nutzen." },
        ],
      },
      {
        title: "3. Datenspeicherung und -schutz",
        blocks: [
          { type: "p", text: "Personenbezogene Daten werden auf sicheren Servern in folgenden Ländern gespeichert: SI, DE. Wir arbeiten mit renommierten Daten-Hosting-Anbietern zusammen, die sich dem Einsatz modernster Sicherheitsmaßnahmen verpflichtet haben." },
          { type: "p", text: "Unsere Daten-Hosting-Partner sind zu einem hohen Niveau an technischen und organisatorischen Sicherheitsmaßnahmen verpflichtet, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Verlust oder Zerstörung zu schützen." },
        ],
      },
      {
        title: "4. Datenweitergabe und Auftragsverarbeiter",
        blocks: [
          { type: "p", text: "Wir können Ihre personenbezogenen Daten mit den folgenden Drittanbieter-Dienstleistern teilen:" },
          { type: "h3", text: "Google Tag Manager" },
          { type: "ul", items: [
            "Anbieter: Google Ireland Limited",
            "Zweck: Tag-Verwaltung, aggregierte Daten über Tag-Auslösungen",
            "Datenschutzerklärung: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Ads" },
          { type: "ul", items: [
            "Anbieter: Google Ireland Limited",
            "Zweck: Anpassung der Benutzererfahrung, Analyse, Marketing und Werbung",
            "Erhobene Daten: E-Mail/Telefon, Geräte-ID, IP-Adresse, Browser-Fingerprint, Standort, Interaktionsprotokolle, Zahlungsmethode",
            "Datenschutzerklärung: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Analytics" },
          { type: "ul", items: [
            "Anbieter: Google Ireland Limited",
            "Zweck: Marketing, Analyse",
            "Erhobene Daten: Name, Geburtsdatum, nationale ID, E-Mail/Telefon, Adresse, Geräte-ID, IP, Betriebssystem, Browser-Fingerprint, Standort, Browserverlauf, Interaktionsprotokolle, Kaufhistorie",
            "Datenschutzerklärung: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Meta" },
          { type: "ul", items: [
            "Anbieter: Meta Platforms Ireland Ltd.",
            "Zweck: UX-Anpassung, Analyse, Marketing",
            "Erhobene Daten: Name, Geburtsdatum, E-Mail/Telefon, Adresse, Zahlungsinformationen, Geräte-ID, IP, Browser-Informationen, Betriebssystem, Browser-Fingerprint, Standort, Interaktionsprotokolle, Browserverlauf",
            "Datenschutzerklärung: https://www.facebook.com/privacy/explanation",
          ] },
        ],
      },
      {
        title: "5. Datenverarbeitungsverträge",
        blocks: [
          { type: "p", text: "Datenverarbeitungsverträge (DVV) stellen sicher, dass Dritte angemessene technische und organisatorische Maßnahmen gemäß DSGVO implementieren." },
        ],
      },
      {
        title: "6. Ihre Rechte (DSGVO)",
        blocks: [
          { type: "cards", items: gdprRightsCards.de },
          { type: "p", text: "Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter info@guestcam.si oder +386 71604980. Wir antworten innerhalb der gesetzlich vorgeschriebenen Frist." },
        ],
      },
      {
        title: "7. Cookies und Tracking-Technologien",
        blocks: [
          { type: "p", text: "Bei Ihrem ersten Besuch wird ein Cookie-Zustimmungsbanner angezeigt. Wir verwenden folgende Cookie-Arten:" },
          { type: "ul", items: [
            "Notwendige Cookies",
            "Performance-/Analyse-Cookies",
            "Funktionale Cookies",
            "Werbe-/Targeting-Cookies",
          ] },
          { type: "link", text: "Weitere Details zu Cookies", href: "/cookies" },
        ],
      },
      {
        title: "8. Internationale Datenübertragungen",
        blocks: [
          { type: "p", text: "Wir können Ihre personenbezogenen Daten an Standorte außerhalb Ihres Landes übertragen. Alle Übertragungen erfolgen in Übereinstimmung mit der DSGVO." },
        ],
      },
      {
        title: "9. Benachrichtigung bei Datenpannen",
        blocks: [
          { type: "ul", items: [
            "Erkennung durch internes Monitoring",
            "Falls erforderlich, benachrichtigen wir die Aufsichtsbehörden innerhalb von 30 Tagen",
            "Betroffene Personen werden innerhalb von 30 Tagen benachrichtigt",
          ] },
        ],
      },
      {
        title: "10. Aktualisierungen der Richtlinie",
        blocks: [
          { type: "p", text: "Wir benachrichtigen Sie per E-Mail oder über Website-Benachrichtigungen. Die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung." },
        ],
      },
      {
        title: "11. Kontakt",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-Mail: info@guestcam.si", "Telefon: +386 71604980"] },
        ],
      },
    ],
  },
  en: {
    heading: "Privacy Policy",
    eyebrow: "Legal document",
    lastUpdated: "Effective date: 19 June 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. is dedicated to serving our customers. Part of our commitment involves the responsible management of personal information collected through our website guestcam.si. Our primary goals in processing this information include: enhancing the user experience, providing timely support, improving our products and services, and conducting necessary business operations.",
    sections: [
      {
        title: "1. Introduction and organizational info",
        blocks: [
          { type: "p", text: "Sport group d.o.o. is dedicated to serving our customers. Part of our commitment involves the responsible management of personal information collected through our website guestcam.si. Our primary goals in processing this information include:" },
          { type: "ul", items: [
            "Enhancing the user experience on our platform",
            "Providing timely support and responding to inquiries or service requests",
            "Improving our products and services",
            "Conducting necessary business operations (billing, account management)",
          ] },
          { type: "p", text: "We do not have a designated Data Protection Officer (DPO) but remain fully committed to addressing your privacy concerns." },
          { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "Phone: +386 71604980"] },
        ],
      },
      {
        title: "2. Scope and application",
        blocks: [
          { type: "p", text: "This policy protects personal information of all stakeholders: website visitors, registered users, and customers using guestcam.si." },
        ],
      },
      {
        title: "3. Data storage and protection",
        blocks: [
          { type: "p", text: "Personal information is stored in secure servers located in: SI, DE. We partner with reputable data hosting providers committed to using state-of-the-art security measures." },
          { type: "p", text: "Our data hosting partners are committed to a high level of technical and organisational security measures to protect your personal information from unauthorised access, loss or destruction." },
        ],
      },
      {
        title: "4. Data sharing and third-party processors",
        blocks: [
          { type: "p", text: "We may share your personal information with the following third-party service providers:" },
          { type: "h3", text: "Google Tag Manager" },
          { type: "ul", items: [
            "Provider: Google Ireland Limited",
            "Purpose: Tag management, aggregated data about tag firing",
            "Privacy policy: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Ads" },
          { type: "ul", items: [
            "Provider: Google Ireland Limited",
            "Purpose: Customizing user experience, analytics, marketing and advertising",
            "Data collected: Email/Phone, Device ID, IP address, Browser fingerprint, Location, Interaction logs, Payment method",
            "Privacy policy: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Analytics" },
          { type: "ul", items: [
            "Provider: Google Ireland Limited",
            "Purpose: Marketing, analytics",
            "Data collected: Name, DOB, National ID, Email/Phone, Address, Device ID, IP, OS, Browser fingerprint, Location, Browsing history, Interaction logs, Purchase history",
            "Privacy policy: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Meta" },
          { type: "ul", items: [
            "Provider: Meta Platforms Ireland Ltd.",
            "Purpose: UX customization, analytics, marketing",
            "Data collected: Name, DOB, Email/Phone, Address, Payment info, Device ID, IP, Browser info, OS, Browser fingerprint, Location, Interaction logs, Browsing history",
            "Privacy policy: https://www.facebook.com/privacy/explanation",
          ] },
        ],
      },
      {
        title: "5. Data Processing Agreements",
        blocks: [
          { type: "p", text: "Data Processing Agreements (DPAs) ensure third parties implement adequate technical and organisational measures per GDPR." },
        ],
      },
      {
        title: "6. Your rights (GDPR)",
        blocks: [
          { type: "cards", items: gdprRightsCards.en },
          { type: "p", text: "Contact us at info@guestcam.si or +386 71604980 to exercise your rights. We respond within the legally required timeframe." },
        ],
      },
      {
        title: "7. Cookies and tracking technologies",
        blocks: [
          { type: "p", text: "A cookie consent banner is displayed on your first visit. We use the following types of cookies:" },
          { type: "ul", items: [
            "Essential cookies",
            "Performance/analytics cookies",
            "Functional cookies",
            "Advertising/targeting cookies",
          ] },
          { type: "link", text: "More details on cookies", href: "/cookies" },
        ],
      },
      {
        title: "8. International data transfers",
        blocks: [
          { type: "p", text: "We may transfer personal information to locations outside your country. All transfers comply with GDPR." },
        ],
      },
      {
        title: "9. Data breach notification",
        blocks: [
          { type: "ul", items: [
            "Detection via internal monitoring",
            "If required, we notify regulatory authorities within 30 days",
            "Affected individuals are notified within 30 days",
          ] },
        ],
      },
      {
        title: "10. Policy updates",
        blocks: [
          { type: "p", text: "We notify you via email or website notifications. Continued use after changes constitutes acceptance." },
        ],
      },
      {
        title: "11. Contact",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "Phone: +386 71604980"] },
        ],
      },
    ],
  },
  es: {
    heading: "Política de privacidad",
    eyebrow: "Documento legal",
    lastUpdated: "Fecha de entrada en vigor: 19 de junio de 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. se dedica a servir a nuestros clientes. Parte de nuestro compromiso implica la gestión responsable de la información personal recopilada a través de nuestro sitio web guestcam.si. Nuestros objetivos principales en el procesamiento de esta información incluyen: mejorar la experiencia del usuario, brindar soporte oportuno, mejorar nuestros productos y servicios y llevar a cabo las operaciones comerciales necesarias.",
    sections: [
      {
        title: "1. Introducción e información organizativa",
        blocks: [
          { type: "p", text: "Sport group d.o.o. se dedica a servir a nuestros clientes. Parte de nuestro compromiso implica la gestión responsable de la información personal recopilada a través de nuestro sitio web guestcam.si. Nuestros objetivos principales en el procesamiento de esta información incluyen:" },
          { type: "ul", items: [
            "Mejorar la experiencia del usuario en nuestra plataforma",
            "Brindar soporte oportuno y responder a consultas o solicitudes de servicio",
            "Mejorar nuestros productos y servicios",
            "Llevar a cabo las operaciones comerciales necesarias (facturación, gestión de cuentas)",
          ] },
          { type: "p", text: "No contamos con un Delegado de Protección de Datos (DPD) designado, pero seguimos completamente comprometidos a abordar sus inquietudes de privacidad." },
          { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "Teléfono: +386 71604980"] },
        ],
      },
      {
        title: "2. Ámbito y aplicación",
        blocks: [
          { type: "p", text: "Esta política protege la información personal de todas las partes interesadas: visitantes del sitio web, usuarios registrados y clientes que utilizan guestcam.si." },
        ],
      },
      {
        title: "3. Almacenamiento y protección de datos",
        blocks: [
          { type: "p", text: "La información personal se almacena en servidores seguros ubicados en: SI, DE. Colaboramos con proveedores de alojamiento de datos de reconocido prestigio comprometidos con el uso de las medidas de seguridad más avanzadas." },
          { type: "p", text: "Nuestros socios de alojamiento de datos se comprometen a un alto nivel de medidas de seguridad técnicas y organizativas para proteger su información personal de accesos no autorizados, pérdidas o destrucción." },
        ],
      },
      {
        title: "4. Intercambio de datos y procesadores terceros",
        blocks: [
          { type: "p", text: "Podemos compartir su información personal con los siguientes proveedores de servicios terceros:" },
          { type: "h3", text: "Google Tag Manager" },
          { type: "ul", items: [
            "Proveedor: Google Ireland Limited",
            "Finalidad: Gestión de etiquetas, datos agregados sobre la activación de etiquetas",
            "Política de privacidad: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Ads" },
          { type: "ul", items: [
            "Proveedor: Google Ireland Limited",
            "Finalidad: Personalización de la experiencia del usuario, análisis, marketing y publicidad",
            "Datos recopilados: Email/teléfono, ID del dispositivo, dirección IP, huella digital del navegador, ubicación, registros de interacción, método de pago",
            "Política de privacidad: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Google Analytics" },
          { type: "ul", items: [
            "Proveedor: Google Ireland Limited",
            "Finalidad: Marketing, análisis",
            "Datos recopilados: Nombre, fecha de nacimiento, ID nacional, email/teléfono, dirección, ID del dispositivo, IP, sistema operativo, huella digital del navegador, ubicación, historial de navegación, registros de interacción, historial de compras",
            "Política de privacidad: https://business.safety.google/privacy/",
          ] },
          { type: "h3", text: "Meta" },
          { type: "ul", items: [
            "Proveedor: Meta Platforms Ireland Ltd.",
            "Finalidad: Personalización de UX, análisis, marketing",
            "Datos recopilados: Nombre, fecha de nacimiento, email/teléfono, dirección, información de pago, ID del dispositivo, IP, información del navegador, sistema operativo, huella digital del navegador, ubicación, registros de interacción, historial de navegación",
            "Política de privacidad: https://www.facebook.com/privacy/explanation",
          ] },
        ],
      },
      {
        title: "5. Acuerdos de procesamiento de datos",
        blocks: [
          { type: "p", text: "Los Acuerdos de Procesamiento de Datos (APD) garantizan que los terceros implementen las medidas técnicas y organizativas adecuadas conforme al RGPD." },
        ],
      },
      {
        title: "6. Sus derechos (RGPD)",
        blocks: [
          { type: "cards", items: gdprRightsCards.es },
          { type: "p", text: "Contáctenos en info@guestcam.si o +386 71604980 para ejercer sus derechos. Respondemos dentro del plazo legalmente requerido." },
        ],
      },
      {
        title: "7. Cookies y tecnologías de seguimiento",
        blocks: [
          { type: "p", text: "Se muestra un banner de consentimiento de cookies en su primera visita. Utilizamos los siguientes tipos de cookies:" },
          { type: "ul", items: [
            "Cookies esenciales",
            "Cookies de rendimiento/análisis",
            "Cookies funcionales",
            "Cookies publicitarias/de segmentación",
          ] },
          { type: "link", text: "Más detalles sobre cookies", href: "/cookies" },
        ],
      },
      {
        title: "8. Transferencias internacionales de datos",
        blocks: [
          { type: "p", text: "Podemos transferir información personal a ubicaciones fuera de su país. Todas las transferencias cumplen con el RGPD." },
        ],
      },
      {
        title: "9. Notificación de brechas de seguridad",
        blocks: [
          { type: "ul", items: [
            "Detección mediante monitoreo interno",
            "Si es necesario, notificamos a las autoridades reguladoras en un plazo de 30 días",
            "Los individuos afectados son notificados en un plazo de 30 días",
          ] },
        ],
      },
      {
        title: "10. Actualizaciones de la política",
        blocks: [
          { type: "p", text: "Le notificamos mediante email o notificaciones del sitio web. El uso continuado tras los cambios constituye aceptación." },
        ],
      },
      {
        title: "11. Contacto",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "Teléfono: +386 71604980"] },
        ],
      },
    ],
  },
};
