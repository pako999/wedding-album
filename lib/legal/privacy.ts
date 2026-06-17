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
    lastUpdated: "Zadnja posodobitev: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. (v nadaljevanju: “mi”, “naše”, “Guestcam”) spoštuje vašo zasebnost in varuje osebne podatke v skladu z Uredbo (EU) 2016/679 (GDPR) ter veljavno slovensko zakonodajo. Ta politika opisuje, katere podatke zbiramo, kako jih uporabljamo in kakšne so vaše pravice.",
    sections: [
      {
        title: "1. Upravljavec podatkov",
        blocks: [
          { type: "contactCard", lines: ["Sport group d.o.o.", "Davčna številka: SI72133449", "E-pošta: info@guestcam.si"] },
        ],
      },
      {
        title: "2. Katere podatke zbiramo",
        blocks: [
          { type: "h3", text: "2.1 Podatki, ki jih vnesete sami" },
          { type: "ul", items: [
            "Ime para / organizatorja — pri ustvarjanju galerije vnesete ime (npr. “Ana in Marko”), ki je prikazano na QR kodi in v galeriji.",
            "E-poštni naslov — za prijavo prek Clerk.com (samo organizator galerije). Gosti za nalaganje fotografij ne potrebujejo računa.",
            "Datum in kraj dogodka — neobvezni podatki za personalizacijo galerije.",
          ] },
          { type: "h3", text: "2.2 Vsebina, ki jo naložite" },
          { type: "ul", items: [
            "Fotografije in video posnetki, ki jih naložijo gostje ali organizator.",
            "Metapodatki datotek (datum nastanka, velikost) — shranjeni le v namen prikaza in prenosa.",
          ] },
          { type: "h3", text: "2.3 Tehnični podatki" },
          { type: "ul", items: [
            "IP naslov (za zaščito pred zlorabo storitve).",
            "Vrsta brskalnika in naprave (za optimizacijo prikaza galerije).",
            "Piškotki Clerk.com za vzdrževano sejo (samo organizator).",
          ] },
        ],
      },
      {
        title: "3. Namen obdelave in pravna podlaga",
        blocks: [{ type: "table", ...legalBasisRows.sl }],
      },
      {
        title: "4. Kje so shranjeni vaši podatki",
        blocks: [
          { type: "p", text: "Vse fotografije in datoteke shranjujemo prek storitve Bunny.net (CDN in hramba podatkov) v podatkovnih centrih na ozemlju EU. Uporabniški računi (avtentikacija) so upravljani prek storitve Clerk.com, ki podatke hrani v skladu z GDPR. Podatki galerije (naslovi, datumi, metapodatki) so shranjeni v podatkovni bazi Neon PostgreSQL na strežnikih v EU." },
          { type: "p", text: "Nobeni vaši podatki niso posredovani tretjim osebam za oglaševalske namene ali prodani naprej." },
        ],
      },
      {
        title: "5. Čas hrambe podatkov",
        blocks: [
          { type: "ul", items: [
            "Fotografije in galerija — shranjene so toliko časa, kolikor traja vaš paket (1 mesec, 1 leto ali 2 leti). Po preteku paketa, če ga ne obnovite, galerijo in vse vsebine trajno izbrišemo.",
            "Račun organizatorja — hranjen, dokler aktivno vzdržujete vsaj eno galerijo ali dokler ne zahtevate izbrisa. Račun brez aktivnih galerij izbrišemo po 2 letih neaktivnosti.",
            "Računovodski podatki — računi in plačilni podatki (brez številk kartic) hranimo 10 let v skladu z zakonodajo o računovodstvu.",
          ] },
        ],
      },
      {
        title: "6. Vaše pravice (GDPR)",
        blocks: [
          { type: "p", text: "V skladu z GDPR imate naslednje pravice:" },
          { type: "cards", items: gdprRightsCards.sl },
          { type: "p", text: "Svojo pravico uveljavljate prek e-pošte info@guestcam.si. Odgovorimo v 30 dneh." },
        ],
      },
      {
        title: "7. Varnost podatkov",
        blocks: [
          { type: "p", text: "Vse povezave so zaščitene s protokolom HTTPS (TLS 1.3). Dostop do galerij je mogoč zgolj z unikatno QR kodo oziroma URL-jem, ki ga delite vi. Noben javni iskalnik ne more indeksirati vsebine vaše galerije. Interni dostop do podatkov imajo le pooblaščeni zaposleni, kadar je to nujno za podporo." },
        ],
      },
      {
        title: "8. Piškotki",
        blocks: [{ type: "p", text: "Za informacije o piškotkih glejte našo Politiko piškotkov." }],
      },
      {
        title: "9. Spremembe politike zasebnosti",
        blocks: [{ type: "p", text: "O bistvenih spremembah vas obvestimo prek e-pošte (organizatorje) ali z obvestilom v storitvi. Datum zadnje posodobitve je vedno naveden na vrhu tega dokumenta." }],
      },
      {
        title: "10. Kontakt",
        blocks: [
          { type: "p", text: "Za vse vprašanja glede zasebnosti nas kontaktirajte:" },
          { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "Davčna številka: SI72133449"] },
        ],
      },
    ],
  },
  hr: {
    heading: "Politika privatnosti",
    eyebrow: "Pravni dokument",
    lastUpdated: "Zadnje ažurirano: 1. siječnja 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. (u nastavku: “mi”, “naše”, “Guestcam”) poštuje vašu privatnost i štiti osobne podatke u skladu s Uredbom (EU) 2016/679 (GDPR) i važećim hrvatskim zakonodavstvom. Ova politika opisuje koje podatke prikupljamo, kako ih koristimo i koja su vaša prava.",
    sections: [
      { title: "1. Voditelj obrade podataka", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "OIB: SI72133449", "E-pošta: info@guestcam.si"] },
      ] },
      { title: "2. Koje podatke prikupljamo", blocks: [
        { type: "h3", text: "2.1 Podaci koje sami unosite" },
        { type: "ul", items: [
          "Ime para / organizatora — prilikom kreiranja galerije unosite ime (npr. “Ana i Marko”), koje se prikazuje na QR kodu i u galeriji.",
          "Adresa e-pošte — za prijavu putem Clerk.com (samo organizator galerije). Gosti ne trebaju račun za učitavanje fotografija.",
          "Datum i mjesto događaja — neobavezni podaci za personalizaciju galerije.",
        ] },
        { type: "h3", text: "2.2 Sadržaj koji učitavate" },
        { type: "ul", items: [
          "Fotografije i videozapisi koje učitavaju gosti ili organizator.",
          "Metapodaci datoteka (datum nastanka, veličina) — pohranjeni isključivo radi prikaza i preuzimanja.",
        ] },
        { type: "h3", text: "2.3 Tehnički podaci" },
        { type: "ul", items: [
          "IP adresa (za zaštitu od zlouporabe usluge).",
          "Vrsta preglednika i uređaja (za optimizaciju prikaza galerije).",
          "Kolačići Clerk.com za održavanje sesije (samo organizator).",
        ] },
      ] },
      { title: "3. Svrha obrade i pravna osnova", blocks: [{ type: "table", ...legalBasisRows.hr }] },
      { title: "4. Gdje su pohranjeni vaši podaci", blocks: [
        { type: "p", text: "Sve fotografije i datoteke pohranjujemo putem usluge Bunny.net (CDN i pohrana podataka) u podatkovnim centrima na području EU. Korisnički računi (autentifikacija) upravljani su putem Clerk.com koja podatke čuva u skladu s GDPR-om. Podaci galerije (nazivi, datumi, metapodaci) pohranjeni su u bazi podataka Neon PostgreSQL na poslužiteljima u EU." },
        { type: "p", text: "Vaše podatke ne prosljeđujemo trećim stranama za oglašavanje niti ih prodajemo dalje." },
      ] },
      { title: "5. Razdoblje čuvanja podataka", blocks: [
        { type: "ul", items: [
          "Fotografije i galerija — čuvaju se onoliko koliko traje vaš paket (1 mjesec, 1 godina ili 2 godine). Nakon isteka paketa, ako ga ne obnovite, galeriju i sav sadržaj trajno brišemo.",
          "Račun organizatora — čuva se dok aktivno održavate barem jednu galeriju ili dok ne zatražite brisanje. Račun bez aktivnih galerija brišemo nakon 2 godine neaktivnosti.",
          "Računovodstveni podaci — račune i podatke o plaćanju (bez brojeva kartica) čuvamo 10 godina u skladu sa zakonodavstvom o računovodstvu.",
        ] },
      ] },
      { title: "6. Vaša prava (GDPR)", blocks: [
        { type: "p", text: "U skladu s GDPR-om imate sljedeća prava:" },
        { type: "cards", items: gdprRightsCards.hr },
        { type: "p", text: "Svoje pravo ostvarujete putem e-pošte info@guestcam.si. Odgovaramo u roku od 30 dana." },
      ] },
      { title: "7. Sigurnost podataka", blocks: [
        { type: "p", text: "Sve veze su zaštićene protokolom HTTPS (TLS 1.3). Pristup galerijama moguć je isključivo putem jedinstvenog QR koda ili URL-a koji vi dijelite. Nijedna javna tražilica ne može indeksirati sadržaj vaše galerije. Interni pristup podacima imaju samo ovlašteni zaposlenici, i to samo kada je to nužno za podršku." },
      ] },
      { title: "8. Kolačići", blocks: [{ type: "p", text: "Za informacije o kolačićima pogledajte našu Politiku kolačića." }] },
      { title: "9. Izmjene politike privatnosti", blocks: [{ type: "p", text: "O bitnim izmjenama obavještavamo vas putem e-pošte (organizatore) ili obavijesti u usluzi. Datum zadnjeg ažuriranja uvijek je naveden na vrhu ovog dokumenta." }] },
      { title: "10. Kontakt", blocks: [
        { type: "p", text: "Za sva pitanja o privatnosti kontaktirajte nas:" },
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "OIB: SI72133449"] },
      ] },
    ],
  },
  sr: {
    heading: "Politika privatnosti",
    eyebrow: "Pravni dokument",
    lastUpdated: "Poslednje ažurirano: 1. januar 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. (u daljem tekstu: “mi”, “naše”, “Guestcam”) poštuje vašu privatnost i štiti lične podatke u skladu sa Uredbom (EU) 2016/679 (GDPR) i važećim zakonodavstvom. Ova politika opisuje koje podatke prikupljamo, kako ih koristimo i koja su vaša prava.",
    sections: [
      { title: "1. Rukovalac podataka", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "PIB: SI72133449", "E-pošta: info@guestcam.si"] },
      ] },
      { title: "2. Koje podatke prikupljamo", blocks: [
        { type: "h3", text: "2.1 Podaci koje sami unosite" },
        { type: "ul", items: [
          "Ime para / organizatora — prilikom kreiranja galerije unosite ime (npr. “Ana i Marko”), koje se prikazuje na QR kodu i u galeriji.",
          "Adresa e-pošte — za prijavu putem Clerk.com (samo organizator galerije). Gostima nije potreban nalog za otpremanje fotografija.",
          "Datum i mesto događaja — neobavezni podaci za personalizaciju galerije.",
        ] },
        { type: "h3", text: "2.2 Sadržaj koji otpremate" },
        { type: "ul", items: [
          "Fotografije i video zapisi koje otpremaju gosti ili organizator.",
          "Metapodaci datoteka (datum nastanka, veličina) — čuvani isključivo radi prikaza i preuzimanja.",
        ] },
        { type: "h3", text: "2.3 Tehnički podaci" },
        { type: "ul", items: [
          "IP adresa (za zaštitu od zloupotrebe usluge).",
          "Vrsta pregledača i uređaja (za optimizaciju prikaza galerije).",
          "Kolačići Clerk.com za održavanje sesije (samo organizator).",
        ] },
      ] },
      { title: "3. Svrha obrade i pravna osnova", blocks: [{ type: "table", ...legalBasisRows.sr }] },
      { title: "4. Gde su pohranjeni vaši podaci", blocks: [
        { type: "p", text: "Sve fotografije i datoteke čuvamo putem usluge Bunny.net (CDN i pohrana podataka) u podatkovnim centrima na teritoriji EU. Korisnički nalozi (autentifikacija) upravljani su putem Clerk.com koja podatke čuva u skladu sa GDPR-om. Podaci galerije (nazivi, datumi, metapodaci) pohranjeni su u bazi Neon PostgreSQL na serverima u EU." },
        { type: "p", text: "Vaše podatke ne prosleđujemo trećim licima za reklamiranje niti ih prodajemo dalje." },
      ] },
      { title: "5. Period čuvanja podataka", blocks: [
        { type: "ul", items: [
          "Fotografije i galerija — čuvaju se onoliko koliko traje vaš paket (1 mesec, 1 godina ili 2 godine). Nakon isteka paketa, ako ga ne obnovite, galeriju i sav sadržaj trajno brišemo.",
          "Nalog organizatora — čuva se dok aktivno održavate barem jednu galeriju ili dok ne zatražite brisanje. Nalog bez aktivnih galerija brišemo posle 2 godine neaktivnosti.",
          "Računovodstveni podaci — račune i podatke o plaćanju (bez brojeva kartica) čuvamo 10 godina u skladu sa zakonodavstvom o računovodstvu.",
        ] },
      ] },
      { title: "6. Vaša prava (GDPR)", blocks: [
        { type: "p", text: "U skladu sa GDPR-om imate sledeća prava:" },
        { type: "cards", items: gdprRightsCards.sr },
        { type: "p", text: "Svoje pravo ostvarujete putem e-pošte info@guestcam.si. Odgovaramo u roku od 30 dana." },
      ] },
      { title: "7. Bezbednost podataka", blocks: [
        { type: "p", text: "Sve veze su zaštićene protokolom HTTPS (TLS 1.3). Pristup galerijama moguć je isključivo putem jedinstvenog QR koda ili URL-a koji vi delite. Nijedan javni pretraživač ne može indeksirati sadržaj vaše galerije. Interni pristup podacima imaju samo ovlašćeni zaposleni, i to samo kada je neophodno za podršku." },
      ] },
      { title: "8. Kolačići", blocks: [{ type: "p", text: "Za informacije o kolačićima pogledajte našu Politiku kolačića." }] },
      { title: "9. Izmene politike privatnosti", blocks: [{ type: "p", text: "O bitnim izmenama obaveštavamo vas putem e-pošte (organizatore) ili obaveštenja u usluzi. Datum poslednjeg ažuriranja uvek je naveden na vrhu ovog dokumenta." }] },
      { title: "10. Kontakt", blocks: [
        { type: "p", text: "Za sva pitanja o privatnosti kontaktirajte nas:" },
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-pošta: info@guestcam.si", "PIB: SI72133449"] },
      ] },
    ],
  },
  de: {
    heading: "Datenschutzerklärung",
    eyebrow: "Rechtsdokument",
    lastUpdated: "Zuletzt aktualisiert: 1. Januar 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. (im Folgenden: “wir”, “uns”, “Guestcam”) respektiert Ihre Privatsphäre und schützt personenbezogene Daten im Einklang mit der Verordnung (EU) 2016/679 (DSGVO) sowie geltendem Recht. Diese Erklärung beschreibt, welche Daten wir erheben, wie wir sie verwenden und welche Rechte Sie haben.",
    sections: [
      { title: "1. Verantwortlicher", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "USt-IdNr.: SI72133449", "E-Mail: info@guestcam.si"] },
      ] },
      { title: "2. Welche Daten wir erheben", blocks: [
        { type: "h3", text: "2.1 Von Ihnen eingegebene Daten" },
        { type: "ul", items: [
          "Name des Paares / Veranstalters — beim Anlegen der Galerie geben Sie einen Namen ein (z. B. “Ana und Marko”), der auf dem QR-Code und in der Galerie angezeigt wird.",
          "E-Mail-Adresse — für die Anmeldung über Clerk.com (nur Galerie-Organisator). Gäste benötigen kein Konto, um Fotos hochzuladen.",
          "Datum und Ort der Veranstaltung — optionale Daten zur Personalisierung der Galerie.",
        ] },
        { type: "h3", text: "2.2 Hochgeladene Inhalte" },
        { type: "ul", items: [
          "Fotos und Videos, die von Gästen oder dem Organisator hochgeladen werden.",
          "Datei-Metadaten (Erstellungsdatum, Größe) — werden ausschließlich zur Anzeige und zum Download gespeichert.",
        ] },
        { type: "h3", text: "2.3 Technische Daten" },
        { type: "ul", items: [
          "IP-Adresse (zum Schutz vor Missbrauch des Dienstes).",
          "Browser- und Gerätetyp (zur Optimierung der Galerieanzeige).",
          "Clerk.com-Cookies für die Sitzungsverwaltung (nur Organisator).",
        ] },
      ] },
      { title: "3. Verarbeitungszweck und Rechtsgrundlage", blocks: [{ type: "table", ...legalBasisRows.de }] },
      { title: "4. Wo Ihre Daten gespeichert werden", blocks: [
        { type: "p", text: "Sämtliche Fotos und Dateien speichern wir über Bunny.net (CDN und Datenspeicherung) in Rechenzentren innerhalb der EU. Benutzerkonten (Authentifizierung) werden über Clerk.com verwaltet, das Daten DSGVO-konform speichert. Galerie-Daten (Titel, Datumsangaben, Metadaten) werden in der Neon-PostgreSQL-Datenbank auf Servern in der EU gespeichert." },
        { type: "p", text: "Wir geben keine Daten zu Werbezwecken an Dritte weiter und verkaufen sie nicht." },
      ] },
      { title: "5. Aufbewahrungsdauer", blocks: [
        { type: "ul", items: [
          "Fotos und Galerie — werden so lange aufbewahrt, wie Ihr Paket läuft (1 Monat, 1 Jahr oder 2 Jahre). Nach Ablauf des Pakets, wenn Sie es nicht verlängern, löschen wir Galerie und alle Inhalte unwiderruflich.",
          "Organisator-Konto — wird aufbewahrt, solange Sie mindestens eine Galerie aktiv pflegen oder bis Sie Löschung verlangen. Konten ohne aktive Galerien löschen wir nach 2 Jahren Inaktivität.",
          "Buchhaltungsdaten — Rechnungen und Zahlungsdaten (ohne Kartennummern) bewahren wir 10 Jahre gemäß Rechnungslegungsvorschriften auf.",
        ] },
      ] },
      { title: "6. Ihre Rechte (DSGVO)", blocks: [
        { type: "p", text: "Gemäß DSGVO haben Sie folgende Rechte:" },
        { type: "cards", items: gdprRightsCards.de },
        { type: "p", text: "Ihre Rechte machen Sie per E-Mail an info@guestcam.si geltend. Wir antworten innerhalb von 30 Tagen." },
      ] },
      { title: "7. Datensicherheit", blocks: [
        { type: "p", text: "Alle Verbindungen sind mit HTTPS (TLS 1.3) gesichert. Der Zugriff auf Galerien ist ausschließlich über den eindeutigen QR-Code bzw. die von Ihnen geteilte URL möglich. Keine öffentliche Suchmaschine kann den Inhalt Ihrer Galerie indexieren. Internen Zugriff auf Daten haben nur autorisierte Mitarbeiter, und nur wenn dies für den Support erforderlich ist." },
      ] },
      { title: "8. Cookies", blocks: [{ type: "p", text: "Informationen zu Cookies finden Sie in unserer Cookie-Richtlinie." }] },
      { title: "9. Änderungen dieser Datenschutzerklärung", blocks: [{ type: "p", text: "Über wesentliche Änderungen informieren wir Sie per E-Mail (Organisatoren) oder über einen Hinweis im Dienst. Das Datum der letzten Aktualisierung ist stets am Anfang dieses Dokuments angegeben." }] },
      { title: "10. Kontakt", blocks: [
        { type: "p", text: "Bei allen Fragen zum Datenschutz kontaktieren Sie uns:" },
        { type: "contactCard", lines: ["Sport group d.o.o.", "E-Mail: info@guestcam.si", "USt-IdNr.: SI72133449"] },
      ] },
    ],
  },
  en: {
    heading: "Privacy Policy",
    eyebrow: "Legal document",
    lastUpdated: "Last updated: January 1, 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. (“we”, “our”, “Guestcam”) respects your privacy and protects personal data in accordance with Regulation (EU) 2016/679 (GDPR) and applicable law. This policy describes what data we collect, how we use it, and what your rights are.",
    sections: [
      { title: "1. Data controller", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "VAT ID: SI72133449", "Email: info@guestcam.si"] },
      ] },
      { title: "2. What data we collect", blocks: [
        { type: "h3", text: "2.1 Data you provide" },
        { type: "ul", items: [
          "Couple / organiser name — when creating a gallery you enter a name (e.g. “Ana and Marko”) that is displayed on the QR code and inside the gallery.",
          "Email address — used to sign in via Clerk.com (gallery organiser only). Guests do not need an account to upload photos.",
          "Event date and location — optional data used to personalise the gallery.",
        ] },
        { type: "h3", text: "2.2 Content you upload" },
        { type: "ul", items: [
          "Photos and videos uploaded by guests or by the organiser.",
          "File metadata (creation date, size) — stored only to display and download the files.",
        ] },
        { type: "h3", text: "2.3 Technical data" },
        { type: "ul", items: [
          "IP address (to protect the service from abuse).",
          "Browser and device type (to optimise gallery rendering).",
          "Clerk.com cookies for session persistence (organiser only).",
        ] },
      ] },
      { title: "3. Purpose and legal basis", blocks: [{ type: "table", ...legalBasisRows.en }] },
      { title: "4. Where your data lives", blocks: [
        { type: "p", text: "All photos and files are stored via Bunny.net (CDN and storage) in data centres within the EU. User accounts (authentication) are managed via Clerk.com, which stores data in compliance with the GDPR. Gallery records (titles, dates, metadata) are stored in a Neon PostgreSQL database on servers in the EU." },
        { type: "p", text: "We never share your data with third parties for advertising purposes, and we never sell it." },
      ] },
      { title: "5. Data retention", blocks: [
        { type: "ul", items: [
          "Photos and gallery — kept for the duration of your plan (1 month, 1 year, or 2 years). When the plan expires, if you don't renew, we permanently delete the gallery and all content.",
          "Organiser account — kept while you actively maintain at least one gallery, or until you request deletion. Accounts with no active galleries are deleted after 2 years of inactivity.",
          "Accounting data — invoices and payment data (no card numbers) are kept for 10 years as required by accounting law.",
        ] },
      ] },
      { title: "6. Your rights (GDPR)", blocks: [
        { type: "p", text: "Under the GDPR you have the following rights:" },
        { type: "cards", items: gdprRightsCards.en },
        { type: "p", text: "Exercise your rights by emailing info@guestcam.si. We respond within 30 days." },
      ] },
      { title: "7. Security", blocks: [
        { type: "p", text: "All connections are secured with HTTPS (TLS 1.3). Galleries are accessible only via the unique QR code or URL you share. No public search engine can index your gallery content. Internal access to data is limited to authorised staff, only when necessary for support." },
      ] },
      { title: "8. Cookies", blocks: [{ type: "p", text: "For details on cookies, see our Cookie Policy." }] },
      { title: "9. Changes to this policy", blocks: [{ type: "p", text: "We notify you of material changes by email (organisers) or via a notice inside the service. The last-updated date is always shown at the top of this document." }] },
      { title: "10. Contact", blocks: [
        { type: "p", text: "For any privacy questions, contact us:" },
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "VAT ID: SI72133449"] },
      ] },
    ],
  },
  es: {
    heading: "Política de privacidad",
    eyebrow: "Documento legal",
    lastUpdated: "Última actualización: 1 de enero de 2026 · Sport group d.o.o.",
    intro:
      "Sport group d.o.o. (en adelante, “nosotros”, “nuestro”, “Guestcam”) respeta tu privacidad y protege los datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la legislación aplicable. Esta política describe qué datos recopilamos, cómo los usamos y cuáles son tus derechos.",
    sections: [
      { title: "1. Responsable del tratamiento", blocks: [
        { type: "contactCard", lines: ["Sport group d.o.o.", "CIF: SI72133449", "Email: info@guestcam.si"] },
      ] },
      { title: "2. Qué datos recopilamos", blocks: [
        { type: "h3", text: "2.1 Datos que proporcionas tú" },
        { type: "ul", items: [
          "Nombre de la pareja / organizador — al crear la galería introduces un nombre (p. ej. “Ana y Marko”) que se muestra en el código QR y en la galería.",
          "Dirección de email — usada para iniciar sesión mediante Clerk.com (solo organizador). Los invitados no necesitan cuenta para subir fotos.",
          "Fecha y lugar del evento — datos opcionales para personalizar la galería.",
        ] },
        { type: "h3", text: "2.2 Contenido que subes" },
        { type: "ul", items: [
          "Fotos y vídeos subidos por invitados o por el organizador.",
          "Metadatos de archivos (fecha de creación, tamaño) — almacenados únicamente para mostrar y descargar los archivos.",
        ] },
        { type: "h3", text: "2.3 Datos técnicos" },
        { type: "ul", items: [
          "Dirección IP (para proteger el servicio frente a usos indebidos).",
          "Tipo de navegador y dispositivo (para optimizar la visualización de la galería).",
          "Cookies de Clerk.com para mantener la sesión (solo organizador).",
        ] },
      ] },
      { title: "3. Finalidad y base jurídica", blocks: [{ type: "table", ...legalBasisRows.es }] },
      { title: "4. Dónde se almacenan tus datos", blocks: [
        { type: "p", text: "Todas las fotos y archivos se almacenan a través de Bunny.net (CDN y almacenamiento) en centros de datos dentro de la UE. Las cuentas de usuario (autenticación) se gestionan a través de Clerk.com, que almacena los datos conforme al RGPD. Los registros de la galería (títulos, fechas, metadatos) se almacenan en una base de datos Neon PostgreSQL en servidores en la UE." },
        { type: "p", text: "Nunca compartimos tus datos con terceros con fines publicitarios ni los vendemos." },
      ] },
      { title: "5. Conservación de datos", blocks: [
        { type: "ul", items: [
          "Fotos y galería — se conservan mientras dure tu plan (1 mes, 1 año o 2 años). Tras la expiración del plan, si no lo renuevas, eliminamos permanentemente la galería y todo el contenido.",
          "Cuenta de organizador — se conserva mientras mantengas activamente al menos una galería o hasta que solicites su eliminación. Las cuentas sin galerías activas se eliminan tras 2 años de inactividad.",
          "Datos contables — facturas y datos de pago (sin números de tarjeta) se conservan 10 años, conforme a la legislación contable.",
        ] },
      ] },
      { title: "6. Tus derechos (RGPD)", blocks: [
        { type: "p", text: "Conforme al RGPD tienes los siguientes derechos:" },
        { type: "cards", items: gdprRightsCards.es },
        { type: "p", text: "Ejerce tus derechos por email a info@guestcam.si. Respondemos en 30 días." },
      ] },
      { title: "7. Seguridad de los datos", blocks: [
        { type: "p", text: "Todas las conexiones están protegidas con HTTPS (TLS 1.3). El acceso a las galerías solo es posible mediante el código QR único o la URL que tú compartas. Ningún buscador público puede indexar el contenido de tu galería. El acceso interno a los datos está limitado al personal autorizado y solo cuando sea necesario para soporte." },
      ] },
      { title: "8. Cookies", blocks: [{ type: "p", text: "Para más información sobre cookies, consulta nuestra Política de cookies." }] },
      { title: "9. Cambios en esta política", blocks: [{ type: "p", text: "Te notificaremos los cambios importantes por email (organizadores) o mediante un aviso dentro del servicio. La fecha de la última actualización siempre se muestra en la parte superior de este documento." }] },
      { title: "10. Contacto", blocks: [
        { type: "p", text: "Para cualquier consulta sobre privacidad, contáctanos:" },
        { type: "contactCard", lines: ["Sport group d.o.o.", "Email: info@guestcam.si", "CIF: SI72133449"] },
      ] },
    ],
  },
};
