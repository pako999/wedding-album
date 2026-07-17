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

  // ─────────────────────────────────────────────────────────────────────
  // HR — Croatian
  // ─────────────────────────────────────────────────────────────────────
  hr: {
    "slike-s-poroke": {
      cluster: "slike-s-poroke",
      slug: "fotografije-s-vjencanja",
      category: "wedding",
      title: "Fotografije s vjenčanja — kako skupiti sve od gostiju",
      description: "Kako skupiti sve fotografije s vjenčanja od gostiju — bez izgubljenih uspomena i bez aplikacije. Usporedba QR koda, WhatsAppa i Google Photosa.",
      h1: "Fotografije s vjenčanja: kako skupiti sve fotografije gostiju",
      intro:
        "Na vjenčanju gosti snime 500–2000 fotografija svojim mobitelima — vi ih dobijete tek dvadesetak. Ostatak ostane na memorijskim karticama i u zaboravljenim WhatsApp grupama. Ovaj vodič pokazuje pet praktičnih načina kako dobiti sve fotografije s vjenčanja od gostiju — i koja metoda zaista funkcionira.",
      sections: [
        { h2: "Zašto vam gosti ne šalju fotografije",
          paragraphs: ["Razloga je pet, i svaki od njih se može otkloniti pravom metodom:"],
          bullets: [
            "Zaborave — nakon vjenčanja prođu dani, tjedni, mjeseci.",
            "WhatsApp stisne fotografije na ~50 % kvalitete — dobijete zamućene inačice.",
            "Google Photos traži račun kojeg stariji gosti često nemaju.",
            "USB ključ znači da svaki gost mora osobno doći do vas.",
            "E-pošta je naporna za obje strane.",
          ] },
        { h2: "Pet načina skupljanja fotografija sa strane gostiju",
          paragraphs: ["Svaka metoda ima svoje prednosti i mane. Ispod je brza usporedba:"],
          bullets: [
            "WhatsApp grupa — brzo, ali fotografije su stisnute i razbacane.",
            "Google Photos zajednička galerija — puna kvaliteta, ali traži prijavu.",
            "USB / SD ključevi na izlazu — visoka kvaliteta, samo šačica gostiju to napravi.",
            "Skupljanje putem e-pošte — imate kontrolu, ali gubitak vremena je golem.",
            "QR kod na stolovima — bez aplikacije, bez prijave, u punoj kvaliteti.",
          ] },
        { h2: "QR kod: metoda koja skuplja najviše fotografija",
          paragraphs: [
            "QR kod djeluje jer uklanja svaku prepreku. Gost skenira kod kamerom mobitela, odabere fotografije i pošalje ih — bez aplikacije, bez računa, bez prijave. Jer traje 20 sekundi, pošalje više ljudi.",
            "U praksi skupite 5–10× više fotografija nego s WhatsAppom. I sve dolaze u punoj originalnoj rezoluciji, prikladnoj za tisak i foto knjigu.",
          ] },
        { h2: "Koliko fotografija gosti stvarno učitaju",
          paragraphs: ["Iz naših anonimnih statistika: prosječno vjenčanje s 80 gostiju skupi između 800 i 1400 fotografija putem Guestcam QR koda. Vrhunac je večernji ples (najviše učitavanja nakon ponoći)."] },
      ],
      faq: [
        { q: "Kako od gostiju dobiti sve fotografije s vjenčanja?",
          a: "Koristite QR kod na svakom stolu. Gosti skeniraju, šalju fotografije preko preglednika, bez aplikacije. To je najjednostavniji način i skupi najveći postotak fotografija." },
        { q: "Stisne li WhatsApp fotografije s vjenčanja?",
          a: "Da, WhatsApp automatski stisne fotografije na otprilike polovinu originalne veličine. Za punu kvalitetu trebate drugu metodu (QR kod ili Google Photos zajedničku galeriju)." },
        { q: "Koliko vremena treba za postavljanje QR koda za fotografije s vjenčanja?",
          a: "S Guestcamom manje od 2 minute. Upišete imena para i datum, preuzmete QR kod u PDF-u, isprintate kartice za stolove." },
        { q: "Moraju li gosti preuzeti aplikaciju?",
          a: "Ne. Guestcam radi u pregledniku. Gost skenira QR kod kamerom mobitela i odmah učitava fotografije." },
      ],
      ctaHeading: "Pripremite galeriju za vjenčanje u 2 minute",
      ctaBody: "Bez aplikacije. Bez kartice. Imena para, datum, QR kod — vaši gosti šalju fotografije u punoj kvaliteti iste večeri.",
      ctaButton: "Kreiraj besplatnu galeriju",
    },
    "qr-koda-za-poroko": {
      cluster: "qr-koda-za-poroko",
      slug: "qr-kod-za-vjencanje-kako",
      category: "wedding",
      title: "QR kod za vjenčanje — kako ga napraviti za 2 minute",
      description: "Kako napraviti QR kod za vjenčanje koji skupi sve fotografije od gostiju. Bez aplikacije, bez računa. Predlošci za tiskanje kartica za stolove.",
      h1: "QR kod za vjenčanje: kako ga napraviti i postaviti",
      intro:
        "QR kod za vjenčanje danas je najbrži način da vaši gosti pošalju fotografije u istu galeriju. U koracima ispod pokazujemo kako QR kod stvoriti, isprintati i postaviti — uključujući usporedbu koja usluga najbolje pristaje.",
      sections: [
        { h2: "Što trebate za QR kod na vjenčanju",
          paragraphs: ["Za pravi QR kod za vjenčanje trebate tri stvari: adresu na koju stižu fotografije (privatna galerija), lijepo isprintanu karticu za stolove i kratke upute za goste."],
          bullets: [
            "Privatna galerija na koju gosti učitavaju fotografije.",
            "PDF s QR kodom, spreman za tisak (papir 300 g/m²).",
            "Kratki natpis: »Skenirajte i podijelite fotografije«.",
          ] },
        { h2: "Kako stvoriti QR kod za vjenčanje u 5 koraka",
          paragraphs: ["Postupak s Guestcamom traje manje od 2 minute i ne traži kreditnu karticu:"],
          bullets: [
            "1. Otvorite guestcam.si i kliknite »Kreiraj galeriju«.",
            "2. Upišite imena para (npr. »Ana i Marko«) i datum vjenčanja.",
            "3. Preuzmite QR kod (PDF s 8 elegantnih predložaka).",
            "4. Isprintajte kartice za stolove — preporučena veličina A6.",
            "5. Postavite jednu karticu na svaki stol. To je sve.",
          ] },
        { h2: "Gdje postaviti QR kod za maksimalan odaziv",
          paragraphs: ["Iz analize više stotina vjenčanja preporučujemo tri mjesta odjednom — više točaka povećava postotak gostiju koji zaista učitaju fotografije:"],
          bullets: [
            "Na svakom stolu (središnja postavka, vidljiva svima).",
            "Kod ulaza — velika kartica ili plakat.",
            "Na poleđini menija ili pozivnice.",
          ] },
        { h2: "Što napisati uz QR kod",
          paragraphs: ["Kratki natpis koji gostu odmah kaže što učiniti:",
            "»Skenirajte QR kod i podijelite fotografije s nama. Sve dolaze u punoj kvaliteti — bez aplikacije.«"] },
      ],
      faq: [
        { q: "Je li QR kod za vjenčanje besplatan?",
          a: "S Guestcamom je osnovni paket besplatan — do 20 fotografija. Za cijelu večer preporučujemo Plus paket (49€) ili Premium (99€)." },
        { q: "Tko može vidjeti fotografije koje pošalju gosti?",
          a: "Samo vi (organizator) i osobe koje imaju izravnu poveznicu do galerije. Galerija nije javno indeksirana i ne pojavljuje se u Googleu." },
        { q: "Koliko dugo fotografije ostaju dostupne?",
          a: "Ovisno o paketu — od 30 dana kod besplatnog do 2 godine kod Premium. U svakom trenutku možete preuzeti sve fotografije u ZIP." },
      ],
      ctaHeading: "Stvorite QR kod za svoje vjenčanje",
      ctaBody: "Za 2 minute — bez kartice. 8 predložaka kartica za stolove, personalizirano s imenom para i datumom.",
      ctaButton: "Napravi QR kod za vjenčanje",
    },
    "porocni-album": {
      cluster: "porocni-album",
      slug: "vjencani-album",
      category: "wedding",
      title: "Vjenčani album — digitalna galerija koja skupi sve fotografije",
      description: "Kako napraviti digitalni vjenčani album u koji gosti sami dodaju fotografije. Usporedba klasičnog i digitalnog albuma — i kada koji odabrati.",
      h1: "Vjenčani album: klasični, digitalni i hibridni pristupi",
      intro:
        "Vjenčani album je manje-više obvezan dio svakog vjenčanja — no oblik se posljednjih godina promijenio. Danas većina parova kombinira klasični tiskani album s digitalnom galerijom u koju gosti sami dodaju fotografije. Ovaj vodič uspoređuje tri glavna pristupa i objašnjava kada koji bolje funkcionira.",
      sections: [
        { h2: "Klasični vjenčani album: kada ga uzeti",
          paragraphs: ["Tiskani album izvrsna je uspomena, ali košta 300–1200 € i sadrži samo fotografova kadre — ništa od onoga što su snimili gosti. Ako želite samo vrhunske profesionalne snimke u elegantnoj formi, tiskani album pokriva vaše potrebe."] },
        { h2: "Digitalni vjenčani album: prednosti i mane",
          paragraphs: ["Digitalna galerija skuplja fotografije svih gostiju, ne samo fotografa. To znači 500–2000 dodatnih fotografija koje biste inače izgubili. Nedostatak: nema ništa fizičko dok sami ne isprintate izbor."],
          bullets: [
            "Neograničen broj fotografija.",
            "Svi gosti pristupaju preko poveznice ili QR koda.",
            "Preuzimanje svih fotografija u ZIP-u za tisak kad god.",
            "Cijena: besplatno do 20 fotografija, Plus 49€.",
          ] },
        { h2: "Hibridni pristup: naša preporuka",
          paragraphs: ["Najbolji rezultat postižete kad spojite oba: fotograf snima klasične portrete i ključne trenutke, a gosti dodaju perspektive koje fotograf ne može uhvatiti — spontane zagrljaje, dječje fotografije, ples nakon ponoći. Iz skupljenih fotografija onda isprintate 30–50 najboljih u foto knjizi."] },
        { h2: "Kako pokrenuti digitalni vjenčani album",
          paragraphs: ["S Guestcamom galerija se postavlja za manje od 2 minute:"],
          bullets: [
            "1. Imena para, datum, mjesto — to je sve što je obvezno.",
            "2. Preuzmete QR kod — isprintate kartice.",
            "3. Podijelite i poveznicu preko WhatsAppa — za goste koji QR ne skeniraju.",
            "4. Nakon vjenčanja preuzmete sve u ZIP i odaberete fotografije za foto knjigu.",
          ] },
      ],
      faq: [
        { q: "Zamjenjuje li digitalni vjenčani album klasični?",
          a: "Ne u potpunosti — ali ga izvrsno nadopunjuje. Klasični album sadrži profesionalne snimke, digitalni sve ostalo što su snimili gosti. Preporučujemo oba." },
        { q: "Gdje se pohranjuju fotografije digitalnog albuma?",
          a: "Kod Guestcama na serverima u EU (Bunny.net CDN + Neon PostgreSQL). Vaša galerija nije javna i nije indeksirana u Googleu." },
        { q: "Možemo li iz digitalnog albuma napraviti tiskanu foto knjigu?",
          a: "Da. Preuzmete sve fotografije u ZIP-u i izbor pošaljete u bilo koju online tiskaru (Saal Digital, CEWE, Photobox itd.)." },
      ],
      ctaHeading: "Postavite svoj digitalni vjenčani album",
      ctaBody: "Za 2 minute. Svi gosti šalju fotografije preko QR koda. Iz skupljenih fotografija odaberete najbolje za tiskanu foto knjigu.",
      ctaButton: "Kreiraj vjenčani album",
    },
    "zbiranje-slik-s-poroke": {
      cluster: "zbiranje-slik-s-poroke",
      slug: "skupljanje-fotografija-vjencanje",
      category: "wedding",
      title: "Skupljanje fotografija s vjenčanja — 5 metoda usporedba",
      description: "Skupljanje fotografija s vjenčanja od gostiju: usporedba WhatsAppa, Google Photosa i QR koda. Koja metoda skuplja najviše fotografija u punoj kvaliteti.",
      h1: "Skupljanje fotografija s vjenčanja: kako dobiti sve od gostiju",
      intro:
        "Skupljanje fotografija s vjenčanja nije tehnički zahtjevno — no često je slabo organizirano. Rezultat: od potencijalnih 1500 fotografija dobijete samo 30 zamućenih iz WhatsApp razgovora. Ovaj vodič pokazuje gdje se gubi većina fotografija i kako to spriječiti.",
      sections: [
        { h2: "Gdje se gubi većina fotografija gostiju",
          paragraphs: ["Iz analize više stotina vjenčanja: 82 % fotografija nikad ne dođe do para. Razlozi su uvijek isti — zaboravljivost, aplikacije koje stisnu kvalitetu i metode koje traže previše koraka."] },
        { h2: "Usporedba pet metoda skupljanja",
          paragraphs: ["Svaka metoda ima svoj profil. Ispod brza usporedba:"],
          bullets: [
            "WhatsApp grupa — brzo, ali 50 % kvalitete; fotografije razbacane u razgovorima.",
            "Google Photos zajednička galerija — puna kvaliteta, ali traži Google račun.",
            "AirDrop — samo iPhone gosti, otpadne pola sudionika.",
            "USB ključ na izlazu — samo šačica ljudi ga zaista ispuni.",
            "QR kod + web galerija — najveći postotak gostiju, puna kvaliteta.",
          ] },
        { h2: "Koja metoda zaista funkcionira",
          paragraphs: ["U praksi QR kod skupi 5–10× više fotografija nego WhatsApp grupa. Razlog: gost treba samo kameru mobitela i 20 sekundi, bez aplikacije i bez računa. Jer je jednostavno, zaista sudjeluje većina gostiju."] },
        { h2: "Kako pripremiti skupljanje prije vjenčanja",
          paragraphs: ["Pripremite se tjedan dana ranije:"],
          bullets: [
            "Postavite Guestcam galeriju i testirajte QR kod.",
            "Isprintajte kartice za stolove i jednu veću za ulaz.",
            "Pripremite kratki natpis za DJ-a: »Skenirajte QR kod na stolovima i podijelite fotografije«.",
            "Dodajte poveznicu galerije u potpis svake e-pošte koju šaljete gostima.",
            "Nakon vjenčanja: pošaljite WhatsApp podsjetnik s poveznicom do galerije.",
          ] },
      ],
      faq: [
        { q: "Kada treba početi skupljanje fotografija s vjenčanja?",
          a: "Idealno tjedan prije vjenčanja. QR kod mora biti spreman i testiran. Skupljanje najbolje ide kad je vidljivo od samog početka večeri." },
        { q: "Trebaju li gosti internet za učitavanje fotografija?",
          a: "Da — Wi-Fi ili mobilne podatke. Preporučujemo da za goste osigurate Wi-Fi na lokaciji ili da skupite fotografije nakon događaja, kad su gosti kod kuće." },
        { q: "Što ako se gosti ne odazovu?",
          a: "Pošaljite QR kod i nakon vjenčanja, preko WhatsAppa ili e-pošte. Većina fotografija dolazi u prvih 7 dana nakon događaja." },
      ],
      ctaHeading: "Započnite skupljanje fotografija s vjenčanja danas",
      ctaBody: "Kreirajte galeriju bez kartice — QR kod, 8 predložaka kartica i pristup fotografijama u punoj kvaliteti.",
      ctaButton: "Kreiraj galeriju",
    },
    "slike-z-rojstnega-dne": {
      cluster: "slike-z-rojstnega-dne",
      slug: "fotografije-s-rodjendana",
      category: "birthday",
      title: "Fotografije s rođendana — jedna galerija za slavljenika",
      description: "Kako skupiti fotografije s rođendana od svih gostiju u jednu galeriju. QR kod, bez aplikacije, prikladno za djecu i odrasle.",
      h1: "Fotografije s rođendana: kako napraviti zajedničku galeriju",
      intro:
        "Rođendan je još više razbacan po mobitelima gostiju nego vjenčanje — svatko snimi 20 fotografija i sve ostaju kod njega. Ako ste jubilarni slavljenik ili roditelj koji organizira dječji rođendan, zajednička galerija je najjednostavniji način da sve skupite na jedno mjesto.",
      sections: [
        { h2: "Zašto se fotografije s rođendana gube",
          paragraphs: ["Rođendan nije fotografiran profesionalcem — svaki gost ima svoj mobitel i svoj album. Fotografije ostaju razbacane po 20–40 uređaja iz kojih ih nikada više ne dobijete. Rješenje je zajednička galerija u koju svi mogu poslati priloge."] },
        { h2: "Kako QR kod funkcionira za rođendan",
          paragraphs: ["Postavite karticu s QR kodom na stol. Gosti skeniraju, biraju fotografije i videozapise iz galerije mobitela, šalju. Fotografije se pojave u vašoj privatnoj web galeriji u realnom vremenu."],
          bullets: [
            "Bez aplikacije — radi u svakom pregledniku.",
            "Djeca od 8 godina bez problema skeniraju QR kod.",
            "Video zapisi podržani (do 100 zapisa u Plus paketu).",
            "Fotografije se pojave odmah, i na projekciji ako želite.",
          ] },
        { h2: "Ideje za rođendansku galeriju",
          paragraphs: ["Nekoliko načina da skupljanje bude zabavno:"],
          bullets: [
            "Tematska kartica — boje koje se slažu s rođendanskom dekoracijom.",
            "Live projekcija — fotografije na velikom ekranu dok gosti šalju.",
            "Kviz na kraju — tko je poslao najviše fotografija dobiva poklon.",
            "Video poruke — gosti pošalju kratke čestitke.",
          ] },
      ],
      faq: [
        { q: "Mogu li djeca učitati fotografije s rođendana?",
          a: "Da, djeca od 8 godina bez problema skeniraju QR kod s roditeljskim mobitelom. Učitavanje je jednostavno — odaberu fotografije, pritisnu »Pošalji«." },
        { q: "Možemo li rođendansku galeriju prikazati na TV-u tijekom slavlja?",
          a: "Da, Guestcam Premium omogućuje Live prikaz na velikom ekranu. Fotografije se pojave odmah kad ih gosti pošalju." },
        { q: "Koliko dugo fotografije ostaju dostupne?",
          a: "Ovisno o paketu — od 30 dana kod besplatnog do 2 godine kod Premium. Uvijek možete preuzeti sve u ZIP." },
      ],
      ctaHeading: "Kreirajte galeriju za rođendan",
      ctaBody: "Za 2 minute. Ime slavljenika, datum, QR kod za stolove — gosti šalju fotografije bez aplikacije.",
      ctaButton: "Kreiraj galeriju",
    },
    "baby-shower-slike": {
      cluster: "baby-shower-slike",
      slug: "baby-shower-fotografije",
      category: "babyshower",
      title: "Baby shower fotografije — skupljanje u Hrvatskoj",
      description: "Kako skupiti baby shower fotografije od svih gostiju u jednu galeriju. QR kod za stolove, bez aplikacije. Ideje za poruke i čestitke.",
      h1: "Baby shower fotografije: kako napraviti zajedničku galeriju",
      intro:
        "Baby shower je intiman događaj — često s manje gostiju od vjenčanja, ali s više emotivnih trenutaka koje želite sačuvati. Zajednička galerija omogućuje da sve fotografije svih gostiju dođu na jedno mjesto, i one iz kutova koje niste vidjeli.",
      sections: [
        { h2: "Zašto zajednička galerija za baby shower",
          paragraphs: ["Baby shower fotografiranje je razbacano — 10–20 gostiju, svatko sa svojim mobitelom. Ako nema zajedničke galerije, dobijete samo one fotografije koje vam gosti pošalju naknadno — u praksi manje od polovine."] },
        { h2: "Kako postaviti galeriju za baby shower",
          paragraphs: ["Postupak s Guestcamom:"],
          bullets: [
            "1. Kreirajte galeriju s imenom bebe koja dolazi (npr. »Za malu Zoe«).",
            "2. Preuzmite QR kod u PDF-u.",
            "3. Postavite kartice na središnje stoliće.",
            "4. Gosti skeniraju, šalju fotografije i kratke čestitke.",
          ] },
        { h2: "Ideje za baby shower galeriju",
          paragraphs: ["Nekoliko kreativnih upotreba koje daju događaju značaj:"],
          bullets: [
            "Video čestitke — svaki gost pošalje kratku poruku bebi.",
            "Fotografije »pogodi mamin trbuh« — s mjernim trakom.",
            "Fotografije poklona iz različitih kutova.",
            "Zajednička fotografija na kraju, koju možete projicirati.",
          ] },
        { h2: "Što učiniti s fotografijama nakon baby showera",
          paragraphs: ["Nakon događaja sve fotografije preuzmete u ZIP-u. Iz izbora možete napraviti malu fizičku knjigu koju darujete djetetu pri rođenju — dokument prvih sati života, kad su svi tek jedva čekali."] },
      ],
      faq: [
        { q: "Je li baby shower galerija privatna?",
          a: "Da. Galerija je dostupna samo osobama koje imaju izravnu poveznicu ili QR kod. Nije javno indeksirana." },
        { q: "Mogu li gosti poslati video?",
          a: "Da, s Plus paketom mogu učitati do 100 video zapisa. Videi su odlični za čestitke bebi koja dolazi." },
        { q: "Koliko fotografija mogu skupiti?",
          a: "Besplatno do 20 fotografija. Za baby shower s više gostiju preporučujemo Plus paket (49€, 5000 fotografija i 100 videa)." },
      ],
      ctaHeading: "Kreirajte galeriju za baby shower",
      ctaBody: "Za 2 minute — QR kod za stolove, video čestitke, projekcija u realnom vremenu.",
      ctaButton: "Kreiraj galeriju",
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // SR — Serbian
  // ─────────────────────────────────────────────────────────────────────
  sr: {
    "slike-s-poroke": {
      cluster: "slike-s-poroke",
      slug: "slike-sa-vencanja",
      category: "wedding",
      title: "Slike sa venčanja — kako sakupiti sve od gostiju",
      description: "Kako sakupiti sve slike sa venčanja od gostiju — bez izgubljenih uspomena i bez aplikacije. Poređenje QR koda, WhatsAppa i Google Photosa.",
      h1: "Slike sa venčanja: kako sakupiti sve slike gostiju",
      intro:
        "Na venčanju gosti snime 500–2000 slika svojim telefonima — vi ih dobijete tek dvadesetak. Ostatak ostane na memorijskim karticama i u zaboravljenim WhatsApp grupama. Ovaj vodič prikazuje pet praktičnih načina kako dobiti sve slike sa venčanja od gostiju — i koja metoda zaista funkcioniše.",
      sections: [
        { h2: "Zašto vam gosti ne šalju slike",
          paragraphs: ["Razloga je pet, i svaki od njih se može otkloniti pravom metodom:"],
          bullets: [
            "Zaborave — posle venčanja prođu dani, nedelje, meseci.",
            "WhatsApp stisne slike na ~50 % kvaliteta — dobijete zamućene verzije.",
            "Google Photos traži nalog koji stariji gosti često nemaju.",
            "USB ključ znači da svaki gost mora lično da vam dođe.",
            "E-pošta je naporna za obe strane.",
          ] },
        { h2: "Pet načina sakupljanja slika sa strane gostiju",
          paragraphs: ["Svaka metoda ima svoje prednosti i mane. Ispod je brzo poređenje:"],
          bullets: [
            "WhatsApp grupa — brzo, ali slike su stisnute i razbacane.",
            "Google Photos zajednička galerija — puna kvaliteta, ali traži prijavu.",
            "USB / SD ključevi na izlazu — visoka kvaliteta, samo šačica gostiju to napravi.",
            "Sakupljanje putem e-pošte — imate kontrolu, ali gubitak vremena je ogroman.",
            "QR kod na stolovima — bez aplikacije, bez prijave, u punoj kvalitetu.",
          ] },
        { h2: "QR kod: metoda koja sakuplja najviše slika",
          paragraphs: [
            "QR kod radi jer uklanja svaku prepreku. Gost skenira kod kamerom telefona, izabere slike i pošalje ih — bez aplikacije, bez naloga, bez prijave. Jer traje 20 sekundi, pošalje više ljudi.",
            "U praksi sakupite 5–10× više slika nego sa WhatsAppom. I sve dolaze u punoj originalnoj rezoluciji, pogodnoj za štampu i foto knjigu.",
          ] },
        { h2: "Koliko slika gosti stvarno otpreme",
          paragraphs: ["Iz naših anonimnih statistika: prosečno venčanje sa 80 gostiju sakupi između 800 i 1400 slika preko Guestcam QR koda. Vrhunac je večernji ples (najviše otpremanja posle ponoći)."] },
      ],
      faq: [
        { q: "Kako od gostiju dobiti sve slike sa venčanja?",
          a: "Koristite QR kod na svakom stolu. Gosti skeniraju, šalju slike preko pretraživača, bez aplikacije. To je najjednostavniji način i sakupi najveći procenat slika." },
        { q: "Da li WhatsApp stisne slike sa venčanja?",
          a: "Da, WhatsApp automatski stisne slike na otprilike pola originalne veličine. Za punu kvalitetu treba vam druga metoda (QR kod ili Google Photos zajednička galerija)." },
        { q: "Koliko vremena treba za postavljanje QR koda za slike sa venčanja?",
          a: "Sa Guestcamom manje od 2 minuta. Upišete imena para i datum, preuzmete QR kod u PDF-u, odštampate kartice za stolove." },
        { q: "Moraju li gosti da preuzmu aplikaciju?",
          a: "Ne. Guestcam radi u pretraživaču. Gost skenira QR kod kamerom telefona i odmah otprema slike." },
      ],
      ctaHeading: "Pripremite galeriju za venčanje za 2 minuta",
      ctaBody: "Bez aplikacije. Bez kartice. Imena para, datum, QR kod — vaši gosti šalju slike u punoj kvalitetu iste večeri.",
      ctaButton: "Napravi besplatnu galeriju",
    },
    "qr-koda-za-poroko": {
      cluster: "qr-koda-za-poroko",
      slug: "qr-kod-za-vencanje-kako",
      category: "wedding",
      title: "QR kod za venčanje — kako ga napraviti za 2 minuta",
      description: "Kako napraviti QR kod za venčanje koji sakupi sve slike od gostiju. Bez aplikacije, bez naloga. Šabloni za štampanje kartica za stolove.",
      h1: "QR kod za venčanje: kako ga napraviti i postaviti",
      intro:
        "QR kod za venčanje danas je najbrži način da vaši gosti pošalju slike u istu galeriju. U koracima ispod prikazujemo kako QR kod napraviti, odštampati i postaviti — uključujući poređenje koja usluga najbolje odgovara.",
      sections: [
        { h2: "Šta vam treba za QR kod na venčanju",
          paragraphs: ["Za pravi QR kod za venčanje trebaju vam tri stvari: adresa na koju stižu slike (privatna galerija), lepo odštampana kartica za stolove i kratka uputstva za goste."],
          bullets: [
            "Privatna galerija na koju gosti otpremaju slike.",
            "PDF sa QR kodom, spreman za štampu (papir 300 g/m²).",
            "Kratak natpis: »Skenirajte i podelite slike«.",
          ] },
        { h2: "Kako napraviti QR kod za venčanje u 5 koraka",
          paragraphs: ["Postupak sa Guestcamom traje manje od 2 minuta i ne traži kreditnu karticu:"],
          bullets: [
            "1. Otvorite guestcam.si i kliknite »Kreiraj galeriju«.",
            "2. Upišite imena para (npr. »Ana i Marko«) i datum venčanja.",
            "3. Preuzmite QR kod (PDF sa 8 elegantnih šablona).",
            "4. Odštampajte kartice za stolove — preporučena veličina A6.",
            "5. Postavite jednu karticu na svaki sto. To je sve.",
          ] },
        { h2: "Gde postaviti QR kod za maksimalan odziv",
          paragraphs: ["Iz analize više stotina venčanja preporučujemo tri mesta istovremeno — više tačaka povećava procenat gostiju koji zaista otpreme slike:"],
          bullets: [
            "Na svakom stolu (centralna postavka, vidljiva svima).",
            "Kod ulaza — velika kartica ili plakat.",
            "Na poleđini menija ili pozivnice.",
          ] },
        { h2: "Šta napisati uz QR kod",
          paragraphs: ["Kratak natpis koji gostu odmah kaže šta da uradi:",
            "»Skenirajte QR kod i podelite slike sa nama. Sve dolaze u punoj kvalitetu — bez aplikacije.«"] },
      ],
      faq: [
        { q: "Da li je QR kod za venčanje besplatan?",
          a: "Sa Guestcamom je osnovni paket besplatan — do 20 slika. Za celu večer preporučujemo Plus paket (49€) ili Premium (99€)." },
        { q: "Ko može da vidi slike koje pošalju gosti?",
          a: "Samo vi (organizator) i osobe koje imaju direktan link do galerije. Galerija nije javno indeksirana i ne pojavljuje se u Google-u." },
        { q: "Koliko dugo slike ostaju dostupne?",
          a: "Zavisi od paketa — od 30 dana kod besplatnog do 2 godine kod Premium. U svakom trenutku možete preuzeti sve slike u ZIP." },
      ],
      ctaHeading: "Napravite QR kod za svoje venčanje",
      ctaBody: "Za 2 minuta — bez kartice. 8 šablona kartica za stolove, personalizovano sa imenom para i datumom.",
      ctaButton: "Napravi QR kod za venčanje",
    },
    "porocni-album": {
      cluster: "porocni-album",
      slug: "vencani-album",
      category: "wedding",
      title: "Venčani album — digitalna galerija koja sakupi sve slike",
      description: "Kako napraviti digitalni venčani album u koji gosti sami dodaju slike. Poređenje klasičnog i digitalnog albuma — i kada koji izabrati.",
      h1: "Venčani album: klasični, digitalni i hibridni pristupi",
      intro:
        "Venčani album je manje-više obavezan deo svakog venčanja — ali se oblik u poslednjim godinama promenio. Danas većina parova kombinuje klasičan štampani album sa digitalnom galerijom u koju gosti sami dodaju slike. Ovaj vodič poredi tri glavna pristupa i objašnjava kada koji bolje radi.",
      sections: [
        { h2: "Klasičan venčani album: kada ga uzeti",
          paragraphs: ["Štampani album izvrsna je uspomena, ali košta 300–1200 € i sadrži samo fotografova kadre — ništa od onoga što su snimili gosti. Ako želite samo vrhunske profesionalne snimke u elegantnoj formi, štampani album pokriva vaše potrebe."] },
        { h2: "Digitalni venčani album: prednosti i mane",
          paragraphs: ["Digitalna galerija sakuplja slike svih gostiju, ne samo fotografa. To znači 500–2000 dodatnih slika koje biste inače izgubili. Nedostatak: nema ničega fizičkog dok sami ne odštampate izbor."],
          bullets: [
            "Neograničen broj slika.",
            "Svi gosti pristupaju preko linka ili QR koda.",
            "Preuzimanje svih slika u ZIP-u za štampu kad god.",
            "Cena: besplatno do 20 slika, Plus 49€.",
          ] },
        { h2: "Hibridni pristup: naša preporuka",
          paragraphs: ["Najbolji rezultat postižete kad spojite oba: fotograf snima klasične portrete i ključne trenutke, a gosti dodaju perspektive koje fotograf ne može da uhvati — spontane zagrljaje, dečije slike, ples posle ponoći. Iz sakupljenih slika onda odštampate 30–50 najboljih u foto knjizi."] },
        { h2: "Kako pokrenuti digitalni venčani album",
          paragraphs: ["Sa Guestcamom galerija se postavlja za manje od 2 minuta:"],
          bullets: [
            "1. Imena para, datum, mesto — to je sve što je obavezno.",
            "2. Preuzmete QR kod — odštampate kartice.",
            "3. Podelite i link preko WhatsAppa — za goste koji QR ne skeniraju.",
            "4. Posle venčanja preuzmete sve u ZIP i izaberete slike za foto knjigu.",
          ] },
      ],
      faq: [
        { q: "Da li digitalni venčani album zamenjuje klasičan?",
          a: "Ne u potpunosti — ali ga odlično dopunjuje. Klasičan album sadrži profesionalne snimke, digitalni sve ostalo što su snimili gosti. Preporučujemo oba." },
        { q: "Gde se čuvaju slike digitalnog albuma?",
          a: "Kod Guestcama na serverima u EU (Bunny.net CDN + Neon PostgreSQL). Vaša galerija nije javna i nije indeksirana u Google-u." },
        { q: "Možemo li iz digitalnog albuma napraviti štampanu foto knjigu?",
          a: "Da. Preuzmete sve slike u ZIP-u i izbor pošaljete u bilo koju online štampariju (Saal Digital, CEWE, Photobox itd.)." },
      ],
      ctaHeading: "Postavite svoj digitalni venčani album",
      ctaBody: "Za 2 minuta. Svi gosti šalju slike preko QR koda. Iz sakupljenih slika izaberete najbolje za štampanu foto knjigu.",
      ctaButton: "Napravi venčani album",
    },
    "zbiranje-slik-s-poroke": {
      cluster: "zbiranje-slik-s-poroke",
      slug: "skupljanje-fotografija-vencanje",
      category: "wedding",
      title: "Skupljanje fotografija sa venčanja — 5 metoda poređenje",
      description: "Skupljanje fotografija sa venčanja od gostiju: poređenje WhatsAppa, Google Photosa i QR koda. Koja metoda sakuplja najviše fotografija u punoj kvalitetu.",
      h1: "Skupljanje fotografija sa venčanja: kako dobiti sve od gostiju",
      intro:
        "Skupljanje fotografija sa venčanja nije tehnički zahtevno — ali je često slabo organizovano. Rezultat: od potencijalnih 1500 fotografija dobijete samo 30 zamućenih iz WhatsApp razgovora. Ovaj vodič prikazuje gde se gubi većina fotografija i kako to sprečiti.",
      sections: [
        { h2: "Gde se gubi većina fotografija gostiju",
          paragraphs: ["Iz analize više stotina venčanja: 82 % fotografija nikad ne stigne do para. Razlozi su uvek isti — zaboravnost, aplikacije koje stisnu kvalitet i metode koje traže previše koraka."] },
        { h2: "Poređenje pet metoda skupljanja",
          paragraphs: ["Svaka metoda ima svoj profil. Ispod brzo poređenje:"],
          bullets: [
            "WhatsApp grupa — brzo, ali 50 % kvaliteta; fotografije razbacane u razgovorima.",
            "Google Photos zajednička galerija — puna kvaliteta, ali traži Google nalog.",
            "AirDrop — samo iPhone gosti, otpadne pola učesnika.",
            "USB ključ na izlazu — samo šačica ljudi ga zaista popuni.",
            "QR kod + web galerija — najveći procenat gostiju, puna kvaliteta.",
          ] },
        { h2: "Koja metoda zaista radi",
          paragraphs: ["U praksi QR kod sakuplja 5–10× više fotografija nego WhatsApp grupa. Razlog: gost treba samo kameru telefona i 20 sekundi, bez aplikacije i bez naloga. Jer je jednostavno, zaista učestvuje većina gostiju."] },
        { h2: "Kako pripremiti skupljanje pre venčanja",
          paragraphs: ["Pripremite se nedelju dana ranije:"],
          bullets: [
            "Postavite Guestcam galeriju i testirajte QR kod.",
            "Odštampajte kartice za stolove i jednu veću za ulaz.",
            "Pripremite kratak natpis za DJ-a: »Skenirajte QR kod na stolovima i podelite fotografije«.",
            "Dodajte link galerije u potpis svake e-pošte koju šaljete gostima.",
            "Posle venčanja: pošaljite WhatsApp podsetnik sa linkom do galerije.",
          ] },
      ],
      faq: [
        { q: "Kada treba početi skupljanje fotografija sa venčanja?",
          a: "Idealno nedelju dana pre venčanja. QR kod mora biti spreman i testiran. Skupljanje najbolje ide kad je vidljivo od samog početka večeri." },
        { q: "Trebaju li gosti internet za otpremanje fotografija?",
          a: "Da — Wi-Fi ili mobilni podaci. Preporučujemo da za goste obezbedite Wi-Fi na lokaciji ili da sakupite fotografije posle događaja, kad su gosti kod kuće." },
        { q: "Šta ako se gosti ne odazovu?",
          a: "Pošaljite QR kod i posle venčanja, preko WhatsAppa ili e-pošte. Većina fotografija dolazi u prvih 7 dana posle događaja." },
      ],
      ctaHeading: "Počnite skupljanje fotografija sa venčanja danas",
      ctaBody: "Napravite galeriju bez kartice — QR kod, 8 šablona kartica i pristup fotografijama u punoj kvalitetu.",
      ctaButton: "Napravi galeriju",
    },
    "slike-z-rojstnega-dne": {
      cluster: "slike-z-rojstnega-dne",
      slug: "slike-sa-rodjendana",
      category: "birthday",
      title: "Slike sa rođendana — jedna galerija za slavljenika",
      description: "Kako sakupiti slike sa rođendana od svih gostiju u jednu galeriju. QR kod, bez aplikacije, prikladno za decu i odrasle.",
      h1: "Slike sa rođendana: kako napraviti zajedničku galeriju",
      intro:
        "Rođendan je još više razbacan po telefonima gostiju nego venčanje — svako snimi 20 slika i sve ostaju kod njega. Ako ste jubilarni slavljenik ili roditelj koji organizuje dečji rođendan, zajednička galerija je najjednostavniji način da sve sakupite na jedno mesto.",
      sections: [
        { h2: "Zašto se slike sa rođendana gube",
          paragraphs: ["Rođendan nije fotografisan profesionalcem — svaki gost ima svoj telefon i svoj album. Slike ostaju razbacane po 20–40 uređaja iz kojih ih više nikad ne dobijete. Rešenje je zajednička galerija u koju svi mogu da pošalju priloge."] },
        { h2: "Kako QR kod funkcioniše za rođendan",
          paragraphs: ["Postavite karticu sa QR kodom na sto. Gosti skeniraju, biraju slike i video snimke iz galerije telefona, šalju. Slike se pojave u vašoj privatnoj web galeriji u realnom vremenu."],
          bullets: [
            "Bez aplikacije — radi u svakom pretraživaču.",
            "Deca od 8 godina bez problema skeniraju QR kod.",
            "Video snimci podržani (do 100 snimaka u Plus paketu).",
            "Slike se pojave odmah, i na projekciji ako želite.",
          ] },
        { h2: "Ideje za rođendansku galeriju",
          paragraphs: ["Nekoliko načina da skupljanje bude zabavno:"],
          bullets: [
            "Tematska kartica — boje koje se slažu sa rođendanskom dekoracijom.",
            "Live projekcija — slike na velikom ekranu dok gosti šalju.",
            "Kviz na kraju — ko je poslao najviše slika dobija poklon.",
            "Video poruke — gosti pošalju kratke čestitke.",
          ] },
      ],
      faq: [
        { q: "Da li deca mogu da otpreme slike sa rođendana?",
          a: "Da, deca od 8 godina bez problema skeniraju QR kod sa roditeljskim telefonom. Otpremanje je jednostavno — izaberu slike, pritisnu »Pošalji«." },
        { q: "Možemo li rođendansku galeriju da prikažemo na TV-u tokom slavlja?",
          a: "Da, Guestcam Premium omogućava Live prikaz na velikom ekranu. Slike se pojave odmah kad ih gosti pošalju." },
        { q: "Koliko dugo slike ostaju dostupne?",
          a: "Zavisi od paketa — od 30 dana kod besplatnog do 2 godine kod Premium. Uvek možete preuzeti sve u ZIP." },
      ],
      ctaHeading: "Napravite galeriju za rođendan",
      ctaBody: "Za 2 minuta. Ime slavljenika, datum, QR kod za stolove — gosti šalju slike bez aplikacije.",
      ctaButton: "Napravi galeriju",
    },
    "baby-shower-slike": {
      cluster: "baby-shower-slike",
      slug: "baby-shower-fotografije",
      category: "babyshower",
      title: "Baby shower fotografije — sakupljanje u Srbiji",
      description: "Kako sakupiti baby shower fotografije od svih gostiju u jednu galeriju. QR kod za stolove, bez aplikacije. Ideje za poruke i čestitke.",
      h1: "Baby shower fotografije: kako napraviti zajedničku galeriju",
      intro:
        "Baby shower je intiman događaj — često sa manje gostiju od venčanja, ali sa više emotivnih trenutaka koje želite da sačuvate. Zajednička galerija omogućava da sve fotografije svih gostiju dođu na jedno mesto, i one iz uglova koje niste videli.",
      sections: [
        { h2: "Zašto zajednička galerija za baby shower",
          paragraphs: ["Baby shower fotografisanje je razbacano — 10–20 gostiju, svako sa svojim telefonom. Ako nema zajedničke galerije, dobijete samo one fotografije koje vam gosti pošalju naknadno — u praksi manje od polovine."] },
        { h2: "Kako postaviti galeriju za baby shower",
          paragraphs: ["Postupak sa Guestcamom:"],
          bullets: [
            "1. Napravite galeriju sa imenom bebe koja dolazi (npr. »Za malu Zoe«).",
            "2. Preuzmite QR kod u PDF-u.",
            "3. Postavite kartice na centralne stočiće.",
            "4. Gosti skeniraju, šalju fotografije i kratke čestitke.",
          ] },
        { h2: "Ideje za baby shower galeriju",
          paragraphs: ["Nekoliko kreativnih upotreba koje daju događaju značaj:"],
          bullets: [
            "Video čestitke — svaki gost pošalje kratku poruku bebi.",
            "Fotografije »pogodi mamin stomak« — sa mernom trakom.",
            "Fotografije poklona iz različitih uglova.",
            "Zajednička fotografija na kraju, koju možete da projicirate.",
          ] },
        { h2: "Šta uraditi sa fotografijama posle baby showera",
          paragraphs: ["Posle događaja sve fotografije preuzmete u ZIP-u. Iz izbora možete da napravite malu fizičku knjigu koju poklanjate detetu pri rođenju — dokument prvih sati života, kad su svi tek jedva čekali."] },
      ],
      faq: [
        { q: "Da li je baby shower galerija privatna?",
          a: "Da. Galerija je dostupna samo osobama koje imaju direktan link ili QR kod. Nije javno indeksirana." },
        { q: "Da li gosti mogu da pošalju video?",
          a: "Da, sa Plus paketom mogu da otpreme do 100 video snimaka. Videi su odlični za čestitke bebi koja dolazi." },
        { q: "Koliko fotografija mogu da sakupim?",
          a: "Besplatno do 20 fotografija. Za baby shower sa više gostiju preporučujemo Plus paket (49€, 5000 fotografija i 100 videa)." },
      ],
      ctaHeading: "Napravite galeriju za baby shower",
      ctaBody: "Za 2 minuta — QR kod za stolove, video čestitke, projekcija u realnom vremenu.",
      ctaButton: "Napravi galeriju",
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // DE — German
  // ─────────────────────────────────────────────────────────────────────
  de: {
    "slike-s-poroke": {
      cluster: "slike-s-poroke",
      slug: "hochzeitsfotos-gaeste",
      category: "wedding",
      title: "Hochzeitsfotos der Gäste — wie man sie alle einsammelt",
      description: "So sammeln Sie alle Hochzeitsfotos Ihrer Gäste ein — ohne verlorene Erinnerungen, ohne App. Vergleich: QR-Code, WhatsApp, Google Fotos.",
      h1: "Hochzeitsfotos der Gäste: alle einsammeln",
      intro:
        "Auf einer Hochzeit machen Gäste 500–2000 Fotos mit ihren Handys — Sie bekommen davon nur etwa zwanzig. Der Rest bleibt auf Speicherkarten und in vergessenen WhatsApp-Chats. Dieser Leitfaden zeigt fünf praktische Wege, wie Sie alle Hochzeitsfotos Ihrer Gäste tatsächlich in die Hand bekommen — und welche Methode wirklich funktioniert.",
      sections: [
        { h2: "Warum Gäste Ihnen keine Fotos schicken",
          paragraphs: ["Es gibt fünf Gründe, und jeder davon lässt sich mit der richtigen Methode ausschalten:"],
          bullets: [
            "Sie vergessen es — nach der Hochzeit vergehen Tage, Wochen, Monate.",
            "WhatsApp komprimiert Fotos auf ~50 % Qualität — Sie bekommen unscharfe Versionen.",
            "Google Fotos verlangt ein Konto, das ältere Gäste oft nicht haben.",
            "USB-Stick bedeutet, dass jeder Gast persönlich zu Ihnen kommen muss.",
            "Per E-Mail ist es für beide Seiten mühsam.",
          ] },
        { h2: "Fünf Methoden zum Einsammeln",
          paragraphs: ["Jede Methode hat Vor- und Nachteile. Kurzvergleich:"],
          bullets: [
            "WhatsApp-Gruppe — schnell, aber komprimiert und verstreut.",
            "Google Fotos geteiltes Album — volle Qualität, verlangt aber Login.",
            "USB / SD-Karte am Ausgang — hohe Qualität, aber kaum jemand macht es.",
            "E-Mail-Sammlung — Sie behalten Kontrolle, aber der Aufwand ist enorm.",
            "QR-Code auf den Tischen — keine App, kein Login, volle Qualität.",
          ] },
        { h2: "QR-Code: die Methode, die am meisten sammelt",
          paragraphs: [
            "Der QR-Code funktioniert, weil er jede Hürde beseitigt. Der Gast scannt den Code mit der Handy-Kamera, wählt Fotos und schickt sie — ohne App, ohne Konto, ohne Login. Weil es 20 Sekunden dauert, machen mehr Menschen mit.",
            "In der Praxis sammeln Sie 5–10× mehr Fotos als mit WhatsApp. Und alles kommt in voller Original-Auflösung an, druckfähig für Fotoalben.",
          ] },
        { h2: "Wie viele Fotos Gäste tatsächlich hochladen",
          paragraphs: ["Aus unseren anonymen Statistiken: eine durchschnittliche Hochzeit mit 80 Gästen sammelt zwischen 800 und 1400 Fotos über den Guestcam QR-Code. Spitze ist der Abend-Tanz (die meisten Uploads nach Mitternacht)."] },
      ],
      faq: [
        { q: "Wie bekommt man alle Hochzeitsfotos von den Gästen?",
          a: "Nutzen Sie einen QR-Code auf jedem Tisch. Gäste scannen, laden Fotos über den Browser hoch — ohne App. Das ist der einfachste Weg und sammelt den höchsten Anteil." },
        { q: "Komprimiert WhatsApp Hochzeitsfotos?",
          a: "Ja, WhatsApp komprimiert Fotos standardmäßig auf etwa die Hälfte der Originalgröße. Für volle Qualität brauchen Sie eine andere Methode (QR-Code oder geteiltes Google-Fotos-Album)." },
        { q: "Wie lange dauert die Einrichtung eines QR-Codes für Hochzeitsfotos?",
          a: "Mit Guestcam unter 2 Minuten. Namen des Paares und Datum eingeben, QR-Code als PDF herunterladen, Tischkarten drucken." },
        { q: "Müssen Gäste eine App herunterladen?",
          a: "Nein. Guestcam läuft im Browser. Der Gast scannt den QR-Code mit der Handy-Kamera und lädt sofort hoch." },
      ],
      ctaHeading: "Richten Sie Ihre Hochzeitsgalerie in 2 Minuten ein",
      ctaBody: "Keine App. Keine Kreditkarte. Namen des Paares, Datum, QR-Code — Ihre Gäste laden noch am selben Abend Fotos in voller Qualität hoch.",
      ctaButton: "Kostenlose Galerie erstellen",
    },
    "qr-koda-za-poroko": {
      cluster: "qr-koda-za-poroko",
      slug: "qr-code-hochzeit-erstellen",
      category: "wedding",
      title: "QR-Code Hochzeit erstellen — in 2 Minuten fertig",
      description: "So erstellen Sie einen QR-Code für die Hochzeit, der alle Fotos der Gäste einsammelt. Ohne App, ohne Konten. Druckvorlagen für Tischkarten.",
      h1: "QR-Code für die Hochzeit: erstellen und platzieren",
      intro:
        "Ein QR-Code für die Hochzeit ist heute der schnellste Weg, damit Ihre Gäste Fotos in dieselbe Galerie schicken. In den Schritten unten zeigen wir, wie Sie den QR-Code erstellen, drucken und platzieren — inklusive Vergleich, welcher Dienst am besten passt.",
      sections: [
        { h2: "Was Sie für einen QR-Code auf der Hochzeit brauchen",
          paragraphs: ["Für einen echten Hochzeits-QR-Code brauchen Sie drei Dinge: eine Zieladresse für die Fotos (private Galerie), eine schön gedruckte Tischkarte und eine kurze Anleitung für Gäste."],
          bullets: [
            "Private Galerie, in die Gäste Fotos hochladen.",
            "PDF mit QR-Code, druckfertig (300 g/m² Karton).",
            "Kurzer Text: „QR-Code scannen und Fotos teilen“.",
          ] },
        { h2: "So erstellen Sie den QR-Code in 5 Schritten",
          paragraphs: ["Der Prozess mit Guestcam dauert unter 2 Minuten und braucht keine Kreditkarte:"],
          bullets: [
            "1. guestcam.si öffnen, „Galerie erstellen“ anklicken.",
            "2. Namen des Paares (z. B. „Anna und Marko“) und Hochzeitsdatum eingeben.",
            "3. QR-Code herunterladen (PDF mit 8 eleganten Vorlagen).",
            "4. Tischkarten drucken — empfohlen A6.",
            "5. Eine Karte auf jeden Tisch stellen. Fertig.",
          ] },
        { h2: "Wo den QR-Code platzieren für maximale Beteiligung",
          paragraphs: ["Aus der Analyse hunderter Hochzeiten empfehlen wir drei Stellen gleichzeitig — mehr Berührungspunkte erhöhen den Anteil der Gäste, die tatsächlich hochladen:"],
          bullets: [
            "Auf jedem Tisch (zentrale Platzierung, für alle sichtbar).",
            "Am Eingang — große Karte oder Plakat.",
            "Auf der Rückseite des Menüs oder der Einladung.",
          ] },
        { h2: "Was neben dem QR-Code steht",
          paragraphs: ["Kurzer Text, der dem Gast sofort sagt, was zu tun ist:",
            "„Scannen Sie den QR-Code und teilen Sie Ihre Fotos mit uns. Alles kommt in voller Qualität an — ohne App.“"] },
      ],
      faq: [
        { q: "Ist der QR-Code für die Hochzeit kostenlos?",
          a: "Mit Guestcam ist das Basis-Paket kostenlos — bis zu 20 Fotos. Für den vollen Abend empfehlen wir Plus (49 €) oder Premium (99 €)." },
        { q: "Wer sieht die von Gästen hochgeladenen Fotos?",
          a: "Nur Sie (Veranstalter) und Personen mit direktem Link zur Galerie. Die Galerie wird nicht öffentlich indexiert und erscheint nicht bei Google." },
        { q: "Wie lange bleiben Fotos verfügbar?",
          a: "Abhängig vom Paket — von 30 Tagen (kostenlos) bis 2 Jahren (Premium). Sie können jederzeit alle Fotos als ZIP herunterladen." },
      ],
      ctaHeading: "Erstellen Sie den QR-Code für Ihre Hochzeit",
      ctaBody: "In 2 Minuten — ohne Kreditkarte. 8 Tischkartenvorlagen, personalisiert mit Namen und Datum.",
      ctaButton: "Hochzeits-QR-Code erstellen",
    },
    "porocni-album": {
      cluster: "porocni-album",
      slug: "digitales-hochzeitsalbum",
      category: "wedding",
      title: "Digitales Hochzeitsalbum — Galerie, die alle Fotos sammelt",
      description: "So erstellen Sie ein digitales Hochzeitsalbum, in das Gäste selbst Fotos hinzufügen. Vergleich klassisch vs. digital — wann welches sinnvoll ist.",
      h1: "Hochzeitsalbum: klassisch, digital und hybrid",
      intro:
        "Ein Hochzeitsalbum ist auf fast jeder Hochzeit obligatorisch — die Form hat sich in den letzten Jahren aber verändert. Heute kombinieren die meisten Paare ein klassisches gedrucktes Album mit einer digitalen Galerie, in die Gäste selbst Fotos hinzufügen. Dieser Leitfaden vergleicht die drei Hauptansätze und erklärt, wann welcher besser passt.",
      sections: [
        { h2: "Klassisches Hochzeitsalbum: wann nehmen",
          paragraphs: ["Ein gedrucktes Album ist ein tolles Andenken, kostet aber 300–1200 € und enthält nur die Fotografen-Aufnahmen — nichts von dem, was die Gäste eingefangen haben. Wenn Sie nur die professionellen Highlights in eleganter Form wollen, deckt das gedruckte Album das ab."] },
        { h2: "Digitales Hochzeitsalbum: Vor- und Nachteile",
          paragraphs: ["Die digitale Galerie sammelt Fotos aller Gäste, nicht nur des Fotografen. Das bedeutet 500–2000 zusätzliche Bilder, die Sie sonst verloren hätten. Nachteil: nichts Physisches, bis Sie eine Auswahl selbst drucken lassen."],
          bullets: [
            "Unbegrenzte Fotos.",
            "Alle Gäste greifen per Link oder QR-Code zu.",
            "Download aller Fotos als ZIP jederzeit möglich.",
            "Preis: kostenlos bis 20 Fotos, Plus 49 €.",
          ] },
        { h2: "Hybrider Ansatz: unsere Empfehlung",
          paragraphs: ["Das beste Ergebnis erzielen Sie, wenn Sie beides kombinieren: Der Fotograf macht klassische Porträts und Schlüsselmomente, die Gäste ergänzen Perspektiven, die er nicht einfangen kann — spontane Umarmungen, Kinderfotos, Tanz nach Mitternacht. Aus den gesammelten Fotos drucken Sie 30–50 der besten in ein Fotobuch."] },
        { h2: "So starten Sie das digitale Hochzeitsalbum",
          paragraphs: ["Mit Guestcam ist die Galerie in unter 2 Minuten eingerichtet:"],
          bullets: [
            "1. Namen des Paares, Datum, Ort — alles Pflicht.",
            "2. QR-Code herunterladen — Karten drucken.",
            "3. Link auch per WhatsApp teilen — für Gäste, die den QR-Code nicht scannen.",
            "4. Nach der Hochzeit alles als ZIP herunterladen und Auswahl für Fotobuch treffen.",
          ] },
      ],
      faq: [
        { q: "Ersetzt das digitale Hochzeitsalbum das klassische?",
          a: "Nicht komplett — aber es ergänzt es hervorragend. Das klassische Album enthält Profi-Aufnahmen, das digitale alles Übrige, was die Gäste eingefangen haben. Wir empfehlen beides." },
        { q: "Wo werden die Fotos des digitalen Albums gespeichert?",
          a: "Bei Guestcam auf EU-Servern (Bunny.net CDN + Neon PostgreSQL). Ihre Galerie ist nicht öffentlich und wird bei Google nicht indexiert." },
        { q: "Können wir aus dem digitalen Album ein gedrucktes Fotobuch erstellen?",
          a: "Ja. Sie laden alles als ZIP herunter und schicken die Auswahl an eine beliebige Online-Druckerei (Saal Digital, CEWE, Photobox etc.)." },
      ],
      ctaHeading: "Starten Sie Ihr digitales Hochzeitsalbum",
      ctaBody: "In 2 Minuten. Alle Gäste laden Fotos per QR-Code hoch. Aus den gesammelten Bildern wählen Sie die besten für ein gedrucktes Fotobuch.",
      ctaButton: "Hochzeitsalbum erstellen",
    },
    "zbiranje-slik-s-poroke": {
      cluster: "zbiranje-slik-s-poroke",
      slug: "hochzeitsfotos-von-gaesten-sammeln",
      category: "wedding",
      title: "Hochzeitsfotos von Gästen sammeln — 5 Methoden im Vergleich",
      description: "Hochzeitsfotos von Gästen sammeln: Vergleich WhatsApp, Google Fotos und QR-Code. Welche Methode am meisten Fotos in voller Qualität einsammelt.",
      h1: "Hochzeitsfotos von Gästen sammeln: wie Sie alle bekommen",
      intro:
        "Fotos von der Hochzeit einzusammeln ist technisch nicht kompliziert — aber es ist oft schlecht organisiert. Ergebnis: Aus 1500 möglichen Fotos landen 30 verschwommene aus einem WhatsApp-Chat bei Ihnen. Dieser Leitfaden zeigt, wo die meisten Fotos verloren gehen und wie Sie das verhindern.",
      sections: [
        { h2: "Wo die meisten Gäste-Fotos verloren gehen",
          paragraphs: ["Aus der Analyse hunderter Hochzeiten: 82 % der Fotos landen nie beim Paar. Die Gründe sind immer die gleichen — Vergesslichkeit, Apps, die Qualität komprimieren, und Methoden, die zu viele Schritte verlangen."] },
        { h2: "Fünf Methoden im Vergleich",
          paragraphs: ["Jede Methode hat ein Profil. Kurzvergleich:"],
          bullets: [
            "WhatsApp-Gruppe — schnell, aber 50 % Qualität; Fotos in verstreuten Chats.",
            "Google Fotos geteiltes Album — volle Qualität, aber Google-Konto nötig.",
            "AirDrop — nur iPhone-Gäste, hälft der Teilnehmer fällt raus.",
            "USB-Stick am Ausgang — nur eine Handvoll füllt ihn tatsächlich.",
            "QR-Code + Web-Galerie — höchste Beteiligung, volle Qualität.",
          ] },
        { h2: "Welche Methode wirklich funktioniert",
          paragraphs: ["In der Praxis sammelt der QR-Code 5–10× mehr Fotos als eine WhatsApp-Gruppe. Grund: Der Gast braucht nur die Handy-Kamera und 20 Sekunden, keine App und kein Konto. Weil es einfach ist, macht die Mehrheit tatsächlich mit."] },
        { h2: "So bereiten Sie das Einsammeln vor der Hochzeit vor",
          paragraphs: ["Eine Woche vorher vorbereiten:"],
          bullets: [
            "Guestcam-Galerie einrichten und QR-Code testen.",
            "Tischkarten drucken und eine größere für den Eingang.",
            "Kurzer Hinweis für den DJ: „QR-Code auf den Tischen scannen und Fotos teilen.“",
            "Galerie-Link in die Signatur jeder E-Mail an Gäste einfügen.",
            "Nach der Hochzeit: WhatsApp-Erinnerung mit dem Galerie-Link schicken.",
          ] },
      ],
      faq: [
        { q: "Wann sollte man mit dem Einsammeln beginnen?",
          a: "Ideal eine Woche vor der Hochzeit. Der QR-Code muss vorbereitet und getestet sein. Das Einsammeln läuft am besten, wenn es schon zu Beginn des Abends sichtbar ist." },
        { q: "Brauchen Gäste Internet zum Hochladen?",
          a: "Ja — WLAN oder Mobildaten. Wir empfehlen, entweder WLAN am Veranstaltungsort bereitzustellen oder die Fotos nach der Veranstaltung einzusammeln, wenn die Gäste zu Hause sind." },
        { q: "Was, wenn Gäste nicht mitmachen?",
          a: "Schicken Sie den QR-Code auch nach der Hochzeit per WhatsApp oder E-Mail. Die meisten Fotos kommen in den ersten 7 Tagen nach der Veranstaltung." },
      ],
      ctaHeading: "Starten Sie das Einsammeln der Hochzeitsfotos heute",
      ctaBody: "Galerie ohne Kreditkarte erstellen — QR-Code, 8 Tischkartenvorlagen, Zugriff auf Fotos in voller Qualität.",
      ctaButton: "Galerie erstellen",
    },
    "slike-z-rojstnega-dne": {
      cluster: "slike-z-rojstnega-dne",
      slug: "geburtstagsfotos-sammeln",
      category: "birthday",
      title: "Geburtstagsfotos sammeln — eine gemeinsame Galerie",
      description: "So sammeln Sie Geburtstagsfotos aller Gäste in einer gemeinsamen Galerie. QR-Code, keine App, geeignet für Kinder und Erwachsene.",
      h1: "Geburtstagsfotos sammeln: gemeinsame Galerie erstellen",
      intro:
        "Ein Geburtstag ist noch verstreuter auf Gäste-Handys als eine Hochzeit — jeder macht 20 Fotos und alle bleiben bei ihm. Als Jubilar oder als Elternteil, das ein Kinderfest organisiert, ist eine gemeinsame Galerie der einfachste Weg, alles an einem Ort zu haben.",
      sections: [
        { h2: "Warum Geburtstagsfotos verloren gehen",
          paragraphs: ["Ein Geburtstag wird nicht von einem Profi fotografiert — jeder Gast hat sein Handy und sein eigenes Album. Fotos bleiben verstreut auf 20–40 Geräten, aus denen Sie sie nie wieder bekommen. Die Lösung ist eine gemeinsame Galerie, an die alle Beiträge schicken können."] },
        { h2: "So funktioniert der QR-Code für den Geburtstag",
          paragraphs: ["Legen Sie eine Karte mit QR-Code auf den Tisch. Gäste scannen, wählen Fotos und Videos aus der Handy-Galerie, senden sie. Fotos erscheinen sofort in Ihrer privaten Web-Galerie."],
          bullets: [
            "Keine App — läuft in jedem Browser.",
            "Kinder ab 8 Jahren scannen den QR-Code problemlos.",
            "Videos werden unterstützt (bis 100 Videos mit Plus-Paket).",
            "Fotos erscheinen sofort, auch auf einer Projektion, wenn gewünscht.",
          ] },
        { h2: "Ideen für die Geburtstagsgalerie",
          paragraphs: ["Ein paar Wege, das Einsammeln unterhaltsam zu machen:"],
          bullets: [
            "Themenkarte — Farben passend zur Geburtstagsdeko.",
            "Live-Projektion — Fotos auf großer Leinwand, während Gäste hochladen.",
            "Quiz am Ende — wer die meisten Fotos hochgeladen hat, bekommt ein Geschenk.",
            "Videobotschaften — Gäste schicken kurze Glückwunschvideos.",
          ] },
      ],
      faq: [
        { q: "Können Kinder Geburtstagsfotos hochladen?",
          a: "Ja, Kinder ab 8 Jahren scannen den QR-Code problemlos mit dem Handy der Eltern. Das Hochladen ist einfach — Fotos auswählen, „Senden“ tippen." },
        { q: "Können wir die Geburtstagsgalerie während der Feier auf dem TV zeigen?",
          a: "Ja, Guestcam Premium bietet Live-Anzeige auf einem großen Bildschirm. Fotos erscheinen sofort, sobald Gäste sie hochladen." },
        { q: "Wie lange bleiben die Fotos verfügbar?",
          a: "Abhängig vom Paket — von 30 Tagen (kostenlos) bis 2 Jahren (Premium). Sie können jederzeit alles als ZIP herunterladen." },
      ],
      ctaHeading: "Erstellen Sie eine Geburtstagsgalerie",
      ctaBody: "In 2 Minuten. Name des Jubilars, Datum, QR-Code für Tische — Gäste laden ohne App hoch.",
      ctaButton: "Galerie erstellen",
    },
    "baby-shower-slike": {
      cluster: "baby-shower-slike",
      slug: "babyparty-fotos",
      category: "babyshower",
      title: "Babyparty Fotos — einfach von Gästen einsammeln",
      description: "So sammeln Sie Babyparty-Fotos aller Gäste in einer gemeinsamen Galerie. QR-Code für Tische, keine App. Ideen für Nachrichten und Glückwünsche.",
      h1: "Babyparty Fotos: gemeinsame Galerie erstellen",
      intro:
        "Eine Babyparty (Baby Shower) ist ein intimes Ereignis — meist mit weniger Gästen als eine Hochzeit, dafür mit mehr emotionalen Momenten, die Sie festhalten möchten. Eine gemeinsame Galerie sorgt dafür, dass alle Fotos aller Gäste an einem Ort landen — auch die aus Perspektiven, die Sie nicht gesehen haben.",
      sections: [
        { h2: "Warum eine gemeinsame Galerie für die Babyparty",
          paragraphs: ["Auf einer Babyparty wird verstreut fotografiert — 10–20 Gäste, jeder mit seinem Handy. Ohne gemeinsame Galerie bekommen Sie nur die Fotos, die Ihnen nachher zugesandt werden — in der Praxis weniger als die Hälfte."] },
        { h2: "So richten Sie die Galerie ein",
          paragraphs: ["Prozess mit Guestcam:"],
          bullets: [
            "1. Galerie mit dem Namen des kommenden Kindes erstellen (z. B. „Für die kleine Zoe“).",
            "2. QR-Code als PDF herunterladen.",
            "3. Karten auf zentrale Tische stellen.",
            "4. Gäste scannen und schicken Fotos + kurze Glückwünsche.",
          ] },
        { h2: "Ideen für die Babyparty-Galerie",
          paragraphs: ["Ein paar kreative Anwendungen mit Bedeutung:"],
          bullets: [
            "Videobotschaften — jeder Gast schickt eine kurze Nachricht an das Baby.",
            "Fotos „Rate den Bauch der Mama“ — mit Maßband.",
            "Fotos der Geschenke aus verschiedenen Winkeln.",
            "Gemeinsames Foto am Ende, das Sie projizieren können.",
          ] },
        { h2: "Was danach mit den Fotos passiert",
          paragraphs: ["Nach der Feier laden Sie alle Fotos als ZIP herunter. Aus einer Auswahl können Sie ein kleines Buch drucken, das Sie dem Kind bei der Geburt schenken — ein Dokument der ersten Stunden des Lebens, in denen alle nur gewartet haben."] },
      ],
      faq: [
        { q: "Ist die Babyparty-Galerie privat?",
          a: "Ja. Die Galerie ist nur für Personen mit direktem Link oder QR-Code zugänglich. Sie wird nicht öffentlich indexiert." },
        { q: "Können Gäste Videos schicken?",
          a: "Ja, mit dem Plus-Paket können bis zu 100 Videos hochgeladen werden. Videos eignen sich hervorragend für Glückwünsche an das kommende Baby." },
        { q: "Wie viele Fotos kann ich sammeln?",
          a: "Kostenlos bis 20 Fotos. Für eine Babyparty mit mehr Gästen empfehlen wir das Plus-Paket (49 €, 5000 Fotos und 100 Videos)." },
      ],
      ctaHeading: "Erstellen Sie eine Babyparty-Galerie",
      ctaBody: "In 2 Minuten — QR-Code für Tische, Videobotschaften, Live-Projektion.",
      ctaButton: "Galerie erstellen",
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // EN — English
  // ─────────────────────────────────────────────────────────────────────
  en: {
    "slike-s-poroke": {
      cluster: "slike-s-poroke",
      slug: "wedding-photos-from-guests",
      category: "wedding",
      title: "Wedding photos from guests — how to collect them all",
      description: "How to collect all wedding photos from your guests — no lost memories, no app. Compare QR code, WhatsApp, and Google Photos side by side.",
      h1: "Wedding photos from guests: how to collect every one",
      intro:
        "At a wedding, guests take 500–2000 photos on their phones — you receive maybe twenty. The rest stay on SD cards and in forgotten WhatsApp threads. This guide covers five practical ways to get every wedding photo from your guests — and which method actually works.",
      sections: [
        { h2: "Why guests never send you their photos",
          paragraphs: ["Five reasons, and each has a fix if you pick the right method:"],
          bullets: [
            "They forget — days, weeks, months go by after the wedding.",
            "WhatsApp compresses photos to ~50% quality — you get blurry versions.",
            "Google Photos requires an account older guests often don't have.",
            "A USB drive means every guest has to come to you personally.",
            "Email is tedious for both sides.",
          ] },
        { h2: "Five ways to collect wedding photos from guests",
          paragraphs: ["Each method has trade-offs. Quick comparison:"],
          bullets: [
            "WhatsApp group — fast, but compressed and scattered.",
            "Google Photos shared album — full quality, but requires sign-in.",
            "USB / SD keys at the exit — high quality, only a handful of guests fill them.",
            "Email collection — you keep control, but the effort is enormous.",
            "QR code on tables — no app, no sign-in, full quality.",
          ] },
        { h2: "QR code: the method that collects the most",
          paragraphs: [
            "The QR code works because it removes every barrier. A guest scans with their phone camera, picks photos, and sends — no app, no account, no sign-in. Because it takes 20 seconds, more people actually do it.",
            "In practice you collect 5–10× more photos than with WhatsApp. And everything arrives in full original resolution, ready for print and photo books.",
          ] },
        { h2: "How many photos guests actually upload",
          paragraphs: ["From our anonymous stats: an average wedding with 80 guests collects between 800 and 1400 photos via Guestcam's QR code. Peak is the evening dance floor (most uploads after midnight)."] },
      ],
      faq: [
        { q: "How do I get all wedding photos from guests?",
          a: "Use a QR code on every table. Guests scan, upload photos through the browser, no app. It's the simplest way and collects the highest share of photos." },
        { q: "Does WhatsApp compress wedding photos?",
          a: "Yes, WhatsApp compresses photos by default to about half the original size. For full quality you need a different method (QR code or a Google Photos shared album)." },
        { q: "How long does it take to set up a wedding QR code?",
          a: "Under 2 minutes with Guestcam. Enter the couple's names and date, download the QR code as PDF, print table cards." },
        { q: "Do guests need to download an app?",
          a: "No. Guestcam runs in the browser. A guest scans the QR code with the phone's camera and uploads immediately." },
      ],
      ctaHeading: "Set up your wedding gallery in 2 minutes",
      ctaBody: "No app. No credit card. Couple names, date, QR code — your guests upload photos in full quality the same evening.",
      ctaButton: "Create a free gallery",
    },
    "qr-koda-za-poroko": {
      cluster: "qr-koda-za-poroko",
      slug: "how-to-make-wedding-qr-code",
      category: "wedding",
      title: "How to make a wedding QR code — done in 2 minutes",
      description: "How to make a wedding QR code that collects every guest's photos. No app, no accounts. Printable templates for table cards.",
      h1: "Wedding QR code: how to make and place it",
      intro:
        "A wedding QR code is the fastest way for your guests to send photos into a single gallery. Below we walk through creating, printing, and placing it — including which service handles it best.",
      sections: [
        { h2: "What you need for a wedding QR code",
          paragraphs: ["A real wedding QR code needs three things: a destination for the photos (a private gallery), a nicely printed table card, and short instructions for guests."],
          bullets: [
            "A private gallery where guests upload photos.",
            "A print-ready PDF QR code (300 gsm paper).",
            "A short prompt: “Scan and share your photos.”",
          ] },
        { h2: "How to create a wedding QR code in 5 steps",
          paragraphs: ["The process with Guestcam takes under 2 minutes and asks for no credit card:"],
          bullets: [
            "1. Open guestcam.si and click “Create gallery”.",
            "2. Enter the couple's names (e.g. “Anna and Marko”) and the wedding date.",
            "3. Download the QR code (PDF with 8 elegant templates).",
            "4. Print the table cards — A6 recommended.",
            "5. Put one card on every table. That's it.",
          ] },
        { h2: "Where to place the QR code for maximum uptake",
          paragraphs: ["From analysing hundreds of weddings, three locations at once work best — more touchpoints raise the share of guests who actually upload:"],
          bullets: [
            "On every table (central, visible to all).",
            "At the entrance — a large card or poster.",
            "On the back of the menu or invitation.",
          ] },
        { h2: "What to write next to the QR code",
          paragraphs: ["A short prompt that tells guests exactly what to do:",
            "“Scan the QR code and share your photos with us. Everything arrives in full quality — no app required.”"] },
      ],
      faq: [
        { q: "Is a wedding QR code free?",
          a: "With Guestcam the basic plan is free — up to 20 photos. For a full evening we recommend Plus (€49) or Premium (€99)." },
        { q: "Who can see photos that guests upload?",
          a: "Only you (the organiser) and people who have the direct gallery link. The gallery is never publicly indexed and does not appear in Google." },
        { q: "How long do the photos stay available?",
          a: "Depending on the plan — from 30 days (free) up to 2 years (Premium). You can download all photos as a ZIP at any time." },
      ],
      ctaHeading: "Create a QR code for your wedding",
      ctaBody: "Under 2 minutes — no credit card. 8 table-card templates, personalised with names and date.",
      ctaButton: "Make wedding QR code",
    },
    "porocni-album": {
      cluster: "porocni-album",
      slug: "digital-wedding-album",
      category: "wedding",
      title: "Digital wedding album — gallery that collects every photo",
      description: "How to make a digital wedding album that lets guests add their own photos. Classic vs. digital compared — and when to pick which.",
      h1: "Wedding album: classic, digital, and hybrid",
      intro:
        "A wedding album is more or less mandatory on any wedding — but the format has shifted in recent years. Most couples now combine a classic printed album with a digital gallery that guests add their own photos to. This guide compares the three main approaches and explains when each works best.",
      sections: [
        { h2: "Classic wedding album: when to pick one",
          paragraphs: ["A printed album is a great keepsake, but it costs €300–1200 and contains only the photographer's shots — nothing from what guests captured. If all you want is the best professional images in an elegant form, a printed album covers you."] },
        { h2: "Digital wedding album: pros and cons",
          paragraphs: ["The digital gallery collects photos from every guest, not just the photographer. That means 500–2000 extra photos you would otherwise lose. Downside: nothing physical until you print a selection yourself."],
          bullets: [
            "Unlimited photos.",
            "Every guest opens it via link or QR code.",
            "Download all photos as a ZIP for print whenever you want.",
            "Price: free up to 20 photos, Plus €49.",
          ] },
        { h2: "Hybrid approach: what we recommend",
          paragraphs: ["The best result comes from combining both: the photographer takes classical portraits and key moments, guests add the perspectives the photographer cannot — spontaneous hugs, kids' photos, post-midnight dance floor. From the collected photos you print 30–50 of the best into a photo book."] },
        { h2: "How to start a digital wedding album",
          paragraphs: ["With Guestcam the gallery goes live in under 2 minutes:"],
          bullets: [
            "1. Couple's names, date, location — that's all that's mandatory.",
            "2. Download the QR code — print the cards.",
            "3. Also share the link over WhatsApp for guests who don't scan QR codes.",
            "4. After the wedding, download everything as a ZIP and pick the best photos for a photo book.",
          ] },
      ],
      faq: [
        { q: "Does a digital wedding album replace the classic one?",
          a: "Not entirely — but it complements it beautifully. The classic album has the professional shots; the digital one has everything else guests captured. We recommend both." },
        { q: "Where are the digital album's photos stored?",
          a: "At Guestcam on servers in the EU (Bunny.net CDN + Neon PostgreSQL). Your gallery is private and never indexed by Google." },
        { q: "Can we turn the digital album into a printed photo book?",
          a: "Yes. Download everything as a ZIP and send your selection to any online printer (Saal Digital, CEWE, Photobox, etc.)." },
      ],
      ctaHeading: "Start your digital wedding album",
      ctaBody: "In 2 minutes. All guests upload photos via a QR code. You pick the best for a printed photo book.",
      ctaButton: "Create wedding album",
    },
    "zbiranje-slik-s-poroke": {
      cluster: "zbiranje-slik-s-poroke",
      slug: "collect-wedding-photos-guests",
      category: "wedding",
      title: "Collect wedding photos from guests — 5 methods compared",
      description: "Collecting wedding photos from guests: WhatsApp, Google Photos, and QR codes compared. Which method collects the most photos in full quality.",
      h1: "Collect wedding photos from guests: how to get everything",
      intro:
        "Collecting photos from a wedding is not technically hard — but it's often badly organised. Result: out of 1500 potential photos you get 30 blurry ones from a WhatsApp thread. This guide shows where photos go missing and how to prevent it.",
      sections: [
        { h2: "Where most guest photos go missing",
          paragraphs: ["Analysing hundreds of weddings: 82% of photos never reach the couple. Reasons are always the same — forgetfulness, apps that crush quality, and methods that need too many steps."] },
        { h2: "Five methods compared",
          paragraphs: ["Each method has a profile. Quick comparison:"],
          bullets: [
            "WhatsApp group — fast, but 50% quality; photos scattered across threads.",
            "Google Photos shared album — full quality but requires a Google account.",
            "AirDrop — only iPhone guests, half the room falls out.",
            "USB drive at the exit — only a handful actually fill it.",
            "QR code + web gallery — highest guest uptake, full quality.",
          ] },
        { h2: "Which method actually works",
          paragraphs: ["In practice the QR code collects 5–10× more photos than a WhatsApp group. Why: the guest needs only the phone camera and 20 seconds, no app and no account. Because it's simple, most guests actually take part."] },
        { h2: "How to prepare the collection before the wedding",
          paragraphs: ["Prepare a week in advance:"],
          bullets: [
            "Set up the Guestcam gallery and test the QR code.",
            "Print table cards and one larger card for the entrance.",
            "Prepare a short prompt for the DJ: “Scan the QR on the tables and share your photos.”",
            "Add the gallery link to the signature of every email you send guests.",
            "After the wedding: send a WhatsApp reminder with the gallery link.",
          ] },
      ],
      faq: [
        { q: "When should I start collecting wedding photos?",
          a: "Ideally a week before the wedding. The QR code should be ready and tested. Collection works best when it's visible from the very start of the evening." },
        { q: "Do guests need internet to upload photos?",
          a: "Yes — Wi-Fi or mobile data. Either provide Wi-Fi at the venue or plan to collect photos after the event, when guests are home." },
        { q: "What if guests don't respond?",
          a: "Send the QR code again after the wedding, via WhatsApp or email. Most photos arrive in the first 7 days after the event." },
      ],
      ctaHeading: "Start collecting wedding photos today",
      ctaBody: "Create a gallery with no credit card — QR code, 8 card templates, and full-quality photo access.",
      ctaButton: "Create gallery",
    },
    "slike-z-rojstnega-dne": {
      cluster: "slike-z-rojstnega-dne",
      slug: "birthday-photos-guests",
      category: "birthday",
      title: "Birthday photos from guests — one shared gallery",
      description: "How to collect birthday photos from every guest in one shared gallery. QR code, no app, works for kids and adults.",
      h1: "Birthday photos: how to make a shared gallery",
      intro:
        "A birthday is even more scattered across guests' phones than a wedding — everyone snaps 20 photos and they all stay put. Whether you're a milestone birthday host or a parent throwing a kid's party, a shared gallery is the simplest way to get everything in one place.",
      sections: [
        { h2: "Why birthday photos disappear",
          paragraphs: ["A birthday isn't shot by a pro — every guest has their own phone and their own album. Photos stay scattered across 20–40 devices you never see again. The fix is a shared gallery everyone can send to."] },
        { h2: "How the QR code works for a birthday",
          paragraphs: ["Place a QR card on the table. Guests scan, pick photos and videos from their phone gallery, upload. Photos appear in your private web gallery in real time."],
          bullets: [
            "No app — works in any browser.",
            "Kids over 8 scan the QR code without help.",
            "Video is supported (up to 100 clips with Plus).",
            "Photos appear immediately, even on a live projection if you want.",
          ] },
        { h2: "Ideas for the birthday gallery",
          paragraphs: ["A few ways to make the collection fun:"],
          bullets: [
            "Themed card — colours matching the birthday decor.",
            "Live projection — photos on the big screen as guests upload.",
            "End-of-night quiz — whoever uploaded most gets a prize.",
            "Video messages — guests send short birthday wishes.",
          ] },
      ],
      faq: [
        { q: "Can kids upload birthday photos?",
          a: "Yes, kids over 8 scan the QR code from a parent's phone without trouble. Uploading is simple — pick photos, hit “Send”." },
        { q: "Can we show the birthday gallery on the TV during the party?",
          a: "Yes, Guestcam Premium supports Live projection on a big screen. Photos appear the moment guests upload them." },
        { q: "How long do the photos stay available?",
          a: "Depending on plan — from 30 days (free) to 2 years (Premium). You can download everything as a ZIP any time." },
      ],
      ctaHeading: "Create a birthday gallery",
      ctaBody: "In 2 minutes. Guest of honour's name, date, QR code for tables — guests upload without an app.",
      ctaButton: "Create gallery",
    },
    "baby-shower-slike": {
      cluster: "baby-shower-slike",
      slug: "baby-shower-photos-guests",
      category: "babyshower",
      title: "Baby shower photos — easy collection from guests",
      description: "How to collect baby shower photos from every guest in one gallery. QR code for tables, no app. Ideas for messages and video wishes.",
      h1: "Baby shower photos: how to make a shared gallery",
      intro:
        "A baby shower is intimate — often fewer guests than a wedding but with more emotional moments to preserve. A shared gallery lets you see every guest's photos in one place, including the perspectives you missed.",
      sections: [
        { h2: "Why you need a shared gallery for a baby shower",
          paragraphs: ["Baby-shower photography is scattered — 10–20 guests, each on their own phone. Without a shared gallery you only get the photos guests send you later — in practice less than half."] },
        { h2: "How to set up the gallery",
          paragraphs: ["The Guestcam flow:"],
          bullets: [
            "1. Create a gallery with the baby's name (e.g. “For little Zoe”).",
            "2. Download the QR code as a PDF.",
            "3. Place the cards on central tables.",
            "4. Guests scan and send photos plus short messages.",
          ] },
        { h2: "Ideas for the baby-shower gallery",
          paragraphs: ["Creative uses that add meaning:"],
          bullets: [
            "Video wishes — every guest sends a short message to the baby.",
            "“Guess the bump size” photos — with a tape measure.",
            "Gift photos from different angles.",
            "Group photo at the end, projected for everyone.",
          ] },
        { h2: "What to do with the photos afterwards",
          paragraphs: ["After the event you download everything as a ZIP. From the selection you can print a small book to give the child at birth — a record of the hours before, when everyone was just waiting."] },
      ],
      faq: [
        { q: "Is the baby-shower gallery private?",
          a: "Yes. The gallery is only accessible to people with the direct link or QR code. It's never publicly indexed." },
        { q: "Can guests send videos?",
          a: "Yes, on the Plus plan they can upload up to 100 videos. Videos are perfect for messages to the baby-to-come." },
        { q: "How many photos can I collect?",
          a: "Free up to 20 photos. For a baby shower with more guests we recommend Plus (€49, 5000 photos and 100 videos)." },
      ],
      ctaHeading: "Create a baby-shower gallery",
      ctaBody: "In 2 minutes — QR code for tables, video wishes, real-time projection.",
      ctaButton: "Create gallery",
    },
  },

  // ─────────────────────────────────────────────────────────────────────
  // ES — Spanish
  // ─────────────────────────────────────────────────────────────────────
  es: {
    "slike-s-poroke": {
      cluster: "slike-s-poroke",
      slug: "fotos-boda-invitados",
      category: "wedding",
      title: "Fotos de boda de los invitados — cómo recopilarlas todas",
      description: "Cómo recopilar todas las fotos de boda de tus invitados — sin recuerdos perdidos, sin app. Comparativa QR, WhatsApp y Google Fotos.",
      h1: "Fotos de boda de los invitados: cómo conseguir todas",
      intro:
        "En una boda los invitados hacen 500–2000 fotos con sus móviles — tú recibes apenas veinte. El resto se queda en tarjetas de memoria y grupos de WhatsApp olvidados. Esta guía muestra cinco formas prácticas de conseguir todas las fotos de boda de tus invitados — y cuál funciona de verdad.",
      sections: [
        { h2: "Por qué los invitados no te envían las fotos",
          paragraphs: ["Hay cinco razones, y cada una tiene solución si eliges bien:"],
          bullets: [
            "Se olvidan — pasan días, semanas, meses después de la boda.",
            "WhatsApp comprime las fotos al ~50 % de calidad — recibes versiones borrosas.",
            "Google Fotos exige una cuenta que muchos invitados mayores no tienen.",
            "Un USB implica que cada invitado tenga que ir a verte en persona.",
            "El correo es tedioso para ambas partes.",
          ] },
        { h2: "Cinco formas de recopilar fotos desde el lado del invitado",
          paragraphs: ["Cada método tiene ventajas y trampas. Comparativa rápida:"],
          bullets: [
            "Grupo de WhatsApp — rápido, pero comprimido y disperso.",
            "Álbum compartido de Google Fotos — calidad completa, pero exige inicio de sesión.",
            "USB / SD en la salida — alta calidad, sólo un puñado de invitados lo hace.",
            "Recopilación por email — mantienes el control, pero el esfuerzo es enorme.",
            "Código QR en las mesas — sin app, sin login, calidad completa.",
          ] },
        { h2: "Código QR: el método que más recopila",
          paragraphs: [
            "El código QR funciona porque elimina cada barrera. El invitado escanea con la cámara del móvil, elige fotos y las envía — sin app, sin cuenta, sin login. Como sólo lleva 20 segundos, más gente lo hace de verdad.",
            "En la práctica recopilas 5–10× más fotos que con WhatsApp. Y todo llega en resolución original, listo para imprimir y para fotolibros.",
          ] },
        { h2: "Cuántas fotos suben los invitados de verdad",
          paragraphs: ["De nuestras estadísticas anónimas: una boda media con 80 invitados recopila entre 800 y 1400 fotos por el código QR de Guestcam. El pico es el baile nocturno (más subidas después de medianoche)."] },
      ],
      faq: [
        { q: "¿Cómo consigo todas las fotos de boda de los invitados?",
          a: "Usa un código QR en cada mesa. Los invitados escanean, suben fotos por el navegador, sin app. Es la forma más sencilla y recopila el porcentaje más alto." },
        { q: "¿WhatsApp comprime las fotos de boda?",
          a: "Sí, WhatsApp comprime las fotos por defecto a la mitad del tamaño original. Para calidad completa necesitas otro método (QR o álbum compartido de Google Fotos)." },
        { q: "¿Cuánto tarda montar un código QR para fotos de boda?",
          a: "Con Guestcam menos de 2 minutos. Introduces nombres y fecha, descargas el QR en PDF e imprimes las tarjetas para las mesas." },
        { q: "¿Los invitados tienen que descargar una app?",
          a: "No. Guestcam funciona en el navegador. El invitado escanea con la cámara del móvil y sube al instante." },
      ],
      ctaHeading: "Prepara tu galería de boda en 2 minutos",
      ctaBody: "Sin app. Sin tarjeta. Nombres de la pareja, fecha, código QR — tus invitados suben fotos en calidad completa esa misma noche.",
      ctaButton: "Crear galería gratis",
    },
    "qr-koda-za-poroko": {
      cluster: "qr-koda-za-poroko",
      slug: "como-hacer-codigo-qr-boda",
      category: "wedding",
      title: "Cómo hacer un código QR para boda — en 2 minutos",
      description: "Cómo hacer un código QR para boda que recopile todas las fotos de los invitados. Sin app, sin cuentas. Plantillas para tarjetas de mesa.",
      h1: "Código QR para boda: cómo hacerlo y colocarlo",
      intro:
        "Un código QR para boda es la manera más rápida para que tus invitados envíen fotos a la misma galería. Abajo repasamos cómo crearlo, imprimirlo y colocarlo — con la comparativa de qué servicio lo hace mejor.",
      sections: [
        { h2: "Qué necesitas para el QR de la boda",
          paragraphs: ["Un QR de boda real necesita tres cosas: un destino para las fotos (galería privada), una tarjeta bien impresa y una breve indicación para los invitados."],
          bullets: [
            "Una galería privada donde los invitados suben las fotos.",
            "PDF con el QR, listo para imprimir (papel 300 g/m²).",
            "Un mensaje corto: «Escanea y comparte tus fotos».",
          ] },
        { h2: "Cómo crear el código QR en 5 pasos",
          paragraphs: ["Con Guestcam el proceso lleva menos de 2 minutos y no pide tarjeta:"],
          bullets: [
            "1. Entra en guestcam.si y pulsa «Crear galería».",
            "2. Introduce los nombres de la pareja (p. ej. «Ana y Marko») y la fecha.",
            "3. Descarga el QR (PDF con 8 plantillas elegantes).",
            "4. Imprime las tarjetas de mesa — tamaño A6 recomendado.",
            "5. Coloca una tarjeta en cada mesa. Ya está.",
          ] },
        { h2: "Dónde colocar el QR para máxima participación",
          paragraphs: ["Del análisis de cientos de bodas recomendamos tres ubicaciones a la vez — más puntos de contacto suben el porcentaje de invitados que suben fotos:"],
          bullets: [
            "En cada mesa (colocación central, visible para todos).",
            "En la entrada — tarjeta grande o cartel.",
            "En el reverso del menú o de la invitación.",
          ] },
        { h2: "Qué escribir junto al QR",
          paragraphs: ["Un texto corto que le diga al invitado qué hacer:",
            "«Escanea el código QR y comparte tus fotos con nosotros. Todo llega en calidad completa — sin app.»"] },
      ],
      faq: [
        { q: "¿Es gratis el código QR para boda?",
          a: "Con Guestcam el plan básico es gratis — hasta 20 fotos. Para la noche completa recomendamos Plus (49 €) o Premium (99 €)." },
        { q: "¿Quién puede ver las fotos que suben los invitados?",
          a: "Sólo tú (organizador) y las personas con enlace directo a la galería. La galería no se indexa públicamente y no aparece en Google." },
        { q: "¿Cuánto tiempo están disponibles las fotos?",
          a: "Depende del plan — de 30 días (gratis) a 2 años (Premium). Puedes descargar todo como ZIP en cualquier momento." },
      ],
      ctaHeading: "Crea el QR de tu boda",
      ctaBody: "En 2 minutos, sin tarjeta. 8 plantillas de tarjetas de mesa, personalizadas con nombres y fecha.",
      ctaButton: "Crear QR de boda",
    },
    "porocni-album": {
      cluster: "porocni-album",
      slug: "album-de-boda-digital",
      category: "wedding",
      title: "Álbum de boda digital — la galería que recoge todas las fotos",
      description: "Cómo hacer un álbum de boda digital en el que los invitados añaden sus propias fotos. Álbum clásico vs. digital — cuándo elegir cada uno.",
      h1: "Álbum de boda: clásico, digital e híbrido",
      intro:
        "El álbum de boda es casi obligado en cualquier boda — pero el formato ha cambiado en los últimos años. La mayoría de parejas combina hoy un álbum clásico impreso con una galería digital donde los invitados añaden sus fotos. Esta guía compara los tres enfoques y explica cuándo cada uno funciona mejor.",
      sections: [
        { h2: "Álbum de boda clásico: cuándo elegirlo",
          paragraphs: ["Un álbum impreso es un gran recuerdo, pero cuesta entre 300 y 1200 € y sólo contiene las tomas del fotógrafo — nada de lo que capturaron los invitados. Si sólo quieres las mejores fotos profesionales en forma elegante, el álbum impreso cubre esa necesidad."] },
        { h2: "Álbum de boda digital: ventajas y desventajas",
          paragraphs: ["La galería digital reúne fotos de todos los invitados, no sólo del fotógrafo. Eso significa 500–2000 fotos extra que de otro modo perderías. Contra: no hay nada físico hasta que imprimas una selección tú mismo."],
          bullets: [
            "Fotos ilimitadas.",
            "Todos los invitados acceden por enlace o QR.",
            "Descarga de todas las fotos en ZIP cuando quieras.",
            "Precio: gratis hasta 20 fotos, Plus 49 €.",
          ] },
        { h2: "Enfoque híbrido: lo que recomendamos",
          paragraphs: ["El mejor resultado se logra combinando ambos: el fotógrafo hace los retratos clásicos y los momentos clave, los invitados aportan las perspectivas que él no puede capturar — abrazos espontáneos, fotos con niños, pista de baile pasada la medianoche. De las fotos recopiladas imprimes 30–50 de las mejores en un fotolibro."] },
        { h2: "Cómo empezar el álbum digital",
          paragraphs: ["Con Guestcam la galería está lista en menos de 2 minutos:"],
          bullets: [
            "1. Nombres de la pareja, fecha, lugar — lo único obligatorio.",
            "2. Descargas el QR e imprimes las tarjetas.",
            "3. Compartes también el enlace por WhatsApp — para invitados que no escanean QR.",
            "4. Después de la boda descargas todo en ZIP y eliges las fotos para el fotolibro.",
          ] },
      ],
      faq: [
        { q: "¿Un álbum digital reemplaza al clásico?",
          a: "No del todo — pero lo complementa muy bien. El clásico tiene las tomas profesionales; el digital todo lo demás que capturaron los invitados. Recomendamos ambos." },
        { q: "¿Dónde se guardan las fotos del álbum digital?",
          a: "En Guestcam, en servidores de la UE (CDN Bunny.net + Neon PostgreSQL). Tu galería no es pública y no se indexa en Google." },
        { q: "¿Podemos convertir el álbum digital en un fotolibro impreso?",
          a: "Sí. Descargas todo en ZIP y mandas la selección a cualquier imprenta online (Saal Digital, CEWE, Photobox, etc.)." },
      ],
      ctaHeading: "Empieza tu álbum de boda digital",
      ctaBody: "En 2 minutos. Todos los invitados suben fotos por QR. Eliges las mejores para el fotolibro impreso.",
      ctaButton: "Crear álbum de boda",
    },
    "zbiranje-slik-s-poroke": {
      cluster: "zbiranje-slik-s-poroke",
      slug: "recopilar-fotos-boda-invitados",
      category: "wedding",
      title: "Recopilar fotos de boda de invitados — 5 métodos comparados",
      description: "Recopilar fotos de boda de los invitados: comparativa de WhatsApp, Google Fotos y código QR. Qué método recopila más fotos en calidad completa.",
      h1: "Recopilar fotos de boda: cómo conseguirlas todas",
      intro:
        "Recopilar fotos de boda no es técnicamente difícil — pero suele estar mal organizado. Resultado: de 1500 fotos posibles recibes 30 borrosas de un chat de WhatsApp. Esta guía muestra dónde se pierden la mayoría y cómo evitarlo.",
      sections: [
        { h2: "Dónde se pierden la mayoría de fotos de los invitados",
          paragraphs: ["Del análisis de cientos de bodas: el 82 % de las fotos nunca llega a la pareja. Los motivos son siempre los mismos — se olvidan, apps que comprimen la calidad y métodos que exigen demasiados pasos."] },
        { h2: "Comparativa de cinco métodos",
          paragraphs: ["Cada método tiene un perfil. Comparativa rápida:"],
          bullets: [
            "Grupo de WhatsApp — rápido, pero 50 % de calidad; fotos dispersas.",
            "Álbum compartido de Google Fotos — calidad completa pero exige cuenta.",
            "AirDrop — sólo invitados con iPhone, cae la mitad.",
            "USB en la salida — casi nadie lo llena.",
            "Código QR + galería web — máxima participación, calidad completa.",
          ] },
        { h2: "Qué método funciona de verdad",
          paragraphs: ["En la práctica el código QR recopila 5–10× más fotos que un grupo de WhatsApp. El motivo: el invitado sólo necesita la cámara del móvil y 20 segundos, sin app y sin cuenta. Como es fácil, la mayoría participa de verdad."] },
        { h2: "Cómo preparar la recopilación antes de la boda",
          paragraphs: ["Prepárate una semana antes:"],
          bullets: [
            "Monta la galería de Guestcam y prueba el QR.",
            "Imprime tarjetas de mesa y una más grande para la entrada.",
            "Prepara una frase corta para el DJ: «Escanea el QR de las mesas y comparte tus fotos».",
            "Añade el enlace de la galería a la firma de cada email que envíes a los invitados.",
            "Después de la boda: manda un recordatorio por WhatsApp con el enlace.",
          ] },
      ],
      faq: [
        { q: "¿Cuándo debo empezar a recopilar fotos?",
          a: "Idealmente una semana antes de la boda. El QR debe estar listo y probado. Recopilar funciona mejor cuando es visible desde el inicio de la noche." },
        { q: "¿Los invitados necesitan internet para subir fotos?",
          a: "Sí — Wi-Fi o datos móviles. Recomendamos ofrecer Wi-Fi en el lugar o recopilar las fotos después del evento, cuando los invitados están en casa." },
        { q: "¿Y si los invitados no responden?",
          a: "Envía el QR también después de la boda por WhatsApp o email. La mayoría de las fotos llega en los primeros 7 días tras el evento." },
      ],
      ctaHeading: "Empieza a recopilar fotos de la boda hoy",
      ctaBody: "Crea una galería sin tarjeta — QR, 8 plantillas de tarjetas y acceso a fotos en calidad completa.",
      ctaButton: "Crear galería",
    },
    "slike-z-rojstnega-dne": {
      cluster: "slike-z-rojstnega-dne",
      slug: "fotos-cumpleanos-invitados",
      category: "birthday",
      title: "Fotos de cumpleaños de los invitados — galería compartida",
      description: "Cómo recopilar fotos de cumpleaños de todos los invitados en una galería compartida. QR, sin app, apto para niños y adultos.",
      h1: "Fotos de cumpleaños: cómo hacer una galería compartida",
      intro:
        "El cumpleaños está aún más disperso en los móviles de los invitados que una boda — cada uno hace 20 fotos y todas se quedan en su galería. Si eres el homenajeado o un padre organizando la fiesta del peque, una galería compartida es la manera más sencilla de tener todo en un sitio.",
      sections: [
        { h2: "Por qué se pierden las fotos de cumpleaños",
          paragraphs: ["El cumpleaños no lo fotografía un profesional — cada invitado tiene su móvil y su propio álbum. Las fotos se quedan repartidas en 20–40 dispositivos de los que nunca las recuperas. La solución es una galería compartida a la que todos pueden enviar."] },
        { h2: "Cómo funciona el QR para un cumpleaños",
          paragraphs: ["Coloca una tarjeta con QR en la mesa. Los invitados escanean, eligen fotos y vídeos de su galería y los envían. Las fotos aparecen en tu galería privada en tiempo real."],
          bullets: [
            "Sin app — funciona en cualquier navegador.",
            "Niños de 8 años en adelante escanean sin problema.",
            "Vídeo compatible (hasta 100 clips en Plus).",
            "Las fotos aparecen al instante, también en la proyección si quieres.",
          ] },
        { h2: "Ideas para la galería de cumpleaños",
          paragraphs: ["Algunas formas de hacer la recopilación divertida:"],
          bullets: [
            "Tarjeta temática — colores que combinan con la decoración.",
            "Proyección en directo — fotos en pantalla mientras los invitados suben.",
            "Concurso al final — quien haya subido más se lleva un regalo.",
            "Mensajes en vídeo — invitados envían felicitaciones cortas.",
          ] },
      ],
      faq: [
        { q: "¿Pueden los niños subir fotos del cumpleaños?",
          a: "Sí, los niños de 8 años en adelante escanean el QR con el móvil del padre sin problema. Subir es sencillo — eligen fotos, pulsan «Enviar»." },
        { q: "¿Podemos mostrar la galería de cumpleaños en la TV durante la fiesta?",
          a: "Sí, Guestcam Premium ofrece proyección en directo en pantalla grande. Las fotos aparecen cuando los invitados suben." },
        { q: "¿Cuánto tiempo están disponibles las fotos?",
          a: "Depende del plan — de 30 días (gratis) a 2 años (Premium). Siempre puedes descargar todo en ZIP." },
      ],
      ctaHeading: "Crea una galería para el cumpleaños",
      ctaBody: "En 2 minutos. Nombre del homenajeado, fecha, QR para las mesas — los invitados suben sin app.",
      ctaButton: "Crear galería",
    },
    "baby-shower-slike": {
      cluster: "baby-shower-slike",
      slug: "fotos-baby-shower",
      category: "babyshower",
      title: "Fotos de baby shower — recopilación fácil desde los invitados",
      description: "Cómo recopilar fotos de baby shower de todos los invitados en una galería. QR para las mesas, sin app. Ideas para mensajes y felicitaciones.",
      h1: "Fotos de baby shower: cómo hacer una galería compartida",
      intro:
        "El baby shower es un evento íntimo — con menos invitados que una boda, pero con más momentos emotivos que quieres conservar. Una galería compartida hace que las fotos de todos los invitados lleguen a un mismo lugar, incluso las de perspectivas que no viste.",
      sections: [
        { h2: "Por qué una galería compartida para el baby shower",
          paragraphs: ["En un baby shower las fotos se reparten — 10–20 invitados, cada uno con su móvil. Sin galería compartida sólo recibes las fotos que te envían después — en la práctica menos de la mitad."] },
        { h2: "Cómo montar la galería",
          paragraphs: ["Con Guestcam:"],
          bullets: [
            "1. Crea la galería con el nombre del bebé que viene (p. ej. «Para la pequeña Zoe»).",
            "2. Descarga el QR en PDF.",
            "3. Coloca las tarjetas en las mesas centrales.",
            "4. Los invitados escanean y envían fotos + mensajes cortos.",
          ] },
        { h2: "Ideas para la galería de baby shower",
          paragraphs: ["Algunos usos creativos con significado:"],
          bullets: [
            "Mensajes en vídeo — cada invitado envía una nota corta al bebé.",
            "Fotos «adivina el tamaño de la barriga» — con cinta métrica.",
            "Fotos de regalos desde distintos ángulos.",
            "Foto de grupo al final, proyectada para todos.",
          ] },
        { h2: "Qué hacer después con las fotos",
          paragraphs: ["Tras el evento descargas todo en ZIP. De la selección puedes imprimir un libro pequeño para regalarlo al niño cuando nazca — un documento de las horas anteriores, cuando todos estaban esperándolo."] },
      ],
      faq: [
        { q: "¿La galería de baby shower es privada?",
          a: "Sí. Sólo acceden las personas con enlace directo o QR. No se indexa públicamente." },
        { q: "¿Pueden los invitados enviar vídeos?",
          a: "Sí, con el plan Plus pueden subir hasta 100 vídeos. El vídeo es perfecto para felicitaciones al bebé." },
        { q: "¿Cuántas fotos puedo recopilar?",
          a: "Gratis hasta 20 fotos. Para un baby shower con más invitados recomendamos Plus (49 €, 5000 fotos y 100 vídeos)." },
      ],
      ctaHeading: "Crea la galería para el baby shower",
      ctaBody: "En 2 minutos — QR para las mesas, mensajes en vídeo, proyección en tiempo real.",
      ctaButton: "Crear galería",
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
