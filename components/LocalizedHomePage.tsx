import Link from "next/link";
import { LanguageSwitcher, HOME_HREFLANG, type LangCode } from "@/components/LanguageSwitcher";
import { SeoFooter } from "@/components/SeoFooter";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";

type Lang = Exclude<LangCode, "sl">;

// ─── Inline icons (same as homepage) ─────────────────────────────────────────
function IconQR() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h.01M14 17h.01M17 14h.01M20 14h.01M20 17v3M17 20h3M17 17h.01" />
    </svg>
  );
}
function IconGlobe() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>); }
function IconLock()   { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>); }
function IconCamera() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>); }
function IconBolt()   { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>); }
function IconPhone()  { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>); }

// Mini QR mockup used inside the rich template-card overlays. Same pattern
// as the one on the SL homepage so all languages look identical.
function QRPattern() {
  const cells = [
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,0,1,1,0,1,0,1,1,0,0,1,0],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,1,1,0],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,1,1],
    [1,1,1,1,1,1,1,0,0,1,1,0,0,1,1,0,1],
  ];
  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(17, 1fr)`, width: 68, height: 68 }}>
      {cells.flat().map((v, i) => (
        <div key={i} style={{ backgroundColor: v ? '#0F1729' : 'transparent' }} />
      ))}
    </div>
  );
}

/**
 * Visual data for the 8 template preview cards in the "Print templates"
 * section. Shared across all languages so each one renders identically
 * to the SL homepage — the localised `printTemplates[i].name` (and the
 * localised `useTemplateCta` hover label) layer on top.
 *
 * Order MUST match `printTemplates` in every Lang's COPY entry.
 */
const TEMPLATE_VISUALS: Array<{ bg: string; headline: string; sub: string; rotate: number; dark: boolean }> = [
  { bg: "photo-1537633552985-df8429e8048b", headline: "Capture the Love ♥", sub: "Scan & share",       rotate: -3, dark: false },
  { bg: "photo-1523438885200-e635ba2c371e", headline: "Share Our Memories", sub: "Share the memories", rotate:  2, dark: false },
  { bg: "photo-1606800052052-a08af7148866", headline: "Thank You",          sub: "For shared memories", rotate: -1, dark: false },
  { bg: "photo-1515934751635-c81c6bc9a2d8", headline: "Scan & Share",       sub: "No app required",     rotate:  2, dark: false },
  { bg: "photo-1501286353178-1ec881214838", headline: "Collect Memories",   sub: "Scan the QR code",    rotate: -2, dark: false },
  { bg: "photo-1520854221256-17451cc331bf", headline: "Our Memories",       sub: "Scan to share",       rotate:  1, dark: true  },
  { bg: "photo-1465495976277-4387d4b0b4c6", headline: "Your Day",           sub: "Add a photo",         rotate: -2, dark: false },
  { bg: "photo-1529634806980-85c3dd6d34ac", headline: "Share the Love",     sub: "Scan the QR code",    rotate:  2, dark: true  },
];

// ─── Translation copy ────────────────────────────────────────────────────────
interface Copy {
  switcherAria: string;
  navHome: string;
  navCta: string;
  announce: string;
  announceLink: string;
  heroEyebrow: string;
  heroHead: { lead: string; accent: string; trail?: string };
  heroLead: string;
  heroPrimary: string;
  heroDemoBtn: string;
  heroNote: string;
  trustText: string;
  trust500: string;
  threeStep: { takePhoto: string; scanQr: string; upload: string };
  statsCreated: string;
  statsRating: string;
  statsPhotos: string;
  printEyebrow: string;
  printTitle: string;
  printSubtitle: string;
  printNote: string;
  printCta: string;
  printTemplates: { name: string }[];
  useTemplateCta: string;
  howEyebrow: string;
  howTitle: { line1: string; line2: string };
  howSubtitle: string;
  howCta: string;
  howSteps: { label: string; title: string; desc: string }[];
  whyTitle: string;
  whySubtitle: string;
  whyCards: { icon: string; title: string; desc: string }[];
  featuresTitle: string;
  featuresLead1: string;
  featuresLead2: string;
  features: { title: string; desc: string }[];
  reviewsTitle: string;
  reviews: { text: string; name: string; date: string }[];
  pricingTitle: string;
  pricingSubtitle: string;
  free: { label: string; tagline: string; price: string; features: string[]; cta: string };
  basic: { label: string; tagline: string; price: string; was: string; features: string[]; cta: string };
  plus: { label: string; tagline: string; price: string; was: string; features: string[]; cta: string; ribbon: string };
  premium: { label: string; tagline: string; price: string; was: string; features: string[]; cta: string };
  guarantee: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  ctaTitle: { line1: string; accent: string };
  ctaSubtitle: string;
  ctaButton: string;
  ctaTrust: string;
}

const COPY: Record<Lang, Copy> = {
  hr: {
    switcherAria: "Promijeni jezik", navHome: "Početna", navCta: "Kreiraj galeriju",
    announce: "Kreirajte galeriju danas — besplatno zauvijek! 🎉", announceLink: "Započni odmah →",
    heroEyebrow: "QR kod za vjenčanja · rođendane · obljetnice · baby tuš",
    heroHead: { lead: "Fotografije s vjenčanja koje", accent: "inače nikada ne biste vidjeli", trail: "." },
    heroLead: "Skupite sve fotografije i videozapise svojih gostiju u jednoj privatnoj galeriji. Gosti samo skeniraju QR kod i u nekoliko sekundi dijele svoje trenutke.",
    heroPrimary: "Započni besplatno", heroDemoBtn: "Pogledaj demo", heroNote: "Bez kreditne kartice • Spremno za manje od 2 minute",
    trustText: "Povjerenje", trust500: "500+ parova i organizatora",
    threeStep: { takePhoto: "Gosti fotografiraju", scanQr: "Skeniraju QR", upload: "Učitavaju fotografije" },
    statsCreated: "kreiranih galerija", statsRating: "na temelju prvih ocjena", statsPhotos: "prikupljenih fotografija",
    printEyebrow: "Predlošci za tisak", printTitle: "Kartice koje potiču goste na dijeljenje fotografija",
    printSubtitle: "Odaberite dizajn, dodajte svoj QR kod i ispišite. Više gostiju sudjeluje, više nezaboravnih trenutaka u vašoj galeriji.",
    printNote: "Svaki predložak uključuje vaše ime, datum i personalizirani QR kod",
    printCta: "Kreiraj galeriju i preuzmi predloške →",
    useTemplateCta: "Koristi predložak",
    printTemplates: [
      { name: "Klasična" }, { name: "Botanička" }, { name: "Elegantna" }, { name: "Cvjetna" },
      { name: "Rustikalna" }, { name: "Moderna" }, { name: "Minimalistička" }, { name: "Skandinavska" },
    ],
    howEyebrow: "Kako radi",
    howTitle: { line1: "Lako za vas,", line2: "jednostavno za goste" },
    howSubtitle: "Za manje od dvije minute napravite privatnu galeriju koja će prikupljati sve fotografije i videozapise vašeg događaja.",
    howCta: "Kreiraj svoju galeriju sada →",
    howSteps: [
      { label: "KORAK 01", title: "Kreirajte galeriju", desc: "Kreirajte svoju galeriju, odaberite dizajn QR kartice i ispišite je. Postavite kartice na stolove ili kod ulaza." },
      { label: "KORAK 02", title: "Gosti dijele fotografije", desc: "Gosti samo skeniraju QR kod i odmah počinju dijeliti fotografije i videozapise u punoj kvaliteti. Bez aplikacije i bez prijave." },
      { label: "KORAK 03", title: "Uživajte u uspomenama", desc: "Pogledajte sve fotografije i videozapise na jednom mjestu i preuzmite ih u punoj kvaliteti kad god želite." },
    ],
    whyTitle: "Svaki gost fotografira. Vi te slike nikada ne vidite.",
    whySubtitle: "Svaki gost uhvati drugačije trenutke. Većina tih fotografija ostane na njihovim telefonima.",
    whyCards: [
      { icon: "📷", title: "Fotograf ne može biti svugdje", desc: "Gosti uhvate spontane trenutke koje profesionalni fotograf često propusti. Upravo ti neplanirani trenuci postaju najljepše uspomene." },
      { icon: "📱", title: "Fotografije ostaju na telefonima", desc: "Nakon događaja fotografije su razasute po telefonima, WhatsApp grupama i društvenim mrežama. Većinu organizator nikad ne primi." },
      { icon: "👁",  title: "Doživite događaj kroz oči svojih gostiju", desc: "Pogledajte trenutke koje ste možda propustili i složite cijelu priču događaja iz svih kutova." },
    ],
    featuresTitle: "Zašto izabrati Guestcam?",
    featuresLead1: "Sve fotografije i videozapisi vaših gostiju. Na jednom mjestu.",
    featuresLead2: "Bez aplikacija, bez slanja WhatsAppom i bez izgubljenih uspomena.",
    features: [
      { title: "Bez aplikacije", desc: "Gosti samo skeniraju QR kod i počinju dijeliti fotografije. Bez preuzimanja aplikacije, registracije ili prijave." },
      { title: "Više jezika", desc: "Sučelje se prikazuje na jeziku vaših gostiju, pa lako sudjeluju i međunarodni posjetitelji." },
      { title: "Potpuna privatnost", desc: "Fotografije i videi vidljivi su samo vama i gostima. Bez javnih galerija i neželjenog dijeljenja." },
      { title: "Puna kvaliteta", desc: "Sve fotografije i videozapisi pohranjuju se u originalnoj kvaliteti. Bez kompresije, bez gubitka detalja." },
      { title: "Uživo tijekom događaja", desc: "Nove fotografije pojavljuju se odmah dok ih gosti učitavaju. Pratite trenutke već za vrijeme samog događaja." },
      { title: "Prilagođeno vašem događaju", desc: "Odaberite dizajn QR kartice koji odgovara vašem događaju i stvorite iskustvo koje djeluje kao dio slavlja." },
    ],
    reviewsTitle: "Mišljenja naših parova",
    reviews: [
      { text: "Sjajna ideja! Dobili smo toliko spontanih fotografija koje fotograf nikad ne bi uhvatio. Gosti su bili oduševljeni koliko je to bilo jednostavno.", name: "Tina & Luka", date: "Travanj 2026" },
      { text: "Postavili smo QR kod na svaki stol i već smo tijekom večere imali 200+ fotografija. Genijalno! Svima preporučujem.", name: "Ana & Marko", date: "Lipanj 2025" },
      { text: "Konačno smo sve uspomene skupili na jednom mjestu. Gosti iz inozemstva su učitavali fotografije na svom jeziku bez ikakvih problema.", name: "Sara & David", date: "Rujan 2025" },
    ],
    pricingTitle: "Jednostavni paketi", pricingSubtitle: "Odaberite paket koji odgovara vašem događaju.",
    free: { label: "Besplatno", tagline: "Isprobajte bez rizika", price: "0€",
      features: ["Jedinstveni QR kod", "Do 20 fotografija", "1 videozapis", "Pristup 30 dana", "Bez sigurnosne kopije"], cta: "Započni besplatno" },
    basic: { label: "Basic", tagline: "Za manje događaje", price: "39€", was: "55€",
      features: ["Jedinstveni QR kod", "Do 1000 fotografija", "Do 10 videozapisa", "Pristup galeriji 3 mjeseca", "Preuzimanje svih slika (ZIP)"], cta: "Odaberi Basic" },
    plus: { label: "Plus", tagline: "Za veće događaje i vjenčanja", price: "49€", was: "69€",
      features: ["Jedinstveni QR kod", "Neograničen broj gostiju", "Neograničeno fotografija", "Do 100 videozapisa", "Pristup galeriji 1 godinu", "Preuzimanje svih slika (ZIP)", "Live galerija (projekcija)", "Personalizirana stranica s imenima", "E-mail obavijesti za par"], cta: "Odaberi Plus", ribbon: "NAJPOPULARNIJE" },
    premium: { label: "Premium", tagline: "Za one koji žele sve", price: "79€", was: "109€",
      features: ["Jedinstveni QR kod", "Neograničen broj gostiju", "Neograničeno fotografija", "Do 100 videozapisa", "Pristup galeriji 1 godinu", "Preuzimanje svih slika (ZIP)", "Live galerija (projekcija)", "Personalizirana stranica s imenima", "Vlastita domena (foto.vaše-ime.si)", "Premium dizajn predlošci", "Prioritetna podrška"], cta: "Odaberi Premium" },
    guarantee: "30-dnevno jamstvo povrata novca – bez pitanja.",
    faqTitle: "Često postavljana pitanja",
    faqs: [
      { q: "Moraju li gosti preuzeti aplikaciju?", a: "Ne. Gosti otvore album direktno u pregledniku telefona — bez instalacije, bez prijave. Samo skeniraju QR kod i odmah učitavaju fotografije." },
      { q: "Jesu li fotografije privatne?", a: "Da. Album je dostupan samo s vašim QR kodom ili poveznicom. Po želji ga zaštitite lozinkom za dodatnu sigurnost." },
      { q: "U kojoj kvaliteti se pohranjuju fotografije?", a: "U punoj originalnoj rezoluciji, bez ikakve kompresije ili smanjenja kvalitete." },
      { q: "Podržavate li videozapise?", a: "Pro i Premium paketi podržavaju učitavanje videozapisa do 500 MB po snimci." },
      { q: "Što se događa nakon događaja?", a: "Album ostaje aktivan dok traje vaš paket. Sve fotografije i videozapise možete u bilo kojem trenutku preuzeti kao ZIP arhivu ili spremiti izravno u Google Drive." },
    ],
    ctaTitle: { line1: "Doživite svoj događaj kroz oči", accent: "svih svojih gostiju" },
    ctaSubtitle: "Sve fotografije i videozapisi u punoj kvaliteti. Bez aplikacije, bez komplikacija.",
    ctaButton: "Kreiraj galeriju sada", ctaTrust: "Bez kreditne kartice • Spremno za manje od 2 minute",
  },
  sr: {
    switcherAria: "Promeni jezik", navHome: "Početna", navCta: "Napravi galeriju",
    announce: "Napravite galeriju danas — besplatno zauvek! 🎉", announceLink: "Započni odmah →",
    heroEyebrow: "QR kod za venčanja · rođendane · godišnjice · baby tuš",
    heroHead: { lead: "Fotografije sa venčanja koje", accent: "inače nikada ne biste videli", trail: "." },
    heroLead: "Sakupite sve fotografije i video snimke svojih gostiju u jednoj privatnoj galeriji. Gosti samo skeniraju QR kod i za nekoliko sekundi dele svoje trenutke.",
    heroPrimary: "Započni besplatno", heroDemoBtn: "Pogledaj demo", heroNote: "Bez kreditne kartice • Spremno za manje od 2 minuta",
    trustText: "Poverenje", trust500: "500+ parova i organizatora",
    threeStep: { takePhoto: "Gosti fotografišu", scanQr: "Skeniraju QR", upload: "Otpremaju fotografije" },
    statsCreated: "napravljenih galerija", statsRating: "na osnovu prvih ocena", statsPhotos: "sakupljenih fotografija",
    printEyebrow: "Šabloni za štampu", printTitle: "Kartice koje podstiču goste na deljenje fotografija",
    printSubtitle: "Izaberite dizajn, dodajte svoj QR kod i odštampajte. Više gostiju učestvuje, više nezaboravnih trenutaka u vašoj galeriji.",
    printNote: "Svaki šablon uključuje vaše ime, datum i personalizovani QR kod",
    printCta: "Napravi galeriju i preuzmi šablone →",
    useTemplateCta: "Koristi šablon",
    printTemplates: [
      { name: "Klasična" }, { name: "Botanička" }, { name: "Elegantna" }, { name: "Cvetna" },
      { name: "Rustikalna" }, { name: "Moderna" }, { name: "Minimalistička" }, { name: "Skandinavska" },
    ],
    howEyebrow: "Kako radi",
    howTitle: { line1: "Lako za vas,", line2: "jednostavno za goste" },
    howSubtitle: "Za manje od dva minuta napravite privatnu galeriju koja će sakupljati sve fotografije i video snimke vašeg događaja.",
    howCta: "Napravi svoju galeriju odmah →",
    howSteps: [
      { label: "KORAK 01", title: "Napravite galeriju", desc: "Napravite svoju galeriju, izaberite dizajn QR kartice i odštampajte je. Postavite kartice na stolove ili kod ulaza." },
      { label: "KORAK 02", title: "Gosti dele fotografije", desc: "Gosti samo skeniraju QR kod i odmah počinju da dele fotografije i video snimke u punom kvalitetu. Bez aplikacije i bez prijave." },
      { label: "KORAK 03", title: "Uživajte u uspomenama", desc: "Pogledajte sve fotografije i video snimke na jednom mestu i preuzmite ih u punom kvalitetu kad god želite." },
    ],
    whyTitle: "Svaki gost fotografiše. Vi te slike nikada ne vidite.",
    whySubtitle: "Svaki gost uhvati drugačije trenutke. Većina tih fotografija ostane na njihovim telefonima.",
    whyCards: [
      { icon: "📷", title: "Fotograf ne može biti svuda", desc: "Gosti uhvate spontane trenutke koje profesionalni fotograf često propusti. Upravo ti neplanirani trenuci postaju najlepše uspomene." },
      { icon: "📱", title: "Fotografije ostaju na telefonima", desc: "Posle događaja fotografije su raspršene po telefonima, WhatsApp grupama i društvenim mrežama. Većinu organizator nikad ne dobije." },
      { icon: "👁",  title: "Doživite događaj kroz oči svojih gostiju", desc: "Pogledajte trenutke koje ste možda propustili i sastavite celu priču događaja iz svih uglova." },
    ],
    featuresTitle: "Zašto izabrati Guestcam?",
    featuresLead1: "Sve fotografije i video snimci vaših gostiju. Na jednom mestu.",
    featuresLead2: "Bez aplikacija, bez slanja WhatsAppom i bez izgubljenih uspomena.",
    features: [
      { title: "Bez aplikacije", desc: "Gosti samo skeniraju QR kod i počinju da dele fotografije. Bez preuzimanja aplikacije, registracije ili prijave." },
      { title: "Više jezika", desc: "Interfejs se prikazuje na jeziku vaših gostiju, pa lako učestvuju i međunarodni posetioci." },
      { title: "Potpuna privatnost", desc: "Fotografije i video snimci su vidljivi samo vama i gostima. Bez javnih galerija i neželjenog deljenja." },
      { title: "Pun kvalitet", desc: "Sve fotografije i video snimci se čuvaju u originalnom kvalitetu. Bez kompresije, bez gubitka detalja." },
      { title: "Uživo tokom događaja", desc: "Nove fotografije pojavljuju se odmah dok ih gosti otpremaju. Pratite trenutke već tokom samog događaja." },
      { title: "Prilagođeno vašem događaju", desc: "Izaberite dizajn QR kartice koji odgovara vašem događaju i napravite iskustvo koje deluje kao deo slavlja." },
    ],
    reviewsTitle: "Mišljenja naših parova",
    reviews: [
      { text: "Sjajna ideja! Dobili smo toliko spontanih fotografija koje fotograf nikad ne bi uhvatio. Gosti su bili oduševljeni koliko je to bilo jednostavno.", name: "Tina & Luka", date: "April 2026" },
      { text: "Postavili smo QR kod na svaki sto i već tokom večere imali 200+ fotografija. Genijalno! Svima preporučujem.", name: "Ana & Marko", date: "Jun 2025" },
      { text: "Konačno smo sve uspomene sakupili na jednom mestu. Gosti iz inostranstva su otpremali fotografije na svom jeziku bez ikakvih problema.", name: "Sara & David", date: "Septembar 2025" },
    ],
    pricingTitle: "Jednostavni paketi", pricingSubtitle: "Izaberite paket koji odgovara vašem događaju.",
    free: { label: "Besplatno", tagline: "Isprobajte bez rizika", price: "0€",
      features: ["Jedinstveni QR kod", "Do 20 fotografija", "1 video snimak", "Pristup 30 dana", "Bez rezervne kopije"], cta: "Započni besplatno" },
    basic: { label: "Basic", tagline: "Za manje događaje", price: "39€", was: "55€",
      features: ["Jedinstveni QR kod", "Do 1000 fotografija", "Do 10 video snimaka", "Pristup galeriji 3 meseca", "Preuzimanje svih slika (ZIP)"], cta: "Izaberi Basic" },
    plus: { label: "Plus", tagline: "Za veće događaje i venčanja", price: "49€", was: "69€",
      features: ["Jedinstveni QR kod", "Neograničen broj gostiju", "Neograničeno fotografija", "Do 100 video snimaka", "Pristup galeriji 1 godinu", "Preuzimanje svih slika (ZIP)", "Live galerija (projekcija)", "Personalizovana stranica sa imenima", "E-mail obaveštenja za par"], cta: "Izaberi Plus", ribbon: "NAJPOPULARNIJE" },
    premium: { label: "Premium", tagline: "Za one koji žele sve", price: "79€", was: "109€",
      features: ["Jedinstveni QR kod", "Neograničen broj gostiju", "Neograničeno fotografija", "Do 100 video snimaka", "Pristup galeriji 1 godinu", "Preuzimanje svih slika (ZIP)", "Live galerija (projekcija)", "Personalizovana stranica sa imenima", "Sopstveni domen (foto.vase-ime.si)", "Premium dizajn šabloni", "Prioritetna podrška"], cta: "Izaberi Premium" },
    guarantee: "30-dnevna garancija povraćaja novca – bez pitanja.",
    faqTitle: "Često postavljana pitanja",
    faqs: [
      { q: "Da li gosti moraju da preuzmu aplikaciju?", a: "Ne. Gosti otvaraju album direktno u pretraživaču telefona — bez instalacije, bez prijave. Samo skeniraju QR kod i odmah otpremaju fotografije." },
      { q: "Da li su fotografije privatne?", a: "Da. Album je dostupan samo preko vašeg QR koda ili linka. Po želji ga zaštitite lozinkom za dodatnu sigurnost." },
      { q: "U kom kvalitetu se čuvaju fotografije?", a: "U punoj originalnoj rezoluciji, bez ikakve kompresije ili smanjenja kvaliteta." },
      { q: "Da li podržavate video snimke?", a: "Pro i Premium paketi podržavaju otpremanje video snimaka do 500 MB po snimku." },
      { q: "Šta se dešava posle događaja?", a: "Album ostaje aktivan dok traje vaš paket. Sve fotografije i video snimke možete u bilo kom trenutku preuzeti kao ZIP arhivu ili sačuvati direktno u Google Drive." },
    ],
    ctaTitle: { line1: "Doživite svoj događaj kroz oči", accent: "svih svojih gostiju" },
    ctaSubtitle: "Sve fotografije i video snimci u punom kvalitetu. Bez aplikacije, bez komplikacija.",
    ctaButton: "Napravi galeriju odmah", ctaTrust: "Bez kreditne kartice • Spremno za manje od 2 minuta",
  },
  de: {
    switcherAria: "Sprache ändern", navHome: "Startseite", navCta: "Album erstellen",
    announce: "Erstellen Sie heute eine Galerie — für immer kostenlos! 🎉", announceLink: "Jetzt starten →",
    heroEyebrow: "QR-Code für Hochzeiten · Geburtstage · Jubiläen · Babyparty",
    heroHead: { lead: "Hochzeitsfotos, die Sie sonst", accent: "nie zu sehen bekommen würden", trail: "." },
    heroLead: "Sammeln Sie alle Fotos und Videos Ihrer Gäste in einer privaten Galerie. Gäste scannen einfach den QR-Code und teilen ihre Momente in Sekunden.",
    heroPrimary: "Kostenlos starten", heroDemoBtn: "Demo ansehen", heroNote: "Keine Kreditkarte • Bereit in unter 2 Minuten",
    trustText: "Vertrauen von", trust500: "500+ Paaren und Veranstaltern",
    threeStep: { takePhoto: "Gäste fotografieren", scanQr: "QR scannen", upload: "Fotos hochladen" },
    statsCreated: "erstellte Galerien", statsRating: "auf Basis erster Bewertungen", statsPhotos: "gesammelte Fotos",
    printEyebrow: "Druckvorlagen", printTitle: "Karten, die Gäste zum Teilen motivieren",
    printSubtitle: "Wählen Sie ein Design, fügen Sie Ihren QR-Code hinzu und drucken Sie. Je mehr Gäste mitmachen, desto mehr Erinnerungen in Ihrer Galerie.",
    printNote: "Jede Vorlage enthält Ihren Namen, Datum und personalisierten QR-Code",
    printCta: "Galerie erstellen und Vorlagen herunterladen →",
    useTemplateCta: "Vorlage verwenden",
    printTemplates: [
      { name: "Klassisch" }, { name: "Botanisch" }, { name: "Elegant" }, { name: "Blumen" },
      { name: "Rustikal" }, { name: "Modern" }, { name: "Minimalistisch" }, { name: "Skandinavisch" },
    ],
    howEyebrow: "So funktioniert's",
    howTitle: { line1: "Einfach für Sie,", line2: "mühelos für Gäste" },
    howSubtitle: "Erstellen Sie in unter zwei Minuten eine private Galerie, die alle Fotos und Videos Ihrer Veranstaltung sammelt.",
    howCta: "Galerie jetzt erstellen →",
    howSteps: [
      { label: "SCHRITT 01", title: "Galerie erstellen", desc: "Erstellen Sie Ihre Galerie, wählen Sie ein QR-Karten-Design und drucken Sie es. Stellen Sie die Karten auf die Tische oder an den Eingang." },
      { label: "SCHRITT 02", title: "Gäste teilen Fotos", desc: "Gäste scannen einfach den QR-Code und beginnen sofort, Fotos und Videos in voller Qualität zu teilen. Keine App, keine Anmeldung." },
      { label: "SCHRITT 03", title: "Erinnerungen genießen", desc: "Schauen Sie sich alle Fotos und Videos an einem Ort an und laden Sie sie jederzeit in voller Qualität herunter." },
    ],
    whyTitle: "Jeder Gast fotografiert. Sie sehen diese Fotos nie.",
    whySubtitle: "Jeder Gast hält andere Momente fest. Die meisten dieser Fotos bleiben auf den Handys.",
    whyCards: [
      { icon: "📷", title: "Der Fotograf kann nicht überall sein", desc: "Gäste fangen spontane Momente ein, die der Profi oft verpasst. Gerade diese ungeplanten Augenblicke werden zu den schönsten Erinnerungen." },
      { icon: "📱", title: "Fotos bleiben auf den Handys", desc: "Nach der Veranstaltung sind Fotos auf Telefonen, in WhatsApp-Gruppen und sozialen Medien verstreut. Die meisten erreichen den Veranstalter nie." },
      { icon: "👁",  title: "Erleben Sie den Tag durch die Augen Ihrer Gäste", desc: "Sehen Sie Momente, die Sie vielleicht verpasst haben, und setzen Sie die ganze Geschichte aus allen Blickwinkeln zusammen." },
    ],
    featuresTitle: "Warum Guestcam wählen?",
    featuresLead1: "Alle Fotos und Videos Ihrer Gäste. An einem Ort.",
    featuresLead2: "Ohne Apps, ohne WhatsApp-Versand und ohne verlorene Erinnerungen.",
    features: [
      { title: "Keine App", desc: "Gäste scannen einfach den QR-Code und teilen Fotos. Keine App, keine Registrierung, keine Anmeldung." },
      { title: "Mehrere Sprachen", desc: "Die Oberfläche zeigt sich in der Sprache Ihrer Gäste, damit auch internationale Besucher problemlos mitmachen." },
      { title: "Volle Privatsphäre", desc: "Fotos und Videos sind nur für Sie und Ihre Gäste sichtbar. Keine öffentlichen Galerien, keine ungewollte Verbreitung." },
      { title: "Volle Qualität", desc: "Alle Fotos und Videos werden in Originalqualität gespeichert. Keine Kompression, kein Detailverlust." },
      { title: "Live während der Feier", desc: "Neue Fotos erscheinen sofort, sobald Gäste sie hochladen. Verfolgen Sie die Momente schon während der Veranstaltung." },
      { title: "An Ihre Feier angepasst", desc: "Wählen Sie ein QR-Karten-Design, das zu Ihrer Feier passt — und schaffen Sie ein Erlebnis, das wie Teil der Feier wirkt." },
    ],
    reviewsTitle: "Meinungen unserer Paare",
    reviews: [
      { text: "Geniale Idee! Wir haben so viele spontane Fotos bekommen, die der Fotograf nie eingefangen hätte. Die Gäste waren begeistert, wie einfach es war.", name: "Tina & Luka", date: "April 2026" },
      { text: "Wir haben den QR-Code auf jeden Tisch gestellt und schon beim Abendessen über 200 Fotos gehabt. Einfach genial!", name: "Ana & Marko", date: "Juni 2025" },
      { text: "Endlich alle Erinnerungen an einem Ort. Internationale Gäste haben Fotos in ihrer Sprache problemlos hochgeladen.", name: "Sara & David", date: "September 2025" },
    ],
    pricingTitle: "Einfache Pakete", pricingSubtitle: "Wählen Sie das Paket, das zu Ihrer Feier passt.",
    free: { label: "Kostenlos", tagline: "Risikolos testen", price: "0€",
      features: ["Einzigartiger QR-Code", "Bis zu 20 Fotos", "1 Video", "30 Tage Zugriff", "Keine Sicherung"], cta: "Kostenlos starten" },
    basic: { label: "Basic", tagline: "Für kleinere Feiern", price: "39€", was: "55€",
      features: ["Einzigartiger QR-Code", "Bis zu 1000 Fotos", "Bis zu 10 Videos", "3 Monate Galerie-Zugriff", "Download aller Bilder (ZIP)"], cta: "Basic wählen" },
    plus: { label: "Plus", tagline: "Für größere Feiern und Hochzeiten", price: "49€", was: "69€",
      features: ["Einzigartiger QR-Code", "Unbegrenzt Gäste", "Unbegrenzt Fotos", "Bis zu 100 Videos", "1 Jahr Galerie-Zugriff", "Download aller Bilder (ZIP)", "Live-Galerie (Projektion)", "Personalisierte Seite mit Namen", "E-Mail-Benachrichtigungen"], cta: "Plus wählen", ribbon: "BELIEBTESTE" },
    premium: { label: "Premium", tagline: "Für alle, die alles wollen", price: "79€", was: "109€",
      features: ["Einzigartiger QR-Code", "Unbegrenzt Gäste", "Unbegrenzt Fotos", "Bis zu 100 Videos", "1 Jahr Galerie-Zugriff", "Download aller Bilder (ZIP)", "Live-Galerie (Projektion)", "Personalisierte Seite mit Namen", "Eigene Domain (foto.ihr-name.si)", "Premium-Design-Vorlagen", "Prioritäts-Support"], cta: "Premium wählen" },
    guarantee: "30-Tage-Geld-zurück-Garantie – ohne Wenn und Aber.",
    faqTitle: "Häufige Fragen",
    faqs: [
      { q: "Müssen Gäste eine App herunterladen?", a: "Nein. Gäste öffnen das Album direkt im Browser ihres Handys — keine Installation, keine Anmeldung. Sie scannen einfach den QR-Code und laden sofort Fotos hoch." },
      { q: "Sind die Fotos privat?", a: "Ja. Das Album ist nur über Ihren QR-Code oder Link zugänglich. Auf Wunsch schützen Sie es zusätzlich mit einem Passwort." },
      { q: "In welcher Qualität werden Fotos gespeichert?", a: "In voller Originalauflösung, ohne jegliche Kompression oder Qualitätsverlust." },
      { q: "Unterstützen Sie Videos?", a: "Pro- und Premium-Pakete unterstützen Videos bis zu 500 MB pro Datei." },
      { q: "Was passiert nach der Veranstaltung?", a: "Das Album bleibt so lange aktiv wie Ihr Paket. Alle Fotos und Videos können Sie jederzeit als ZIP herunterladen oder direkt in Google Drive sichern." },
    ],
    ctaTitle: { line1: "Erleben Sie Ihre Feier durch die Augen", accent: "aller Ihrer Gäste" },
    ctaSubtitle: "Alle Fotos und Videos in voller Qualität. Keine App, keine Komplikationen.",
    ctaButton: "Galerie jetzt erstellen", ctaTrust: "Keine Kreditkarte • Bereit in unter 2 Minuten",
  },
  en: {
    switcherAria: "Change language", navHome: "Home", navCta: "Create gallery",
    announce: "Create a gallery today — free forever! 🎉", announceLink: "Start now →",
    heroEyebrow: "QR codes for weddings · birthdays · anniversaries · baby showers",
    heroHead: { lead: "The wedding photos you", accent: "would otherwise never see", trail: "." },
    heroLead: "Collect every photo and video your guests take into a single private gallery. Guests scan a QR code and share their moments in seconds.",
    heroPrimary: "Start for free", heroDemoBtn: "See live demo", heroNote: "No credit card • Ready in under 2 minutes",
    trustText: "Trusted by", trust500: "500+ couples & event planners",
    threeStep: { takePhoto: "Guests snap", scanQr: "Scan QR", upload: "Upload photos" },
    statsCreated: "galleries created", statsRating: "based on early reviews", statsPhotos: "photos collected",
    printEyebrow: "Print templates", printTitle: "Cards that get guests to share photos",
    printSubtitle: "Pick a design, add your QR code and print. The more guests join in, the more unforgettable moments end up in your gallery.",
    printNote: "Every template includes your name, date and personalised QR code",
    printCta: "Create gallery and download templates →",
    useTemplateCta: "Use template",
    printTemplates: [
      { name: "Classic" }, { name: "Botanical" }, { name: "Elegant" }, { name: "Floral" },
      { name: "Rustic" }, { name: "Modern" }, { name: "Minimal" }, { name: "Scandi" },
    ],
    howEyebrow: "How it works",
    howTitle: { line1: "Easy for you,", line2: "effortless for guests" },
    howSubtitle: "In under two minutes, create a private gallery that collects every photo and video from your event.",
    howCta: "Create your gallery now →",
    howSteps: [
      { label: "STEP 01", title: "Create your gallery", desc: "Create your gallery, pick a QR card design and print it. Place the cards on tables or by the entrance." },
      { label: "STEP 02", title: "Guests share photos", desc: "Guests just scan the QR code and start uploading photos and videos in full quality right away. No app, no sign-up." },
      { label: "STEP 03", title: "Enjoy the memories", desc: "View every photo and video in one place — and download them in full quality whenever you want." },
    ],
    whyTitle: "Every guest takes photos. You never see them.",
    whySubtitle: "Every guest captures different moments. Most of those photos stay on their phones.",
    whyCards: [
      { icon: "📷", title: "Your photographer can't be everywhere", desc: "Guests capture spontaneous moments a pro often misses. These unplanned moments often become the most precious memories." },
      { icon: "📱", title: "Photos stay on phones", desc: "After the event, photos scatter across phones, WhatsApp groups and social media. Most never reach the host." },
      { icon: "👁",  title: "See your event through your guests' eyes", desc: "See moments you might have missed and assemble the full story from every angle." },
    ],
    featuresTitle: "Why choose Guestcam?",
    featuresLead1: "All your guests' photos and videos. In one place.",
    featuresLead2: "No apps, no WhatsApp forwarding, no lost memories.",
    features: [
      { title: "No app", desc: "Guests scan the QR code and start sharing photos. No app download, no sign-up." },
      { title: "Multiple languages", desc: "The interface adapts to your guests' language so international visitors join in effortlessly." },
      { title: "Fully private", desc: "Photos and videos are only visible to you and your guests. No public galleries, no unwanted sharing." },
      { title: "Full quality", desc: "Every photo and video is stored in original resolution. No compression, no detail loss." },
      { title: "Live during the day", desc: "New photos appear as guests upload them, so you can enjoy the moments while the event is still going." },
      { title: "Tailored to your event", desc: "Pick a QR card design that fits your event and create an experience that looks like part of the celebration." },
    ],
    reviewsTitle: "What couples say",
    reviews: [
      { text: "Brilliant idea! We got so many spontaneous photos a pro never would have caught. Guests loved how easy it was.", name: "Tina & Luka", date: "April 2026" },
      { text: "We put a QR code on every table and had 200+ photos by dinner. Pure genius!", name: "Ana & Marko", date: "June 2025" },
      { text: "Finally, all our memories in one place. Even international guests uploaded photos in their own language without any issues.", name: "Sara & David", date: "September 2025" },
    ],
    pricingTitle: "Simple plans", pricingSubtitle: "Pick the plan that fits your event.",
    free: { label: "Free", tagline: "Try risk-free", price: "€0",
      features: ["Unique QR code", "Up to 20 photos", "1 video", "30-day access", "No backup"], cta: "Start free" },
    basic: { label: "Basic", tagline: "For smaller events", price: "€39", was: "€55",
      features: ["Unique QR code", "Up to 1000 photos", "Up to 10 videos", "3-month gallery access", "Bulk download (ZIP)"], cta: "Choose Basic" },
    plus: { label: "Plus", tagline: "For bigger events and weddings", price: "€49", was: "€69",
      features: ["Unique QR code", "Unlimited guests", "Unlimited photos", "Up to 100 videos", "1-year gallery access", "Bulk download (ZIP)", "Live gallery (projection)", "Personalised page with names", "Email notifications"], cta: "Choose Plus", ribbon: "MOST POPULAR" },
    premium: { label: "Premium", tagline: "For those who want it all", price: "€79", was: "€109",
      features: ["Unique QR code", "Unlimited guests", "Unlimited photos", "Up to 100 videos", "1-year gallery access", "Bulk download (ZIP)", "Live gallery (projection)", "Personalised page with names", "Custom domain (photos.yourname.com)", "Premium design templates", "Priority support"], cta: "Choose Premium" },
    guarantee: "30-day money-back guarantee — no questions asked.",
    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Do guests have to download an app?", a: "No. Guests open the album directly in their phone browser — no install, no sign-up. They just scan the QR code and upload photos instantly." },
      { q: "Are the photos private?", a: "Yes. The album is only accessible with your QR code or link. Optionally protect it with a password for extra security." },
      { q: "What quality are photos stored in?", a: "Full original resolution, with no compression or quality loss." },
      { q: "Do you support videos?", a: "Pro and Premium plans support video uploads up to 500 MB per file." },
      { q: "What happens after the event?", a: "The album stays active for the duration of your plan. You can download every photo and video as a ZIP archive at any time, or save them directly to Google Drive." },
    ],
    ctaTitle: { line1: "Experience your event through the eyes", accent: "of every guest" },
    ctaSubtitle: "Every photo and video in full quality. No app, no fuss.",
    ctaButton: "Create gallery now", ctaTrust: "No credit card • Ready in under 2 minutes",
  },
  es: {
    switcherAria: "Cambiar idioma", navHome: "Inicio", navCta: "Crear galería",
    announce: "Crea tu galería hoy — gratis para siempre 🎉", announceLink: "Empieza ahora →",
    heroEyebrow: "QR para bodas · cumpleaños · aniversarios · baby showers",
    heroHead: { lead: "Las fotos de tu boda que", accent: "de otra forma nunca verías", trail: "." },
    heroLead: "Reúne todas las fotos y vídeos de tus invitados en una sola galería privada. Tus invitados escanean un QR y comparten sus momentos en segundos.",
    heroPrimary: "Empezar gratis", heroDemoBtn: "Ver demo", heroNote: "Sin tarjeta • Listo en menos de 2 minutos",
    trustText: "Confianza de", trust500: "+500 parejas y organizadores",
    threeStep: { takePhoto: "Los invitados fotografían", scanQr: "Escanean QR", upload: "Suben fotos" },
    statsCreated: "galerías creadas", statsRating: "según primeras valoraciones", statsPhotos: "fotos recopiladas",
    printEyebrow: "Plantillas para imprimir", printTitle: "Tarjetas que invitan a tus invitados a compartir fotos",
    printSubtitle: "Elige un diseño, añade tu QR e imprime. Cuantos más invitados participen, más recuerdos llegarán a tu galería.",
    printNote: "Cada plantilla incluye tu nombre, fecha y código QR personalizado",
    printCta: "Crear galería y descargar plantillas →",
    useTemplateCta: "Usar plantilla",
    printTemplates: [
      { name: "Clásica" }, { name: "Botánica" }, { name: "Elegante" }, { name: "Floral" },
      { name: "Rústica" }, { name: "Moderna" }, { name: "Minimalista" }, { name: "Escandinava" },
    ],
    howEyebrow: "Cómo funciona",
    howTitle: { line1: "Fácil para ti,", line2: "sin esfuerzo para los invitados" },
    howSubtitle: "En menos de dos minutos crea una galería privada que reunirá todas las fotos y vídeos de tu evento.",
    howCta: "Crea tu galería ya →",
    howSteps: [
      { label: "PASO 01", title: "Crea tu galería", desc: "Crea tu galería, elige el diseño de la tarjeta QR e imprímela. Colócala en las mesas o a la entrada." },
      { label: "PASO 02", title: "Los invitados comparten fotos", desc: "Los invitados escanean el QR y empiezan a subir fotos y vídeos en calidad completa al instante. Sin app, sin registro." },
      { label: "PASO 03", title: "Disfruta los recuerdos", desc: "Ve todas las fotos y vídeos en un único lugar y descárgalos en calidad completa cuando quieras." },
    ],
    whyTitle: "Cada invitado hace fotos. Tú no las ves nunca.",
    whySubtitle: "Cada invitado captura momentos distintos. La mayoría se quedan en sus móviles.",
    whyCards: [
      { icon: "📷", title: "El fotógrafo no puede estar en todas partes", desc: "Los invitados capturan momentos espontáneos que un profesional suele perderse. Esos momentos no planeados son los recuerdos más bonitos." },
      { icon: "📱", title: "Las fotos se quedan en los móviles", desc: "Después del evento las fotos se dispersan entre móviles, WhatsApp y redes sociales. La mayoría nunca llegan al organizador." },
      { icon: "👁",  title: "Vive el evento a través de los ojos de tus invitados", desc: "Ve momentos que tal vez te perdiste y monta la historia completa desde todos los ángulos." },
    ],
    featuresTitle: "¿Por qué elegir Guestcam?",
    featuresLead1: "Todas las fotos y vídeos de tus invitados. En un solo lugar.",
    featuresLead2: "Sin apps, sin WhatsApp y sin recuerdos perdidos.",
    features: [
      { title: "Sin app", desc: "Los invitados escanean el QR y comparten fotos. Sin descargar app, sin registrarse." },
      { title: "Varios idiomas", desc: "La interfaz se muestra en el idioma de tus invitados, así los internacionales participan sin problema." },
      { title: "Privacidad total", desc: "Las fotos y vídeos solo los ven tú y tus invitados. Sin galerías públicas." },
      { title: "Calidad completa", desc: "Todas las fotos y vídeos en resolución original. Sin compresión, sin pérdida de detalle." },
      { title: "En directo durante el evento", desc: "Las fotos nuevas aparecen al instante mientras los invitados las suben." },
      { title: "Personalizado para tu evento", desc: "Elige un diseño de tarjeta QR que encaje con tu evento y crea una experiencia que parece parte de la celebración." },
    ],
    reviewsTitle: "Opiniones de nuestras parejas",
    reviews: [
      { text: "¡Idea genial! Recibimos muchas fotos espontáneas que el fotógrafo nunca habría captado. Los invitados encantados de lo fácil que era.", name: "Tina & Luka", date: "Abril 2026" },
      { text: "Pusimos un QR en cada mesa y a la hora de cenar ya teníamos +200 fotos. ¡Genial!", name: "Ana & Marko", date: "Junio 2025" },
      { text: "Por fin todos los recuerdos en un sitio. Incluso los invitados internacionales subieron fotos en su idioma sin ningún problema.", name: "Sara & David", date: "Septiembre 2025" },
    ],
    pricingTitle: "Planes sencillos", pricingSubtitle: "Elige el plan que encaje con tu evento.",
    free: { label: "Gratis", tagline: "Pruébalo sin riesgos", price: "0€",
      features: ["Código QR único", "Hasta 20 fotos", "1 vídeo", "Acceso 30 días", "Sin copia de seguridad"], cta: "Empezar gratis" },
    basic: { label: "Basic", tagline: "Para eventos pequeños", price: "39€", was: "55€",
      features: ["Código QR único", "Hasta 1000 fotos", "Hasta 10 vídeos", "Acceso 3 meses", "Descarga masiva (ZIP)"], cta: "Elegir Basic" },
    plus: { label: "Plus", tagline: "Para eventos grandes y bodas", price: "49€", was: "69€",
      features: ["Código QR único", "Invitados ilimitados", "Fotos ilimitadas", "Hasta 100 vídeos", "Acceso 1 año", "Descarga masiva (ZIP)", "Galería en directo (proyección)", "Página personalizada con nombres", "Avisos por email"], cta: "Elegir Plus", ribbon: "MÁS POPULAR" },
    premium: { label: "Premium", tagline: "Para los que lo quieren todo", price: "79€", was: "109€",
      features: ["Código QR único", "Invitados ilimitados", "Fotos ilimitadas", "Hasta 100 vídeos", "Acceso 1 año", "Descarga masiva (ZIP)", "Galería en directo (proyección)", "Página personalizada con nombres", "Dominio propio (fotos.tu-nombre.com)", "Plantillas premium", "Soporte prioritario"], cta: "Elegir Premium" },
    guarantee: "Garantía de devolución de 30 días — sin preguntas.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { q: "¿Tienen que descargar una app los invitados?", a: "No. Los invitados abren el álbum en el navegador del móvil — sin instalar, sin registrarse. Escanean el QR y suben fotos al instante." },
      { q: "¿Son privadas las fotos?", a: "Sí. El álbum solo es accesible con tu QR o enlace. Opcionalmente puedes protegerlo con contraseña." },
      { q: "¿En qué calidad se guardan las fotos?", a: "En resolución original completa, sin compresión ni pérdida de calidad." },
      { q: "¿Permitís vídeos?", a: "Los planes Pro y Premium admiten vídeos de hasta 500 MB por archivo." },
      { q: "¿Qué pasa después del evento?", a: "El álbum sigue activo durante la duración de tu plan. Puedes descargar todas las fotos y vídeos como ZIP en cualquier momento o guardarlos directamente en Google Drive." },
    ],
    ctaTitle: { line1: "Vive tu evento a través de los ojos", accent: "de todos tus invitados" },
    ctaSubtitle: "Todas las fotos y vídeos en calidad completa. Sin app, sin complicaciones.",
    ctaButton: "Crear galería ya", ctaTrust: "Sin tarjeta • Listo en menos de 2 minutos",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────
export function LocalizedHomePage({ lang }: { lang: Lang }) {
  const t = COPY[lang];

  const featuresIcons = [IconPhone, IconGlobe, IconLock, IconCamera, IconBolt, IconQR];

  return (
    <div className="min-h-screen bg-white text-[#0F1729] font-sans">

      {/* Announcement bar */}
      <div className="text-[#0F1729] text-center text-xs font-semibold py-2.5 px-4" style={{ background: "#FFC94D" }}>
        {t.announce}{" "}
        <Link href="/dashboard/new" className="underline font-bold ml-2">{t.announceLink}</Link>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#FFC94D]/30 bg-white/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center transition-transform duration-200 hover:scale-[1.03]">
            <GuestcamLogo size="sm" showMark={true} />
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageSwitcher current={lang} languages={HOME_HREFLANG} ariaLabel={t.switcherAria} />
            <Link href={`/${lang}/blog`} className="hidden sm:block text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors">
              Blog
            </Link>
            <HeaderAuthButtons lang={lang} />
            <Link href="/dashboard/new" className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-bold text-[#0F1729] transition-all duration-200 hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)", boxShadow: "0 6px 18px rgba(255,201,77,0.45)" }}>
              {t.navCta}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ background: "#F2F4F8" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 xl:py-24">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="flex -space-x-2.5">
                  {["#FFC94D", "#F0B429", "#E8A800", "#FFD966", "#C9820A"].map((bg, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-[2.5px] flex items-center justify-center text-[11px] font-bold text-[#0F1729] shrink-0" style={{ background: bg, borderColor: "#F2F4F8" }}>
                      {["T", "A", "S", "D", "M"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{t.trustText} <span className="font-bold text-[#0F1729]">{t.trust500}</span></p>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 mb-5">{t.heroEyebrow}</p>
              <h1 className="font-extrabold leading-[1.15] tracking-tight text-[#0F1729] mb-8" style={{ fontSize: "clamp(1.9rem, 3.6vw, 3.15rem)" }}>
                {t.heroHead.lead}{" "}<span style={{ color: "#C9820A" }}>{t.heroHead.accent}</span>{t.heroHead.trail}
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-[500px]">{t.heroLead}</p>

              {/* 3-step mini icons */}
              <div className="flex items-start gap-10 mb-12">
                {[
                  { label: t.threeStep.takePhoto, icon: <IconCamera /> },
                  { label: t.threeStep.scanQr, icon: <IconQR /> },
                  { label: t.threeStep.upload, icon: <IconBolt /> },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex flex-col items-center gap-2.5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,201,77,0.18)", color: "#C9820A" }}>{icon}</div>
                    <span className="text-xs font-semibold text-gray-500 text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/dashboard/new" className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-[#0F1729] font-bold text-lg transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)", boxShadow: "0 14px 40px rgba(255,201,77,0.42)" }}>
                  {t.heroPrimary}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-400">{t.heroNote}</p>
            </div>

            {/* Hero collage (reuses the same images as the homepage) */}
            <div className="hidden lg:block relative select-none" style={{ height: 600 }}>
              <div className="absolute rounded-3xl overflow-hidden shadow-2xl" style={{ top: 56, left: 0, width: 372, height: 466, transform: "rotate(-5deg)", zIndex: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero/scan.webp" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute rounded-2xl overflow-hidden shadow-xl" style={{ top: 0, right: 0, width: 244, height: 304, transform: "rotate(5deg)", zIndex: 30 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero/gallery.webp" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute rounded-2xl overflow-hidden shadow-2xl" style={{ bottom: 20, right: 24, width: 252, height: 252, transform: "rotate(4deg)", zIndex: 30 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero/cards.webp" alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-2xl mx-auto px-6 pb-20 pt-20">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">👫👫👫</span>
            <div>
              <p className="font-extrabold text-xl text-[#0F1729]">500+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">{t.statsCreated}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <div className="text-amber-400 text-base leading-none shrink-0">★★★★★</div>
            <div>
              <p className="font-extrabold text-xl" style={{ color: "#C9820A" }}>5.0/5</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">{t.statsRating}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-6 px-4 text-center">
            <span className="text-[1.4rem]">📸</span>
            <div>
              <p className="font-extrabold text-xl text-[#0F1729]">25.000+</p>
              <p className="text-xs text-gray-400 max-w-[90px] leading-snug">{t.statsPhotos}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Print templates */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-widest"
              style={{ background: "rgba(255,201,77,0.18)", color: "#C9820A" }}>
              {t.printEyebrow}
            </div>
            <h2 className="text-[2.5rem] font-extrabold text-[#0F1729] mb-4">{t.printTitle}</h2>
            <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">{t.printSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {t.printTemplates.map((tpl, idx) => {
              const v = TEMPLATE_VISUALS[idx] ?? TEMPLATE_VISUALS[0];
              return (
                <div key={tpl.name} className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
                  <div className="relative" style={{ height: 300 }}>
                    <img
                      src={`https://images.unsplash.com/${v.bg}?w=400&h=500&fit=crop&q=80`}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.18)" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`${v.dark ? "bg-[#0F1729] text-white" : "bg-white/97 text-[#0F1729]"} rounded-xl p-4 shadow-2xl text-center`}
                        style={{ width: 130, transform: `rotate(${v.rotate}deg)` }}
                      >
                        <p className={`font-serif text-[11px] font-bold mb-0.5 leading-tight ${v.dark ? "text-white" : "text-[#0F1729]"}`}>
                          {v.headline}
                        </p>
                        <p className={`text-[8px] mb-2.5 ${v.dark ? "text-white/60" : "text-gray-400"}`}>{v.sub}</p>
                        <div className="flex justify-center mb-2" style={{ transform: "scale(0.48)", transformOrigin: "center", height: 33, overflow: "hidden" }}>
                          <QRPattern />
                        </div>
                        <p className={`font-serif text-[8px] italic ${v.dark ? "text-[#f9a8c0]" : "text-[#C9820A]"}`}>Ana &amp; Marko</p>
                        {v.dark ? null : <div className="w-8 h-px bg-gray-200 mx-auto mt-1.5" />}
                        <p className={`text-[7px] mt-1 ${v.dark ? "text-white/40" : "text-gray-300"}`}>14. 06. 2025</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-[#FFC94D]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                      <p className="text-[#0F1729] font-bold text-sm">{tpl.name}</p>
                      <Link
                        href="/dashboard/new"
                        className="bg-white font-bold text-xs px-5 py-2.5 rounded-full transition-transform hover:scale-105"
                        style={{ color: "#0F1729" }}
                      >
                        {t.useTemplateCta} →
                      </Link>
                    </div>
                  </div>
                  <div className="px-3 py-2.5 bg-white flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#0F1729]">{tpl.name}</span>
                    <span className="text-[10px] text-[#C9820A] font-medium">PDF ↓</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-gray-400 mb-5">{t.printNote}</p>
            <Link href="/dashboard/new" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-200 border-2"
              style={{ borderColor: "#C9820A", color: "#C9820A" }}>
              {t.printCta}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#0B1220" }} className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: "#FFC94D" }}>{t.howEyebrow}</p>
          <h2 className="text-center font-extrabold text-white mb-5 leading-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            {t.howTitle.line1}<br />{t.howTitle.line2}
          </h2>
          <p className="text-center max-w-xl mx-auto leading-relaxed mb-16" style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.05rem" }}>{t.howSubtitle}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {t.howSteps.map((s) => (
              <div key={s.label} className="rounded-3xl p-7" style={{ background: "#070A12" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#FFC94D" }}>{s.label}</p>
                <h3 className="text-white font-extrabold text-2xl mb-3 leading-tight">{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }} className="text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/dashboard/new" className="inline-flex items-center gap-2.5 px-9 py-4 text-[#0F1729] font-bold rounded-full transition-all duration-200 hover:scale-105"
              style={{ background: "#FFC94D", boxShadow: "0 6px 24px rgba(255,201,77,0.45)" }}>
              {t.howCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Why you need it */}
      <section className="py-24" style={{ background: "#FFF9EC" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-4">{t.whyTitle}</h2>
          <p className="text-center text-gray-400 text-base mb-14 max-w-md mx-auto">{t.whySubtitle}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {t.whyCards.map((c) => (
              <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-md hover:border-[#FFC94D]/40 transition-all duration-200">
                <div className="w-12 h-12 border border-gray-100 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-sm" style={{ background: "#FFF3CC" }}>{c.icon}</div>
                <h3 className="font-bold text-[#0F1729] text-lg mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-4">{t.featuresTitle}</h2>
          <p className="text-center text-gray-500 mb-14 max-w-lg mx-auto leading-relaxed">
            {t.featuresLead1}<br /><span className="text-gray-400">{t.featuresLead2}</span>
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.map((f, i) => {
              const Icon = featuresIcons[i] ?? IconPhone;
              return (
                <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-7 text-left transition-all duration-200 hover:border-[#FFC94D]/40 hover:shadow-[0_12px_36px_rgba(15,23,41,0.08)]">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white transition-transform duration-200 group-hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #FFD966 0%, #F0B429 100%)", boxShadow: "0 10px 22px rgba(255,201,77,0.4)", color: "#0F1729" }}>
                    <Icon />
                  </div>
                  <h3 className="font-bold text-[#0F1729] text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ background: "#FFF9EC" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-14">{t.reviewsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {t.reviews.map((r) => (
              <div key={r.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: "rgba(255,201,77,0.25)" }}>💑</div>
                  <div>
                    <p className="font-semibold text-[#0F1729] text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-4">{t.pricingTitle}</h2>
          <p className="text-center text-gray-400 mb-14">{t.pricingSubtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {([
              { label: t.free.label,    tagline: t.free.tagline,    price: t.free.price,    was: undefined as string | undefined, features: t.free.features,    cta: t.free.cta,    ribbon: undefined as string | undefined, highlighted: false, dimmed: true },
              { label: t.basic.label,   tagline: t.basic.tagline,   price: t.basic.price,   was: t.basic.was,   features: t.basic.features,   cta: t.basic.cta,   ribbon: undefined as string | undefined, highlighted: false, dimmed: false },
              { label: t.plus.label,    tagline: t.plus.tagline,    price: t.plus.price,    was: t.plus.was,    features: t.plus.features,    cta: t.plus.cta,    ribbon: t.plus.ribbon as string | undefined,    highlighted: true,  dimmed: false },
              { label: t.premium.label, tagline: t.premium.tagline, price: t.premium.price, was: t.premium.was, features: t.premium.features, cta: t.premium.cta, ribbon: undefined as string | undefined, highlighted: false, dimmed: false },
            ]).map((p, planIdx) => {
              const planSlug = ["free", "basic", "plus", "premium"][planIdx];
              const href = planSlug === "free" ? "/dashboard/new" : `/dashboard/new?plan=${planSlug}`;
              return (
              <div key={p.label}
                className={`${p.dimmed ? "bg-gray-50 border border-gray-200 opacity-80" : p.highlighted ? "relative bg-white" : "bg-white border border-gray-200"} rounded-3xl p-7 flex flex-col`}
                style={p.highlighted ? { border: "2px solid #FFC94D", boxShadow: "0 8px 40px rgba(255,201,77,0.25)", transform: "translateY(-8px)" } : undefined}
              >
                {p.ribbon ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#0F1729] text-[10px] font-bold tracking-widest uppercase px-5 py-1.5 rounded-full" style={{ background: "#FFC94D" }}>
                    {p.ribbon}
                  </div>
                ) : null}
                <p className={`font-extrabold text-lg ${p.dimmed ? "text-gray-400" : "text-[#0F1729]"} mb-1`}>{p.label}</p>
                <p className="text-sm text-gray-400 mb-6">{p.tagline}</p>
                <div className="flex items-end gap-2 mb-7">
                  <span className={`font-extrabold text-[3rem] leading-none ${p.dimmed ? "text-gray-400" : p.highlighted ? "" : "text-[#0F1729]"}`} style={p.highlighted ? { color: "#C9820A" } : undefined}>{p.price}</span>
                  {p.was ? <span className="text-gray-300 line-through text-lg mb-1.5">{p.was}</span> : null}
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <svg className={`w-4 h-4 shrink-0 ${p.dimmed ? "text-gray-300" : "text-[#C9820A]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className={`text-sm ${p.dimmed ? "text-gray-400" : "text-gray-600"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`block text-center py-3.5 rounded-2xl font-bold text-sm transition-colors ${
                  p.highlighted ? "text-[#0F1729]" : p.dimmed ? "text-gray-400 bg-white hover:bg-gray-100" : "text-[#0F1729] hover:bg-gray-50"
                }`} style={p.highlighted ? { background: "#FFC94D" } : { border: "1.5px solid #e5e7eb" }}>
                  {p.cta}
                </Link>
              </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-400">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            {t.guarantee}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: "#FFF9EC" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-[2.5rem] font-extrabold text-center text-[#0F1729] mb-12">{t.faqTitle}</h2>
          <div className="space-y-3">
            {t.faqs.map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-100 rounded-2xl group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-[#0F1729] list-none text-[0.95rem]">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 pt-1 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 bg-white text-center px-6">
        <h2 className="font-extrabold text-[#0F1729] mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
          {t.ctaTitle.line1}{" "}<span style={{ color: "#C9820A" }}>{t.ctaTitle.accent}</span>.
        </h2>
        <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">{t.ctaSubtitle}</p>
        <Link href="/dashboard/new" className="inline-flex items-center gap-2.5 px-10 py-5 text-[#0F1729] font-bold text-lg rounded-full transition-all duration-200 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #FFD966 0%, #FFC94D 55%, #F0B429 100%)", boxShadow: "0 12px 32px rgba(255,201,77,0.45)" }}>
          {t.ctaButton}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </Link>
        <p className="mt-5 text-sm text-gray-400">{t.ctaTrust}</p>
      </section>

      <SeoFooter lang={lang} />
    </div>
  );
}
