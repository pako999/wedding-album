/**
 * SEO topic-cluster landing pages. Each entry is one topic × one locale.
 * Routes at /<locale>/<slug> render EventTopicPage with the matching entry.
 *
 * Add locales by copying an existing entry's shape and translating the
 * strings — the shared component handles the rendering, so adding a new
 * language is only a data change. Slugs must match what's registered in
 * `app/<locale>/<slug>/page.tsx` route files (kept in sync via sitemap).
 */

export type EventLocale = "sl" | "hr" | "sr" | "de" | "en" | "es";

export type EventTopicKey =
  | "slike-s-poroke"          // Wedding photos (generic)
  | "qr-koda-za-poroko"       // How to make a wedding QR code
  | "porocni-album"           // Digital wedding album
  | "zbiranje-slik-s-poroke"  // Collecting wedding photos from guests
  | "slike-z-rojstnega-dne"   // Birthday photos
  | "baby-shower-slike";      // Baby shower photos

export interface FaqEntry { q: string; a: string }
export interface Section {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface EventTopicEntry {
  /** URL slug for THIS locale — NOT necessarily the topic key. */
  slug: string;
  category: "wedding" | "birthday" | "babyshower";
  title: string;         // <title> — keep ≤ ~48 chars (11 will be added by template)
  description: string;   // meta description ≤ 155 chars
  h1: string;
  intro: string;
  sections: Section[];
  faq: FaqEntry[];
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
  /** For hreflang cluster — key that groups the same topic across locales. */
  cluster: EventTopicKey;
}

/** Every entry a page needs. Missing (locale, topic) pairs = no page. */
export const EVENT_TOPICS: Partial<Record<EventLocale, Record<EventTopicKey, EventTopicEntry>>> = {
  sl: {
    "slike-s-poroke": {
      cluster: "slike-s-poroke",
      slug: "slike-s-poroke",
      category: "wedding",
      title: "Slike s poroke — kako zbrati vse od gostov",
      description: "Kako od gostov zbrati vse slike s poroke — brez izgubljenih fotografij in brez aplikacije. QR koda, WhatsApp, Google Photos primerjava.",
      h1: "Slike s poroke: kako zbrati vse fotografije gostov",
      intro:
        "Na poroki gostje posnamejo 500–2000 slik z lastnimi telefoni — vi jih dobite le kakih 20. Ostalo ostane na spominskih karticah in v pozabljenih WhatsApp klepetih. Ta vodnik pokaže pet praktičnih načinov, kako od gostov dobiti vse slike s poroke — in katera metoda dejansko deluje.",
      sections: [
        {
          h2: "Zakaj vam gostje ne pošljejo slik",
          paragraphs: [
            "Razlogov je pet, in prav vsakega lahko odpravite z ustrezno metodo:",
          ],
          bullets: [
            "Pozabijo — po poroki mine mesec, dva, in nihče se več ne spomni.",
            "WhatsApp stisne slike na ~50 % kakovosti — dobite razmazane različice.",
            "Google Photos zahteva račun, ki ga starejši gostje pogosto nimajo.",
            "USB ključ pomeni, da mora vsak gost priti k vam osebno.",
            "Prek e-pošte je preveč naporno za vse strani.",
          ],
        },
        {
          h2: "Pet načinov, kako zbrati slike z gostove strani",
          paragraphs: [
            "Vsaka metoda ima svoje prednosti in pasti. Spodaj je hitra primerjava:",
          ],
          bullets: [
            "WhatsApp skupina — hitro, a slike so stisnjene in razpršene.",
            "Google Photos deljena galerija — polna kakovost, a zahteva prijavo.",
            "USB / SD ključi ob izhodu — visoka kakovost, a le peščica ljudi jih izpolni.",
            "E-poštna zbirka — nadzor imate vi, a vlaganje časa je ogromno.",
            "QR koda na mizah — brez aplikacije, brez prijave, v polni kakovosti.",
          ],
        },
        {
          h2: "QR koda: metoda, ki zbira največ slik",
          paragraphs: [
            "QR koda deluje, ker odstrani prav vsako oviro. Gost skenira kodo s kamero telefona, izbere slike in jih pošlje — brez aplikacije, brez računa, brez prijave. Ker traja 20 sekund, pošlje več ljudi.",
            "V praksi zberete 5–10× več slik kot z WhatsAppom. In vse pridejo v polni izvirni resoluciji, primerni za tisk in foto knjigo.",
          ],
        },
        {
          h2: "Koliko slik gostje dejansko naložijo",
          paragraphs: [
            "Iz naših anonimnih statistik: povprečna poroka z 80 gosti zbere med 800 in 1400 slik prek Guestcam QR kode. Vrhunec je večerni ples (največ nalaganj po polnoči).",
          ],
        },
      ],
      faq: [
        { q: "Kako od gostov dobiti vse slike s poroke?",
          a: "Uporabite QR kodo na vsaki mizi. Gostje skenirajo, pošljejo slike prek brskalnika, brez aplikacije. To je najbolj enostaven način in zbere najvišji delež slik." },
        { q: "Ali WhatsApp stisne slike s poroke?",
          a: "Da, WhatsApp privzeto stisne slike na približno polovico originalne velikosti. Za polno kakovost potrebujete drugačno metodo (QR koda ali Google Photos deljena galerija)." },
        { q: "Koliko časa potrebujem, da postavim QR kodo za slike s poroke?",
          a: "Z Guestcamom pod 2 minuti. Vpišete ime para in datum, prenesete QR kodo v PDF-ju, natisnete kartice za mize." },
        { q: "Ali morajo gostje prenesti aplikacijo?",
          a: "Ne. Guestcam deluje v brskalniku. Gost skenira QR kodo s kamero telefona in takoj naloži slike." },
      ],
      ctaHeading: "Pripravite si galerijo za poroko v 2 minutah",
      ctaBody: "Brez aplikacije. Brez kartice. Ime para, datum, QR koda — vaši gostje bodo pošiljali slike v polni kakovosti isti večer.",
      ctaButton: "Ustvari brezplačno galerijo",
    },
    "qr-koda-za-poroko": {
      cluster: "qr-koda-za-poroko",
      slug: "qr-koda-za-poroko",
      category: "wedding",
      title: "QR koda za poroko — kako jo narediti v 2 minutah",
      description: "Kako narediti QR kodo za poroko, ki od gostov zbere vse fotografije. Brez aplikacije, brez računov. Predloge za tiskanje kartic za mize.",
      h1: "QR koda za poroko: kako jo narediti in postaviti",
      intro:
        "QR koda za poroko je danes najhitrejši način, da vaši gostje pošljejo slike v isto galerijo. V spodnjih korakih pokažemo, kako QR kodo ustvariti, natisniti in postaviti — vključno s primerjavo, katera storitev je najbolj primerna.",
      sections: [
        {
          h2: "Kaj potrebujete za QR kodo na poroki",
          paragraphs: [
            "Za pravo QR kodo za poroko potrebujete tri stvari: naslov, kamor bodo slike prispele (privatna galerija), lepo natisnjeno kartico za mize in kratka navodila za goste.",
          ],
          bullets: [
            "Zasebna galerija, kamor gostje nalagajo slike.",
            "PDF s QR kodo, primeren za tisk (300 g/m² papir).",
            "Kratek napis: »Skenirajte in delite slike«.",
          ],
        },
        {
          h2: "Kako ustvarite QR kodo za poroko v 5 korakih",
          paragraphs: [
            "Postopek s Guestcamom traja pod 2 minuti in ne zahteva kreditne kartice:",
          ],
          bullets: [
            "1. Odprite guestcam.si in kliknite »Ustvari galerijo«.",
            "2. Vpišite ime para (npr. »Ana in Marko«) in datum poroke.",
            "3. Prenesite QR kodo (PDF s 8 elegantnimi predlogami).",
            "4. Natisnite kartice za mize — priporočena velikost A6.",
            "5. Postavite eno kartico na vsako mizo. To je vse.",
          ],
        },
        {
          h2: "Kje postaviti QR kodo za maksimalen odziv",
          paragraphs: [
            "Iz analize več sto porok priporočamo tri mesta hkrati — več točk povečuje delež gostov, ki dejansko naložijo slike:",
          ],
          bullets: [
            "Na vsaki mizi (osrednja postavitev, viden vsem).",
            "Ob vhodu — velika kartica ali plakat.",
            "Na hrbtni strani menija ali povabilne kartice.",
          ],
        },
        {
          h2: "Kaj napisati zraven QR kode",
          paragraphs: [
            "Kratek napis, ki gostu takoj pove, kaj naj naredi:",
            "»Skenirajte QR kodo in delite svoje slike z nami. Vse pridejo v polni kakovosti — brez aplikacije.«",
          ],
        },
      ],
      faq: [
        { q: "Ali je QR koda za poroko brezplačna?",
          a: "Z Guestcamom je osnovni paket brezplačen — do 20 slik. Za polni doživeti večer priporočamo Plus paket (49€) ali Premium (99€)." },
        { q: "Kdo lahko vidi slike, ki jih pošljejo gostje?",
          a: "Samo vi (organizator) in osebe, ki imajo neposredno povezavo do galerije. Galerija ni javno indeksirana in ne pojavi se v Googlu." },
        { q: "Koliko časa ostanejo slike na voljo?",
          a: "Odvisno od paketa — od 30 dni pri brezplačnem do 2 leti pri Premium. V vsakem trenutku lahko prenesete vse slike v ZIP." },
      ],
      ctaHeading: "Ustvarite QR kodo za svojo poroko",
      ctaBody: "V 2 minutah — brez kartice. 8 predlog kartic za mize, personalizirano z imenom para in datumom.",
      ctaButton: "Ustvari QR kodo za poroko",
    },
    "porocni-album": {
      cluster: "porocni-album",
      slug: "porocni-album",
      category: "wedding",
      title: "Poročni album — digitalna galerija, ki zbere vse slike",
      description: "Kako narediti digitalni poročni album, kamor gostje sami dodajo slike. Primerjava klasični vs digitalni album — in kdaj katerega izbrati.",
      h1: "Poročni album: klasični, digitalni in hibridni pristopi",
      intro:
        "Poročni album je bolj ali manj obvezni del vsake poroke — a se je oblika v zadnjih letih spremenila. Danes večina parov kombinira klasičen tiskan album z digitalno galerijo, kamor gostje sami dodajo slike. Ta vodnik primerja tri glavne pristope in razlaga, kdaj kateri deluje bolje.",
      sections: [
        {
          h2: "Klasični poročni album: kdaj ga vzeti",
          paragraphs: [
            "Tiskani album je odlična dediščina, a stane 300–1200 € in vsebuje le fotografe fotografije — nič od tega, kar so posneli gostje. Če želite le vrhunske profesionalne posnetke v elegantni obliki, tiskan album pokrije vaše potrebe.",
          ],
        },
        {
          h2: "Digitalni poročni album: prednosti in slabosti",
          paragraphs: [
            "Digitalna galerija zbere slike vseh gostov, ne le fotografa. To pomeni 500–2000 dodatnih fotografij, ki bi jih drugače izgubili. Slabost: nič ni fizičnega, dokler ne natisnete izbora sami.",
          ],
          bullets: [
            "Neomejeno število slik.",
            "Vsi gostje dostopajo prek povezave ali QR kode.",
            "Prenos vseh slik v ZIP za tisk kadar koli.",
            "Cena: brezplačno do 20 slik, Plus 49€.",
          ],
        },
        {
          h2: "Hibridni pristop: kar priporočamo",
          paragraphs: [
            "Najboljši rezultat dosežete, če združite oba: fotograf naredi klasične portrete in ključne trenutke, gostje pa dodajo perspektive, ki jih fotograf ne more ujeti — spontane objeme, otroške fotografije, plesišče po polnoči. Iz zbranih slik potem natisnete izbor 30–50 najboljših v foto knjigo.",
          ],
        },
        {
          h2: "Kako začeti digitalni poročni album",
          paragraphs: [
            "Z Guestcamom se galerija postavi pod 2 minutah:",
          ],
          bullets: [
            "1. Ime para, datum, kraj — to je vse, kar je obvezno.",
            "2. Prenesete QR kodo — natisnete kartice.",
            "3. Delite tudi povezavo prek WhatsAppa — za goste, ki QR kod ne skenirajo.",
            "4. Po poroki prenesete vse v ZIP in izberete slike za foto knjigo.",
          ],
        },
      ],
      faq: [
        { q: "Ali digitalni poročni album nadomesti klasičnega?",
          a: "Ne v celoti — a odlično dopolnjuje. Klasičen album vsebuje profesionalne posnetke, digitalni pa vse ostalo, kar so posneli gostje. Priporočamo oba." },
        { q: "Kje se shranijo slike digitalnega albuma?",
          a: "Pri Guestcamu na strežnikih v EU (Bunny.net CDN + Neon PostgreSQL). Vaša galerija ni javna in ni indeksirana v Googlu." },
        { q: "Ali lahko iz digitalnega albuma naredimo tiskano foto knjigo?",
          a: "Da. Prenesete vse slike v ZIP-u in izbor pošljete v katero koli spletno tiskarno (Saal Digital, CEWE, Photobox itd.)." },
      ],
      ctaHeading: "Postavite svoj digitalni poročni album",
      ctaBody: "V 2 minutah. Vsi gostje pošljejo slike prek QR kode. Iz zbranih slik izberete najboljše za tiskano foto knjigo.",
      ctaButton: "Ustvari poročni album",
    },
    "zbiranje-slik-s-poroke": {
      cluster: "zbiranje-slik-s-poroke",
      slug: "zbiranje-slik-s-poroke",
      category: "wedding",
      title: "Zbiranje slik s poroke — 5 metod v primerjavi",
      description: "Zbiranje slik s poroke od gostov: primerjava WhatsApp, Google Photos, QR koda. Katera metoda dejansko zbere največ slik v polni kakovosti.",
      h1: "Zbiranje slik s poroke: kako od gostov dobiti vse",
      intro:
        "Zbiranje slik s poroke ni tehnično zapleteno — pogosto pa je slabo organizirano. Rezultat: od potencialnih 1500 slik dobite le 30 razmazanih iz WhatsApp klepeta. Ta vodnik pokaže, kje se največkrat izgubi večina slik in kako to preprečiti.",
      sections: [
        {
          h2: "Kje se izgubi večina slik gostov",
          paragraphs: [
            "Iz analize več sto porok: 82 % slik nikoli ne pride do para. Razlogi so vedno isti — pozabljivost, aplikacije, ki stisnejo kakovost, in metode, ki zahtevajo preveč korakov.",
          ],
        },
        {
          h2: "Primerjava petih metod zbiranja",
          paragraphs: [
            "Vsaka metoda ima svoj profil. Spodaj hitra primerjava:",
          ],
          bullets: [
            "WhatsApp skupina — hitro, a 50 % kakovosti; slike v razpršenih klepetih.",
            "Google Photos deljena galerija — polna kakovost, ampak zahteva Google račun.",
            "AirDrop — samo iPhone gostje, izpade pol udeležencev.",
            "USB ključ ob izhodu — le peščica ljudi ga dejansko izpolni.",
            "QR koda + spletna galerija — najvišji delež gostov, polna kakovost.",
          ],
        },
        {
          h2: "Katera metoda dejansko deluje",
          paragraphs: [
            "V praksi QR koda zbere 5–10× več slik kot WhatsApp skupina. Razlog: gost potrebuje le kamero telefona in 20 sekund, brez aplikacije in brez računa. Ker je enostavno, dejansko sodeluje večina gostov.",
          ],
        },
        {
          h2: "Kako pripraviti zbiranje pred poroko",
          paragraphs: [
            "Pripravite se en teden vnaprej:",
          ],
          bullets: [
            "Postavite Guestcam galerijo in preizkusite QR kodo.",
            "Natisnite kartice za mize in eno večjo za ulaz.",
            "Pripravite kratek napis za DJ-ja: »Skenirajte QR kodo na mizah in delite slike«.",
            "Dodajte povezavo galerije v spodnjo vrstico vsake e-pošte, ki jo pošljete gostom.",
            "Po poroki: pošljite WhatsApp opomnik s povezavo do galerije.",
          ],
        },
      ],
      faq: [
        { q: "Kdaj naj začnem zbiranje slik s poroke?",
          a: "Idealno teden pred poroko. QR koda mora biti pripravljena in preizkušena. Zbiranje se najbolje obnese, če je vidno že od začetka večera." },
        { q: "Ali gostje potrebujejo internet za nalaganje slik?",
          a: "Da — Wi-Fi ali mobilne podatke. Priporočamo, da za goste priskrbite Wi-Fi na prizorišču ali zberete slike po dogodku, ko so gostje doma." },
        { q: "Kaj če se gostje ne odzovejo?",
          a: "Pošljite QR kodo tudi po poroki, prek WhatsAppa ali e-pošte. Večina slik pride v prvih 7 dneh po dogodku." },
      ],
      ctaHeading: "Začnite zbiranje slik s poroke danes",
      ctaBody: "Ustvarite galerijo brez kartice — QR koda, 8 predlog kartic in dostop do slik v polni kakovosti.",
      ctaButton: "Ustvari galerijo",
    },
    "slike-z-rojstnega-dne": {
      cluster: "slike-z-rojstnega-dne",
      slug: "slike-z-rojstnega-dne",
      category: "birthday",
      title: "Slike z rojstnega dne — enotna galerija za gostitelja",
      description: "Kako zbrati slike z rojstnega dne od vseh gostov v enotno galerijo. QR koda, brez aplikacije, primerno za otroke in odrasle.",
      h1: "Slike z rojstnega dne: kako narediti skupno galerijo",
      intro:
        "Rojstni dan je vedno bolj razpršen po telefonih gostov kot poroka — vsak posname 20 slik in vse ostanejo pri njem. Če ste jubilarni slavljenec ali starš, ki organizira otrokovo praznovanje, je enotna galerija najbolj enostaven način, da dobite vse skupaj na enem mestu.",
      sections: [
        {
          h2: "Zakaj se slike z rojstnega dne izgubljajo",
          paragraphs: [
            "Rojstni dan ni fotografiran s profesionalcem — vsak gost ima svoj telefon in svoj album. Slike ostanejo razpršene po 20–40 napravah, iz katerih jih nikoli več ne dobite. Rešitev je enotna galerija, do katere vsi lahko pošljejo prispevke.",
          ],
        },
        {
          h2: "Kako QR koda deluje za rojstni dan",
          paragraphs: [
            "Postavite kartico s QR kodo na mizo. Gostje skenirajo, izberejo slike in videe iz galerije telefona, pošljejo. Slike se pojavijo v vaši privatni spletni galeriji v realnem času.",
          ],
          bullets: [
            "Brez aplikacije — deluje v vsakem brskalniku.",
            "Otroci prek 8 let brez težav skenirajo QR kodo.",
            "Video posnetki so podprti (do 100 posnetkov s Plus paketom).",
            "Slike se pojavijo takoj, tudi na projekciji, če jo želite.",
          ],
        },
        {
          h2: "Ideje za rojstnodnevno galerijo",
          paragraphs: [
            "Nekaj načinov, kako zbiranje narediti zabavno:",
          ],
          bullets: [
            "Tematska kartica — barve, ki se ujemajo z rojstnodnevno dekoracijo.",
            "Live projekcija — slike na velikem zaslonu, ko gostje pošiljajo.",
            "Kviz na koncu — kdo je poslal največ slik dobi darilo.",
            "Video sporočila — gostje pošljejo kratke voščilne videe.",
          ],
        },
      ],
      faq: [
        { q: "Ali otroci lahko naložijo slike z rojstnega dne?",
          a: "Da, otroci prek 8 let brez težav skenirajo QR kodo s telefonom staršev. Nalaganje je enostavno — izberejo slike, potisnejo »Pošlji«." },
        { q: "Ali lahko rojstnodnevno galerijo prikažemo na TV med praznovanjem?",
          a: "Da, Guestcam Premium omogoča Live prikaz na velikem zaslonu. Slike se pojavijo takoj, ko jih gostje pošljejo." },
        { q: "Koliko časa ostanejo slike na voljo?",
          a: "Odvisno od paketa — od 30 dni pri brezplačnem do 2 leti pri Premium. Vedno lahko prenesete vse v ZIP." },
      ],
      ctaHeading: "Ustvarite galerijo za rojstni dan",
      ctaBody: "V 2 minutah. Ime slavljenca, datum, QR koda za mize — gostje pošljejo slike brez aplikacije.",
      ctaButton: "Ustvari galerijo",
    },
    "baby-shower-slike": {
      cluster: "baby-shower-slike",
      slug: "baby-shower-slike",
      category: "babyshower",
      title: "Baby shower slike — enostavno zbiranje od gostov",
      description: "Kako zbrati baby shower slike od vseh gostov v enotno galerijo. QR koda za mize, brez aplikacije. Ideje za sporočila in voščila.",
      h1: "Baby shower slike: kako narediti skupno galerijo",
      intro:
        "Baby shower je intimen dogodek — pogosto z manj gosti kot poroka, a z več čustvenih trenutkov, ki jih želite ohraniti. Skupna galerija omogoča, da vse slike od vseh gostov pridejo na eno mesto, tudi tiste, ki so bile posnete iz kotov, ki jih niste videli.",
      sections: [
        {
          h2: "Zakaj enotna galerija za baby shower",
          paragraphs: [
            "Baby shower fotografiranje je razpršeno — 10–20 gostov, vsak s svojim telefonom. Če ni skupne galerije, dobite le tiste slike, ki vam jih gostje pošljejo naknadno — v praksi manj kot polovico.",
          ],
        },
        {
          h2: "Kako postaviti galerijo za baby shower",
          paragraphs: [
            "Postopek s Guestcamom:",
          ],
          bullets: [
            "1. Ustvarite galerijo z imenom prihajajočega otroka (npr. »Za mali Zoi«).",
            "2. Prenesite QR kodo v PDF-ju.",
            "3. Postavite kartice na osrednje mizice.",
            "4. Gostje skenirajo, pošljejo slike in kratka voščilna sporočila.",
          ],
        },
        {
          h2: "Ideje za baby shower galerijo",
          paragraphs: [
            "Nekaj kreativnih uporab, ki dodajo dogodku pomen:",
          ],
          bullets: [
            "Video voščila — vsak gost pošlje kratko sporočilo prihajajočemu otroku.",
            "Slike »ugani mamin trebuh« — z merilnim trakom.",
            "Fotografije daril iz različnih kotov.",
            "Skupna slika ob koncu, ki jo lahko projicirate.",
          ],
        },
        {
          h2: "Kaj narediti s slikami po baby showerju",
          paragraphs: [
            "Po dogodku vse slike prenesete v ZIP-u. Iz izbora lahko naredite majhno fizično knjigo, ki jo podarite otroku ob rojstvu — dokument prvih ur življenja, ko so vsi še komaj čakali.",
          ],
        },
      ],
      faq: [
        { q: "Ali je baby shower galerija zasebna?",
          a: "Da. Galerija je dostopna samo osebam, ki imajo neposredno povezavo ali QR kodo. Ni javno indeksirana." },
        { q: "Ali lahko gostje pošljejo videe?",
          a: "Da, s Plus paketom lahko naložijo do 100 video posnetkov. Videi so odlični za voščila prihajajočemu otroku." },
        { q: "Koliko slik lahko zberem?",
          a: "Brezplačno do 20 slik. Za baby shower z večimi gosti priporočamo Plus paket (49€, 5000 slik in 100 videov)." },
      ],
      ctaHeading: "Ustvarite galerijo za baby shower",
      ctaBody: "V 2 minutah — QR koda za mize, video voščila, projekcija v realnem času.",
      ctaButton: "Ustvari galerijo",
    },
  },
};

/** Fetch a topic entry or null if missing (returns null for languages we
 *  haven't translated yet — the route can then notFound()). */
export function getEventTopic(locale: EventLocale, key: EventTopicKey): EventTopicEntry | null {
  return EVENT_TOPICS[locale]?.[key] ?? null;
}

/** Every locale for a given topic that HAS an entry — used to build the
 *  hreflang alternates map on each rendered page. */
export function localesForTopic(key: EventTopicKey): EventLocale[] {
  const out: EventLocale[] = [];
  for (const loc of ["sl", "hr", "sr", "de", "en", "es"] as EventLocale[]) {
    if (EVENT_TOPICS[loc]?.[key]) out.push(loc);
  }
  return out;
}
