import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { GuestcamLogo } from "@/components/GuestcamLogo";
import { LanguageSwitcher, HOME_HREFLANG } from "@/components/LanguageSwitcher";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";
import { HomeMobileMenu } from "@/components/HomeMobileMenu";
import { SeoFooter } from "@/components/SeoFooter";
import { WallMiniDemo } from "@/components/WallMiniDemo";
import { GuestcamShowcaseCarousel } from "@/components/GuestcamShowcaseCarousel";
import { localePublicPath } from "@/lib/urls";

type Lang = "en" | "de" | "hr" | "sr" | "es";
type Tuple2 = [string, string];
type Plan = {
  name: string;
  price: string;
  localPrice?: string;
  tag: string;
  cta: string;
  features: string[];
  popular?: string;
};

type LocaleCopy = {
  nav: [string, string, string, string, string, string, string];
  create: string;
  signIn: string;
  dashboard: string;
  language: string;
  openMenu: string;
  closeMenu: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroLead: string;
  start: string;
  demo: string;
  note: string;
  printTitle: string;
  printBody: string;
  printLink: string;
  weddingLabel: string;
  videoEyebrow: string;
  videoTitle: string;
  videoLead: string;
  videoSteps: Tuple2[];
  trust: string[];
  howEyebrow: string;
  howTitle: string;
  howLead: string;
  howSteps: Tuple2[];
  eventsEyebrow: string;
  eventsTitle: string;
  eventsLead: string;
  eventTitles: string[];
  eventDescriptions: string[];
  templatesEyebrow: string;
  templatesTitle: string;
  templatesLead: string;
  templatesCta: string;
  featuresEyebrow: string;
  featuresTitle: string;
  featuresLead: string;
  features: Tuple2[];
  wallEyebrow: string;
  wallTitle: string;
  wallLead: string;
  wallBullets: string[];
  pricingEyebrow: string;
  pricingTitle: string;
  pricingLead: string;
  currencyNote?: string;
  plans: Plan[];
  businessBadge: string;
  businessTitle: string;
  businessLead: string;
  businessBullets: string[];
  businessCta: string;
  faqEyebrow: string;
  faqTitle: string;
  faqs: Tuple2[];
  finalEyebrow: string;
  finalTitle: string;
  finalLead: string;
  finalCta: string;
};

const EVENT_IMAGES = [
  "/hero/wedding-avenue.webp",
  "/events/birthday-party.webp",
  "/events/babyshower.webp",
  "/events/gromparty.webp",
  "/events/party.webp",
  "/events/organizacija-dogodkov-dogodek.webp",
  "/events/krst.webp",
  "/events/matura.webp",
] as const;

const COMMON_FEATURE_IMAGES = ["No app", "Quality", "Privacy", "Media", "Live", "Languages", "ZIP", "Print"] as const;

const COPY: Record<Lang, LocaleCopy> = {
  en: {
    nav: ["How it works", "Events", "Templates", "Live Wall", "Pricing", "For business", "Blog"],
    create: "Create album", signIn: "Sign in", dashboard: "Dashboard", language: "Language", openMenu: "Open menu", closeMenu: "Close menu",
    heroEyebrow: "QR photo album for weddings & events",
    heroTitle: "Every guest photo.", heroAccent: "One shared album.",
    heroLead: "Guests scan a QR code and add photos and videos straight to your private Guestcam gallery. No app and no guest registration.",
    start: "Start free →", demo: "View demo", note: "No credit card · Ready in under 2 minutes",
    printTitle: "Don't want to print it yourself?", printBody: "We print your QR cards and table stands and ship them ready for the event, from €3.00 each.", printLink: "See printed QR stands →", weddingLabel: "Wedding · real guest moments",
    videoEyebrow: "How it works", videoTitle: "See Guestcam in action", videoLead: "In under half a minute a guest scans the QR code, uploads photos and every memory lands in your private gallery.",
    videoSteps: [["Print your QR cards", "Place them on tables or at the entrance."], ["Guests scan the QR", "No app and no sign-in."], ["The photos are yours", "Everything collected in one place in full quality."]],
    trust: ["No app", "Photos + videos", "Original quality", "Private gallery"],
    howEyebrow: "How it works", howTitle: "Three steps. That's it.", howLead: "Set up your gallery in minutes. Guests only need their phone.",
    howSteps: [["Create your event", "Get a private gallery, link and QR code instantly."], ["Place the QR code", "Put it on tables, invitations, menus, screens or printed cards."], ["Guests upload", "Photos and videos collect automatically in the album."]],
    eventsEyebrow: "For every special moment", eventsTitle: "One way to collect photos. For almost every event.", eventsLead: "Weddings, birthdays, baby showers, parties, graduations, family celebrations and business events.",
    eventTitles: ["Weddings", "Birthdays", "Baby showers", "Hen & stag parties", "Parties", "Business events", "Family celebrations", "Graduations"],
    eventDescriptions: ["All the spontaneous guest moments in one wedding album.", "Family and friend photos without chat-app chaos.", "Decor, reactions and photos from everyone invited.", "One QR code for the whole party and every phone.", "The best moments of the night collect themselves.", "Conferences, launches, fairs and activations.", "A private album for family and friends.", "A shared gallery for an evening worth keeping."],
    templatesEyebrow: "Print templates", templatesTitle: "Cards that actually make guests share their photos.", templatesLead: "Add your QR code, event name and date. Print them and place them where guests will notice.", templatesCta: "Create a gallery and QR code →",
    featuresEyebrow: "Why Guestcam", featuresTitle: "Everything you need. Nothing your guests don't.", featuresLead: "The most important thing is simplicity: see QR, scan, upload.",
    features: [["No app", "Guests upload directly from their mobile browser."], ["Original quality", "Photos stay in high quality for viewing and printing."], ["Private gallery", "Share by private link or QR code and optionally add a password."], ["Photos + videos", "Collect both formats from every phone in one place."], ["Live Photo Wall", "Show new uploads on a TV or projector within seconds."], ["Multiple languages", "A clear experience for local and international guests."], ["ZIP download", "Download the whole event in one go."], ["QR templates + print", "Choose a design or order ready-made printed table cards."]],
    wallEyebrow: "Live Photo Wall", wallTitle: "Guest photos instantly on the big screen.", wallLead: "Open Guestcam on a TV or projector. New uploads appear within seconds.", wallBullets: ["secure display-only link", "QR code on the big screen", "new photos move to the front", "great for weddings and business events"],
    pricingEyebrow: "One-time payment · no subscription", pricingTitle: "Simple packages for every event.", pricingLead: "Start free. Pay only when you need more space and features.",
    plans: [
      { name: "Free", price: "0 €", tag: "Try it without risk", cta: "Start free", features: ["Unique QR code", "Full-quality photo upload", "Up to 20 photos", "1 video", "30-day access", "No backup"] },
      { name: "Basic", price: "39 €", tag: "For smaller events", cta: "Choose Basic", features: ["Unique QR code", "Full-quality photo upload", "Up to 1,000 photos", "Up to 10 videos", "Gallery access for 3 months", "Download all photos (ZIP)"] },
      { name: "Plus", price: "49 €", tag: "For weddings and larger events", cta: "Choose Plus", popular: "Most popular", features: ["Unique QR code", "Full-quality photo upload", "Unlimited guests", "Up to 5,000 photos", "Up to 100 videos", "Gallery access for 1 year", "Download all photos (ZIP)", "Live gallery / projection", "Personalized page with names", "Email notifications for the couple"] },
      { name: "Premium", price: "99 €", tag: "For those who want everything", cta: "Choose Premium", features: ["Unique QR code", "Full-quality photo upload", "Unlimited guests", "Unlimited photos", "Up to 100 videos", "Gallery access for 2 years", "Download all photos (ZIP)", "Live gallery / projection", "Personalized page with names", "Photo Wall for TV / projector", "Custom domain", "Premium design templates", "Priority support"] },
    ],
    businessBadge: "Guestcam for business", businessTitle: "Let attendees create content for your event.", businessLead: "For conferences, promotions, fairs, sports events and agencies. Attendees upload via QR and content can appear live.", businessBullets: ["your own branding", "Live Photo Wall", "lead collection with consent", "sponsor placements", "QR upload without an app", "download all content"], businessCta: "Business offer →",
    faqEyebrow: "Frequently asked questions", faqTitle: "Everything you want to know before your event.", faqs: [["Do guests need to install an app?", "No. They scan the QR code and upload directly from their browser."], ["Are the photos private?", "Yes. The gallery is shared through a private link or QR code and can be password protected."], ["Are photos stored in full quality?", "Guestcam keeps high-quality files suitable for viewing and later printing."], ["What happens after the event?", "The gallery remains available for the period included in your package and you can download everything as a ZIP archive."]],
    finalEyebrow: "Every camera. One story.", finalTitle: "Experience your event through the eyes of every guest.", finalLead: "Every photo and video in one place. No app, no chasing people and no lost memories.", finalCta: "Create your free gallery →",
  },
  de: {
    nav: ["So funktioniert's", "Events", "Vorlagen", "Live Wall", "Preise", "Für Unternehmen", "Blog"],
    create: "Album erstellen", signIn: "Anmelden", dashboard: "Dashboard", language: "Sprache", openMenu: "Menü öffnen", closeMenu: "Menü schließen",
    heroEyebrow: "QR-Fotoalbum für Hochzeiten & Events", heroTitle: "Alle Gästefotos.", heroAccent: "Ein gemeinsames Album.", heroLead: "Gäste scannen den QR-Code und laden Fotos und Videos direkt in Ihre private Guestcam-Galerie. Ohne App und ohne Registrierung.", start: "Kostenlos starten →", demo: "Demo ansehen", note: "Keine Kreditkarte · in weniger als 2 Minuten bereit", printTitle: "Sie möchten nicht selbst drucken?", printBody: "Wir drucken QR-Karten und Tischaufsteller und liefern sie veranstaltungsfertig, ab 3,00 € pro Stück.", printLink: "Gedruckte QR-Aufsteller ansehen →", weddingLabel: "Hochzeit · echte Gästemomente",
    videoEyebrow: "So funktioniert's", videoTitle: "Guestcam in Aktion", videoLead: "In weniger als einer halben Minute scannt ein Gast den QR-Code, lädt Fotos hoch und alle Erinnerungen landen in Ihrer privaten Galerie.", videoSteps: [["QR-Karten drucken", "Auf Tischen oder am Eingang platzieren."], ["Gäste scannen den QR-Code", "Ohne App und Anmeldung."], ["Die Fotos sind bei Ihnen", "Alles an einem Ort in voller Qualität gesammelt."]],
    trust: ["Keine App", "Fotos + Videos", "Originalqualität", "Private Galerie"],
    howEyebrow: "So funktioniert's", howTitle: "Drei Schritte. Das ist alles.", howLead: "Galerie in wenigen Minuten vorbereiten. Ihre Gäste brauchen nur ihr Handy.", howSteps: [["Event erstellen", "Sofort private Galerie, Link und QR-Code erhalten."], ["QR-Code platzieren", "Auf Tischen, Einladungen, Menüs, Displays oder Karten."], ["Gäste laden hoch", "Fotos und Videos sammeln sich automatisch im Album."]],
    eventsEyebrow: "Für jeden besonderen Moment", eventsTitle: "Eine Art, Fotos zu sammeln. Für fast jedes Event.", eventsLead: "Hochzeiten, Geburtstage, Babyshowers, Partys, Abschlussfeiern, Familienfeste und Firmenevents.", eventTitles: ["Hochzeiten", "Geburtstage", "Babyshower", "Junggesellenabschiede", "Partys", "Firmenevents", "Familienfeiern", "Abschlussfeiern"], eventDescriptions: ["Alle spontanen Gästemomente in einem Hochzeitsalbum.", "Fotos von Familie und Freunden ohne Chat-Chaos.", "Dekoration, Reaktionen und Fotos aller Gäste.", "Ein QR-Code für die ganze Feier und alle Handys.", "Die besten Momente des Abends sammeln sich automatisch.", "Konferenzen, Promotionen, Messen und Aktivierungen.", "Ein privates Album für Familie und Freunde.", "Eine gemeinsame Galerie für einen besonderen Abend."],
    templatesEyebrow: "Druckvorlagen", templatesTitle: "Karten, die Gäste wirklich zum Teilen motivieren.", templatesLead: "QR-Code, Eventname und Datum hinzufügen, ausdrucken und gut sichtbar aufstellen.", templatesCta: "Galerie und QR-Code erstellen →",
    featuresEyebrow: "Warum Guestcam", featuresTitle: "Alles, was Sie brauchen. Nichts, was Gäste nicht brauchen.", featuresLead: "Der wichtigste Teil ist die Einfachheit: QR sehen, scannen, hochladen.", features: [["Keine App", "Upload direkt aus dem mobilen Browser."], ["Originalqualität", "Fotos bleiben in hoher Qualität."], ["Private Galerie", "Private URL, QR-Code und optionaler Passwortschutz."], ["Fotos + Videos", "Beides aus allen Handys an einem Ort sammeln."], ["Live Photo Wall", "Neue Uploads in Sekunden auf TV oder Projektor."], ["Mehrere Sprachen", "Klare Nutzung für lokale und internationale Gäste."], ["ZIP-Download", "Das gesamte Event gesammelt herunterladen."], ["QR-Vorlagen + Druck", "Vorlage wählen oder fertige Tischkarten bestellen."]],
    wallEyebrow: "Live Photo Wall", wallTitle: "Gästefotos sofort auf der großen Leinwand.", wallLead: "Guestcam auf TV oder Projektor öffnen. Neue Uploads erscheinen in wenigen Sekunden.", wallBullets: ["separater sicherer Display-Link", "QR-Code auf dem großen Bildschirm", "neue Fotos kommen nach vorne", "ideal für Hochzeiten und Firmenevents"],
    pricingEyebrow: "Einmalzahlung · kein Abo", pricingTitle: "Einfache Pakete für jedes Event.", pricingLead: "Kostenlos starten. Erst zahlen, wenn Sie mehr Speicher und Funktionen benötigen.", plans: [
      { name: "Free", price: "0 €", tag: "Ohne Risiko testen", cta: "Kostenlos starten", features: ["Einzigartiger QR-Code", "Foto-Upload in voller Qualität", "Bis zu 20 Fotos", "1 Video", "30 Tage Zugriff", "Keine Sicherungskopie"] },
      { name: "Basic", price: "39 €", tag: "Für kleinere Events", cta: "Basic wählen", features: ["Einzigartiger QR-Code", "Foto-Upload in voller Qualität", "Bis zu 1.000 Fotos", "Bis zu 10 Videos", "Galeriezugriff 3 Monate", "Alle Fotos als ZIP herunterladen"] },
      { name: "Plus", price: "49 €", tag: "Für Hochzeiten und größere Events", cta: "Plus wählen", popular: "Am beliebtesten", features: ["Einzigartiger QR-Code", "Foto-Upload in voller Qualität", "Unbegrenzt Gäste", "Bis zu 5.000 Fotos", "Bis zu 100 Videos", "Galeriezugriff 1 Jahr", "Alle Fotos als ZIP", "Live-Galerie / Projektion", "Personalisierte Seite mit Namen", "E-Mail-Benachrichtigungen für das Paar"] },
      { name: "Premium", price: "99 €", tag: "Für alle, die alles möchten", cta: "Premium wählen", features: ["Einzigartiger QR-Code", "Foto-Upload in voller Qualität", "Unbegrenzt Gäste", "Unbegrenzt Fotos", "Bis zu 100 Videos", "Galeriezugriff 2 Jahre", "Alle Fotos als ZIP", "Live-Galerie / Projektion", "Personalisierte Seite mit Namen", "Photo Wall für TV / Projektor", "Eigene Domain", "Premium-Designvorlagen", "Prioritäts-Support"] },
    ],
    businessBadge: "Guestcam für Unternehmen", businessTitle: "Lassen Sie Teilnehmer Inhalte für Ihr Event erstellen.", businessLead: "Für Konferenzen, Promotionen, Messen, Sportevents und Agenturen. Upload per QR und Inhalte optional live auf dem Bildschirm.", businessBullets: ["eigenes Branding", "Live Photo Wall", "Lead-Erfassung mit Einwilligung", "Sponsor-Einblendungen", "QR-Upload ohne App", "alle Inhalte herunterladen"], businessCta: "Firmenangebot →",
    faqEyebrow: "Häufige Fragen", faqTitle: "Alles, was Sie vor Ihrem Event wissen möchten.", faqs: [["Müssen Gäste eine App installieren?", "Nein. QR-Code scannen und direkt im Browser hochladen."], ["Sind die Fotos privat?", "Ja. Zugriff über private URL oder QR-Code, optional mit Passwort."], ["Bleibt die Qualität erhalten?", "Guestcam speichert hochwertige Dateien für Anzeige und späteren Druck."], ["Was passiert nach dem Event?", "Die Galerie bleibt entsprechend Ihrem Paket aktiv und alles kann als ZIP heruntergeladen werden."]],
    finalEyebrow: "Jede Kamera. Eine Geschichte.", finalTitle: "Erleben Sie Ihr Event durch die Augen aller Gäste.", finalLead: "Alle Fotos und Videos an einem Ort. Ohne App, ohne Nachfragen, ohne verlorene Erinnerungen.", finalCta: "Kostenlose Galerie erstellen →",
  },
  hr: {
    nav: ["Kako radi", "Događaji", "Predlošci", "Foto zid uživo", "Cijene", "Za tvrtke", "Blog"],
    create: "Kreiraj album", signIn: "Prijava", dashboard: "Kontrolna ploča", language: "Jezik", openMenu: "Otvori izbornik", closeMenu: "Zatvori izbornik",
    heroEyebrow: "QR foto album za vjenčanja i događaje", heroTitle: "Sve fotografije gostiju.", heroAccent: "Jedan zajednički album.", heroLead: "Gosti skeniraju QR kod i dodaju fotografije i videozapise izravno u vašu privatnu Guestcam galeriju. Bez aplikacije i registracije.", start: "Započni besplatno →", demo: "Pogledaj demo", note: "Bez kreditne kartice · spremno za manje od 2 minute", printTitle: "Ne želite sami tiskati?", printBody: "Tiskamo QR kartice i stolne stalke te ih šaljemo spremne za događaj, već od 3,00 € po komadu.", printLink: "Pogledaj tiskane QR stalke →", weddingLabel: "Vjenčanje · pravi trenuci gostiju",
    videoEyebrow: "Kako radi", videoTitle: "Pogledajte Guestcam u akciji", videoLead: "Za manje od pola minute gost skenira QR kod, učita fotografije i sve uspomene završe u vašoj privatnoj galeriji.", videoSteps: [["Ispišite QR kartice", "Postavite ih na stolove ili ulaz."], ["Gosti skeniraju QR", "Bez aplikacije i prijave."], ["Fotografije su kod vas", "Sve na jednom mjestu u punoj kvaliteti."]],
    trust: ["Bez aplikacije", "Fotografije + video", "Puna kvaliteta", "Privatna galerija"],
    howEyebrow: "Kako radi", howTitle: "Tri koraka. To je sve.", howLead: "Galeriju pripremite za nekoliko minuta. Gostima treba samo telefon.", howSteps: [["Kreirajte događaj", "Odmah dobijete privatnu galeriju, poveznicu i QR kod."], ["Postavite QR kod", "Na stolove, pozivnice, menije, zaslone ili kartice."], ["Gosti učitavaju", "Fotografije i videozapisi automatski se skupljaju u albumu."]],
    eventsEyebrow: "Za svaki poseban trenutak", eventsTitle: "Jedan način skupljanja fotografija. Za gotovo svaki događaj.", eventsLead: "Vjenčanja, rođendani, baby showeri, zabave, mature, obiteljske proslave i poslovni događaji.", eventTitles: ["Vjenčanja", "Rođendani", "Baby shower", "Djevojačke i momačke", "Zabave", "Poslovni događaji", "Obiteljske proslave", "Mature i diplome"], eventDescriptions: ["Svi spontani trenuci gostiju u jednom albumu.", "Fotografije obitelji i prijatelja bez kaosa u chatovima.", "Dekoracija, reakcije i fotografije svih gostiju.", "Jedan QR kod za cijelu zabavu i sve telefone.", "Najbolji trenuci večeri skupljaju se sami.", "Konferencije, promocije, sajmovi i aktivacije.", "Privatni album za obitelj i prijatelje.", "Zajednička galerija za večer koju želite sačuvati."],
    templatesEyebrow: "Predlošci za tisak", templatesTitle: "Kartice koje stvarno potiču goste na dijeljenje.", templatesLead: "Dodajte QR kod, naziv događaja i datum. Ispišite i postavite gdje će ih gosti primijetiti.", templatesCta: "Kreiraj galeriju i QR kod →",
    featuresEyebrow: "Zašto Guestcam", featuresTitle: "Sve što vam treba. Ništa što gostima ne treba.", featuresLead: "Najvažnija je jednostavnost: vidi QR, skeniraj, učitaj.", features: [["Bez aplikacije", "Gosti učitavaju izravno iz mobilnog preglednika."], ["Puna kvaliteta", "Fotografije ostaju u visokoj kvaliteti."], ["Privatna galerija", "Privatna poveznica, QR kod i opcionalna lozinka."], ["Fotografije + video", "Sve s različitih telefona na jednom mjestu."], ["Foto zid uživo", "Nove fotografije na TV-u ili projektoru u nekoliko sekundi."], ["Više jezika", "Jasno iskustvo za domaće i strane goste."], ["ZIP preuzimanje", "Preuzmite cijeli događaj odjednom."], ["QR predlošci + tisak", "Odaberite dizajn ili naručite gotove stolne kartice."]],
    wallEyebrow: "Foto zid uživo", wallTitle: "Fotografije gostiju odmah na velikom zaslonu.", wallLead: "Otvorite Guestcam na TV-u ili projektoru. Nove fotografije pojavljuju se za nekoliko sekundi.", wallBullets: ["sigurna poveznica samo za prikaz", "QR kod na velikom zaslonu", "nove fotografije dolaze u prvi plan", "idealno za vjenčanja i poslovne događaje"],
    pricingEyebrow: "Jednokratno plaćanje · bez pretplate", pricingTitle: "Jednostavni paketi za svaki događaj.", pricingLead: "Započnite besplatno. Platite tek kada trebate više prostora i funkcija.", plans: [
      { name: "Free", price: "0 €", tag: "Isprobajte bez rizika", cta: "Započni besplatno", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punoj kvaliteti", "Do 20 fotografija", "1 videozapis", "Pristup 30 dana", "Bez sigurnosne kopije"] },
      { name: "Basic", price: "39 €", tag: "Za manje događaje", cta: "Odaberi Basic", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punoj kvaliteti", "Do 1.000 fotografija", "Do 10 videozapisa", "Pristup galeriji 3 mjeseca", "Preuzimanje svih fotografija (ZIP)"] },
      { name: "Plus", price: "49 €", tag: "Za vjenčanja i veće događaje", cta: "Odaberi Plus", popular: "Najpopularnije", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punoj kvaliteti", "Neograničen broj gostiju", "Do 5.000 fotografija", "Do 100 videozapisa", "Pristup galeriji 1 godinu", "Preuzimanje svih fotografija (ZIP)", "Live galerija / projekcija", "Personalizirana stranica s imenima", "E-mail obavijesti za par"] },
      { name: "Premium", price: "99 €", tag: "Za one koji žele sve", cta: "Odaberi Premium", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punoj kvaliteti", "Neograničen broj gostiju", "Neograničeno fotografija", "Do 100 videozapisa", "Pristup galeriji 2 godine", "Preuzimanje svih fotografija (ZIP)", "Live galerija / projekcija", "Personalizirana stranica s imenima", "Foto zid za TV / projektor", "Vlastita domena", "Premium dizajn predlošci", "Prioritetna podrška"] },
    ],
    businessBadge: "Guestcam za tvrtke", businessTitle: "Neka sudionici stvaraju sadržaj za vaš događaj.", businessLead: "Za konferencije, promocije, sajmove, sportske događaje i agencije. Učitavanje putem QR koda, a sadržaj se može prikazati uživo.", businessBullets: ["vlastiti vizualni identitet", "foto zid uživo", "prikupljanje kontakata uz privolu", "sponzorski prikazi", "učitavanje putem QR koda bez aplikacije", "preuzimanje svega"], businessCta: "Ponuda za tvrtke →",
    faqEyebrow: "Česta pitanja", faqTitle: "Sve što želite znati prije događaja.", faqs: [["Moraju li gosti instalirati aplikaciju?", "Ne. Skeniraju QR kod i učitavaju izravno iz preglednika."], ["Jesu li fotografije privatne?", "Da. Galerija se dijeli privatnom poveznicom ili QR kodom i može imati lozinku."], ["Ostaje li puna kvaliteta?", "Guestcam čuva visokokvalitetne datoteke za pregled i kasniji tisak."], ["Što se događa nakon događaja?", "Galerija ostaje aktivna prema paketu, a sve možete preuzeti kao ZIP."]],
    finalEyebrow: "Svaka kamera. Jedna priča.", finalTitle: "Doživite svoj događaj očima svih gostiju.", finalLead: "Sve fotografije i videozapisi na jednom mjestu. Bez aplikacije i izgubljenih uspomena.", finalCta: "Kreiraj besplatnu galeriju →",
  },
  sr: {
    nav: ["Kako radi", "Događaji", "Predlošci", "Foto zid uživo", "Cenovnik", "Za firme", "Blog"],
    create: "Napravi album", signIn: "Prijava", dashboard: "Kontrolna tabla", language: "Jezik", openMenu: "Otvori meni", closeMenu: "Zatvori meni",
    heroEyebrow: "QR foto album za venčanja i događaje", heroTitle: "Sve fotografije gostiju.", heroAccent: "Jedan zajednički album.", heroLead: "Gosti skeniraju QR kod i dodaju fotografije i video snimke direktno u vašu privatnu Guestcam galeriju. Bez aplikacije i registracije.", start: "Počni besplatno →", demo: "Pogledaj demo", note: "Bez kreditne kartice · spremno za manje od 2 minuta", printTitle: "Ne želite sami da štampate?", printBody: "Štampamo QR kartice i stone stalke i šaljemo ih spremne za događaj, već od 3,00 € po komadu.", printLink: "Pogledaj štampane QR stalke →", weddingLabel: "Venčanje · pravi trenuci gostiju",
    videoEyebrow: "Kako radi", videoTitle: "Pogledajte Guestcam u akciji", videoLead: "Za manje od pola minuta gost skenira QR kod, učita fotografije i sve uspomene završe u vašoj privatnoj galeriji.", videoSteps: [["Odštampajte QR kartice", "Postavite ih na stolove ili ulaz."], ["Gosti skeniraju QR", "Bez aplikacije i prijave."], ["Fotografije su kod vas", "Sve na jednom mestu u punom kvalitetu."]],
    trust: ["Bez aplikacije", "Fotografije + video", "Pun kvalitet", "Privatna galerija"],
    howEyebrow: "Kako radi", howTitle: "Tri koraka. To je sve.", howLead: "Galeriju pripremite za nekoliko minuta. Gostima treba samo telefon.", howSteps: [["Napravite događaj", "Odmah dobijate privatnu galeriju, link i QR kod."], ["Postavite QR kod", "Na stolove, pozivnice, menije, ekrane ili kartice."], ["Gosti učitavaju", "Fotografije i video snimci automatski se skupljaju u albumu."]],
    eventsEyebrow: "Za svaki poseban trenutak", eventsTitle: "Jedan način za prikupljanje slika. Za skoro svaki događaj.", eventsLead: "Venčanja, rođendani, baby shower, žurke, mature, porodične proslave i poslovni događaji.", eventTitles: ["Venčanja", "Rođendani", "Baby shower", "Devojačke i momačke", "Žurke", "Poslovni događaji", "Porodične proslave", "Mature i diplome"], eventDescriptions: ["Svi spontani trenuci gostiju u jednom albumu.", "Fotografije porodice i prijatelja bez haosa u četovima.", "Dekoracija, reakcije i fotografije svih gostiju.", "Jedan QR kod za celu žurku i sve telefone.", "Najbolji trenuci večeri skupljaju se sami.", "Konferencije, promocije, sajmovi i aktivacije.", "Privatni album za porodicu i prijatelje.", "Zajednička galerija za veče koje želite da sačuvate."],
    templatesEyebrow: "Predlošci za štampu", templatesTitle: "Kartice koje zaista podstiču goste da dele fotografije.", templatesLead: "Dodajte QR kod, naziv događaja i datum. Odštampajte i postavite gde će ih gosti videti.", templatesCta: "Napravi galeriju i QR kod →",
    featuresEyebrow: "Zašto Guestcam", featuresTitle: "Sve što vam treba. Ništa što gostima ne treba.", featuresLead: "Najvažnija je jednostavnost: vidi QR, skeniraj, učitaj.", features: [["Bez aplikacije", "Gosti učitavaju direktno iz mobilnog pregledača."], ["Pun kvalitet", "Fotografije ostaju u visokom kvalitetu."], ["Privatna galerija", "Privatan link, QR kod i opciona lozinka."], ["Fotografije + video", "Sve sa različitih telefona na jednom mestu."], ["Foto zid uživo", "Nove fotografije na TV-u ili projektoru za nekoliko sekundi."], ["Više jezika", "Jasno iskustvo za domaće i strane goste."], ["ZIP preuzimanje", "Preuzmite ceo događaj odjednom."], ["QR predlošci + štampa", "Izaberite dizajn ili naručite gotove stone kartice."]],
    wallEyebrow: "Foto zid uživo", wallTitle: "Fotografije gostiju odmah na velikom ekranu.", wallLead: "Otvorite Guestcam na TV-u ili projektoru. Nove fotografije se pojavljuju za nekoliko sekundi.", wallBullets: ["siguran link samo za prikaz", "QR kod na velikom ekranu", "nove fotografije dolaze u prvi plan", "idealno za venčanja i poslovne događaje"],
    pricingEyebrow: "Jednokratno plaćanje · bez pretplate", pricingTitle: "Jednostavni paketi za svaki događaj.", pricingLead: "Počnite besplatno. Platite tek kada vam treba više prostora i funkcija.", plans: [
      { name: "Free", price: "0 €", tag: "Probajte bez rizika", cta: "Počni besplatno", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punom kvalitetu", "Do 20 fotografija", "1 video", "Pristup 30 dana", "Bez rezervne kopije"] },
      { name: "Basic", price: "39 €", localPrice: "≈ 4.580 RSD", tag: "Za manje događaje", cta: "Izaberi Basic", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punom kvalitetu", "Do 1.000 fotografija", "Do 10 video snimaka", "Pristup galeriji 3 meseca", "Preuzimanje svih fotografija (ZIP)"] },
      { name: "Plus", price: "49 €", localPrice: "≈ 5.750 RSD", tag: "Za venčanja i veće događaje", cta: "Izaberi Plus", popular: "Najpopularnije", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punom kvalitetu", "Neograničen broj gostiju", "Do 5.000 fotografija", "Do 100 video snimaka", "Pristup galeriji 1 godinu", "Preuzimanje svih fotografija (ZIP)", "Live galerija / projekcija", "Personalizovana stranica sa imenima", "E-mail obaveštenja za par"] },
      { name: "Premium", price: "99 €", localPrice: "≈ 11.620 RSD", tag: "Za one koji žele sve", cta: "Izaberi Premium", features: ["Jedinstveni QR kod", "Učitavanje fotografija u punom kvalitetu", "Neograničen broj gostiju", "Neograničeno fotografija", "Do 100 video snimaka", "Pristup galeriji 2 godine", "Preuzimanje svih fotografija (ZIP)", "Live galerija / projekcija", "Personalizovana stranica sa imenima", "Foto zid za TV / projektor", "Sopstveni domen", "Premium dizajn predlošci", "Prioritetna podrška"] },
    ],
    currencyNote: "Plaćanje se obračunava u EUR preko Mollie. Iznosi u RSD su informativni i zavise od kursa vaše banke.",
    businessBadge: "Guestcam za firme", businessTitle: "Neka učesnici stvaraju sadržaj za vaš događaj.", businessLead: "Za konferencije, promocije, sajmove, sportske događaje i agencije. Učitavanje putem QR koda, a sadržaj može odmah da se prikaže na ekranu.", businessBullets: ["sopstveni vizuelni identitet", "foto zid uživo", "prikupljanje kontakata uz saglasnost", "sponzorski prikazi", "učitavanje putem QR koda bez aplikacije", "preuzimanje svega"], businessCta: "Ponuda za firme →",
    faqEyebrow: "Česta pitanja", faqTitle: "Sve što želite da znate pre događaja.", faqs: [["Da li gosti moraju da instaliraju aplikaciju?", "Ne. Skeniraju QR kod i učitavaju direktno iz pregledača."], ["Da li su fotografije privatne?", "Da. Galerija se deli privatnim linkom ili QR kodom i može biti zaštićena lozinkom."], ["Da li ostaje pun kvalitet?", "Guestcam čuva visokokvalitetne fajlove za pregled i kasniju štampu."], ["Šta se dešava posle događaja?", "Galerija ostaje aktivna prema paketu, a sve možete preuzeti kao ZIP."]],
    finalEyebrow: "Svaka kamera. Jedna priča.", finalTitle: "Doživite svoj događaj očima svih gostiju.", finalLead: "Sve fotografije i video snimci na jednom mestu. Bez aplikacije i izgubljenih uspomena.", finalCta: "Napravi besplatnu galeriju →",
  },
  es: {
    nav: ["Cómo funciona", "Eventos", "Plantillas", "Muro en vivo", "Precios", "Empresas", "Blog"],
    create: "Crear álbum", signIn: "Entrar", dashboard: "Panel", language: "Idioma", openMenu: "Abrir menú", closeMenu: "Cerrar menú",
    heroEyebrow: "Álbum QR de fotos para bodas y eventos", heroTitle: "Todas las fotos de tus invitados.", heroAccent: "Un solo álbum compartido.", heroLead: "Los invitados escanean un código QR y añaden fotos y vídeos directamente a tu galería privada de Guestcam. Sin app y sin registro.", start: "Empieza gratis →", demo: "Ver demo", note: "Sin tarjeta · listo en menos de 2 minutos", printTitle: "¿No quieres imprimirlo tú?", printBody: "Imprimimos tus tarjetas QR y soportes de mesa y los enviamos listos para el evento, desde 3,00 € por unidad.", printLink: "Ver soportes QR impresos →", weddingLabel: "Boda · momentos reales de invitados",
    videoEyebrow: "Cómo funciona", videoTitle: "Mira Guestcam en acción", videoLead: "En menos de medio minuto un invitado escanea el QR, sube fotos y todos los recuerdos llegan a tu galería privada.", videoSteps: [["Imprime las tarjetas QR", "Colócalas en las mesas o en la entrada."], ["Los invitados escanean", "Sin app y sin iniciar sesión."], ["Las fotos son tuyas", "Todo reunido en un solo lugar y en alta calidad."]],
    trust: ["Sin app", "Fotos + vídeos", "Calidad original", "Galería privada"],
    howEyebrow: "Cómo funciona", howTitle: "Tres pasos. Eso es todo.", howLead: "Prepara la galería en minutos. Tus invitados solo necesitan el móvil.", howSteps: [["Crea tu evento", "Recibe al instante galería privada, enlace y código QR."], ["Coloca el QR", "En mesas, invitaciones, menús, pantallas o tarjetas."], ["Los invitados suben", "Fotos y vídeos se reúnen automáticamente en el álbum."]],
    eventsEyebrow: "Para cada momento especial", eventsTitle: "Una forma de reunir fotos. Para casi cualquier evento.", eventsLead: "Bodas, cumpleaños, baby showers, fiestas, graduaciones, celebraciones familiares y eventos de empresa.", eventTitles: ["Bodas", "Cumpleaños", "Baby shower", "Despedidas", "Fiestas", "Eventos de empresa", "Celebraciones familiares", "Graduaciones"], eventDescriptions: ["Todos los momentos espontáneos en un solo álbum.", "Fotos de familia y amigos sin caos de chats.", "Decoración, reacciones y fotos de todos los invitados.", "Un QR para toda la fiesta y todos los móviles.", "Los mejores momentos de la noche se reúnen solos.", "Conferencias, promociones, ferias y activaciones.", "Un álbum privado para familia y amigos.", "Una galería compartida para una noche que merece guardarse."],
    templatesEyebrow: "Plantillas para imprimir", templatesTitle: "Tarjetas que de verdad animan a compartir fotos.", templatesLead: "Añade tu QR, nombre del evento y fecha. Imprime y colócalas donde los invitados las vean.", templatesCta: "Crear galería y código QR →",
    featuresEyebrow: "Por qué Guestcam", featuresTitle: "Todo lo que necesitas. Nada que complique a tus invitados.", featuresLead: "Lo más importante es la sencillez: ver QR, escanear y subir.", features: [["Sin app", "Los invitados suben desde el navegador del móvil."], ["Calidad original", "Las fotos se mantienen en alta calidad."], ["Galería privada", "Enlace privado, QR y contraseña opcional."], ["Fotos + vídeos", "Todo desde distintos móviles en un solo lugar."], ["Live Photo Wall", "Nuevas fotos en TV o proyector en segundos."], ["Varios idiomas", "Experiencia clara para invitados locales e internacionales."], ["Descarga ZIP", "Descarga todo el evento de una vez."], ["Plantillas QR + impresión", "Elige diseño o pide tarjetas de mesa listas."]],
    wallEyebrow: "Live Photo Wall", wallTitle: "Las fotos de los invitados, al instante en la pantalla grande.", wallLead: "Abre Guestcam en un TV o proyector. Las nuevas fotos aparecen en segundos.", wallBullets: ["enlace seguro solo para pantalla", "QR en la pantalla grande", "las fotos nuevas pasan al frente", "ideal para bodas y eventos de empresa"],
    pricingEyebrow: "Pago único · sin suscripción", pricingTitle: "Paquetes sencillos para cada evento.", pricingLead: "Empieza gratis. Paga solo cuando necesites más espacio y funciones.", plans: [
      { name: "Free", price: "0 €", tag: "Pruébalo sin riesgo", cta: "Empezar gratis", features: ["Código QR único", "Subida de fotos en máxima calidad", "Hasta 20 fotos", "1 vídeo", "Acceso 30 días", "Sin copia de seguridad"] },
      { name: "Basic", price: "39 €", tag: "Para eventos pequeños", cta: "Elegir Basic", features: ["Código QR único", "Subida de fotos en máxima calidad", "Hasta 1.000 fotos", "Hasta 10 vídeos", "Acceso a la galería 3 meses", "Descargar todas las fotos (ZIP)"] },
      { name: "Plus", price: "49 €", tag: "Para bodas y eventos grandes", cta: "Elegir Plus", popular: "Más popular", features: ["Código QR único", "Subida de fotos en máxima calidad", "Invitados ilimitados", "Hasta 5.000 fotos", "Hasta 100 vídeos", "Acceso a la galería 1 año", "Descargar todas las fotos (ZIP)", "Galería en vivo / proyección", "Página personalizada con nombres", "Avisos por e-mail para la pareja"] },
      { name: "Premium", price: "99 €", tag: "Para quienes lo quieren todo", cta: "Elegir Premium", features: ["Código QR único", "Subida de fotos en máxima calidad", "Invitados ilimitados", "Fotos ilimitadas", "Hasta 100 vídeos", "Acceso a la galería 2 años", "Descargar todas las fotos (ZIP)", "Galería en vivo / proyección", "Página personalizada con nombres", "Photo Wall para TV / proyector", "Dominio propio", "Plantillas premium", "Soporte prioritario"] },
    ],
    businessBadge: "Guestcam para empresas", businessTitle: "Haz que los asistentes creen contenido para tu evento.", businessLead: "Para conferencias, promociones, ferias, eventos deportivos y agencias. Subida por QR y contenido en directo en pantalla.", businessBullets: ["branding propio", "Live Photo Wall", "captación de leads con consentimiento", "espacios para patrocinadores", "subida QR sin app", "descarga de todo el contenido"], businessCta: "Oferta para empresas →",
    faqEyebrow: "Preguntas frecuentes", faqTitle: "Todo lo que quieres saber antes de tu evento.", faqs: [["¿Los invitados deben instalar una app?", "No. Escanean el QR y suben directamente desde el navegador."], ["¿Las fotos son privadas?", "Sí. La galería se comparte mediante enlace privado o QR y puede protegerse con contraseña."], ["¿Se mantiene la calidad?", "Guestcam conserva archivos de alta calidad para verlos e imprimirlos después."], ["¿Qué pasa después del evento?", "La galería permanece activa según tu paquete y puedes descargarlo todo como ZIP."]],
    finalEyebrow: "Cada cámara. Una historia.", finalTitle: "Vive tu evento a través de los ojos de todos tus invitados.", finalLead: "Todas las fotos y vídeos en un solo lugar. Sin app, sin perseguir a nadie y sin recuerdos perdidos.", finalCta: "Crear galería gratis →",
  },
};

const DESKTOP_VIDEO = "https://www.dropbox.com/scl/fi/qtuzczykxuoa9q19lktyb/guestcam_16x9.mp4?rlkey=5w335kv6w5b90t8q4js3w7e3u&raw=1";

function SectionTitle({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) {
  return <div className="max-w-4xl"><p className={`text-xs font-black uppercase tracking-[.18em] ${light ? "text-[#F4B400]" : "text-[#8F6900]"}`}>{eyebrow}</p><h2 className={`mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl ${light ? "text-white" : ""}`}>{title}</h2>{text ? <p className={`mt-5 text-lg leading-8 ${light ? "text-white/55" : "text-black/55"}`}>{text}</p> : null}</div>;
}

export async function LocalizedGuestcamHomePageV3({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  let signedIn = false;
  try { signedIn = !!(await auth()).userId; } catch {}
  const homePath = localePublicPath(lang, `/${lang}`);
  const blogPath = localePublicPath(lang, `/${lang}/blog`);
  const contactPath = localePublicPath(lang, `/${lang}/contact`);
  const navLinks = ["#how", "#events", "#templates", "#wall", "#pricing", "#business", blogPath] as const;

  return <main className="min-h-screen overflow-hidden bg-[#FFFDF8] text-[#111111]">
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#FFFDF8]/95 backdrop-blur-xl"><nav className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-5 sm:px-7 lg:h-[80px] lg:px-8"><Link href={homePath} className="shrink-0"><GuestcamLogo size="md" showMark /></Link><div className="mx-auto hidden items-center gap-4 lg:flex xl:gap-6">{t.nav.map((label, i) => <Link key={label} href={navLinks[i]} className="group relative whitespace-nowrap py-2 text-[14px] font-bold text-black/65 hover:text-black xl:text-[15px]">{label}<span className="absolute inset-x-0 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-[#F4B400] transition-transform group-hover:scale-x-100" /></Link>)}</div><div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex"><LanguageSwitcher current={lang} languages={HOME_HREFLANG} ariaLabel={t.language} /><HeaderAuthButtons lang={lang} signedIn={signedIn} />{!signedIn ? <Link href="/dashboard/new" className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">{t.create}</Link> : null}</div><div className="ml-auto lg:hidden"><HomeMobileMenu signedIn={signedIn} lang={lang} links={t.nav.map((label, i) => ({ href: navLinks[i], label }))} labels={{ open: t.openMenu, close: t.closeMenu, language: t.language, languageAria: t.language, signIn: t.signIn, dashboard: t.dashboard, cta: t.create }} /></div></nav></header>

    <section className="relative border-b border-black/10"><div className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-12 pt-10 sm:gap-14 sm:px-8 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24"><div className="relative z-10"><div className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black/55 shadow-sm">{t.heroEyebrow}</div><h1 className="mt-6 max-w-[760px] text-[clamp(2.8rem,13vw,6.7rem)] font-black leading-[1.07] tracking-[-.05em] sm:mt-7 sm:leading-[1.02] sm:tracking-[-.065em]">{t.heroTitle}<span className="mt-3 block text-[#B88700] sm:mt-2">{t.heroAccent}</span></h1><p className="mt-5 max-w-2xl text-[17px] leading-7 text-black/60 sm:mt-7 sm:text-xl sm:leading-8">{t.heroLead}</p><div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row"><Link href="/dashboard/new" className="rounded-full bg-[#F4B400] px-8 py-4 text-center text-base font-black text-black shadow-[0_12px_30px_rgba(244,180,0,.25)]">{t.start}</Link><Link href="/demo" className="rounded-full border border-black/15 bg-white px-8 py-4 text-center text-base font-bold hover:bg-black hover:text-white">{t.demo}</Link></div><p className="mt-4 text-sm font-semibold text-black/45">{t.note}</p><a href="#templates" className="mt-6 flex max-w-2xl items-start gap-3 rounded-[22px] border border-[#F4B400]/35 bg-[#FFF6CE] p-4 sm:p-5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4B400]">▣</span><span><strong className="block text-sm font-black sm:text-base">{t.printTitle}</strong><span className="mt-1 block text-sm leading-6 text-black/58">{t.printBody}</span><span className="mt-2 block text-xs font-black text-[#8C6800]">{t.printLink}</span></span></a></div><div className="relative"><div className="absolute -left-6 top-20 h-52 w-52 rounded-full bg-[#F4B400]/20 blur-3xl" /><div className="relative grid grid-cols-12 grid-rows-2 gap-2 sm:gap-3"><div className="relative col-span-7 row-span-2 min-h-[420px] overflow-hidden rounded-[24px] bg-black/5 shadow-2xl sm:min-h-[540px] sm:rounded-[34px] lg:min-h-[620px]"><Image src="/hero/wedding-kiss.webp" alt={t.weddingLabel} fill priority sizes="(max-width:1024px) 58vw, 33vw" className="object-cover" /><div className="absolute bottom-5 left-5 hidden rounded-full bg-black/75 px-4 py-2 text-xs font-bold text-white sm:block">{t.weddingLabel}</div></div><div className="relative col-span-5 overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:rounded-[26px]"><Image src="/hero/party-family.webp" alt="" fill sizes="(max-width:1024px) 42vw, 24vw" className="object-cover" /></div><div className="relative col-span-5 overflow-hidden rounded-[20px] bg-black/5 shadow-xl sm:rounded-[26px]"><Image src="/hero/babyshower-friends.webp" alt="" fill sizes="(max-width:1024px) 42vw, 24vw" className="object-cover" /></div></div></div></div></section>

    <section className="border-b border-black/10 bg-[#FFFDF8] py-20 sm:py-24"><div className="mx-auto max-w-[1500px] px-5 sm:px-8"><div className="mx-auto max-w-4xl text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-[#8F6900]">{t.videoEyebrow}</p><h2 className="mt-4 text-4xl font-black tracking-[-.05em] sm:text-6xl">{t.videoTitle}</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-black/55">{t.videoLead}</p></div><div className="mx-auto mt-9 grid max-w-5xl gap-6 sm:grid-cols-3">{t.videoSteps.map(([title, text], i) => <div key={title} className="border-t border-black/10 pt-4 text-left"><div className="flex gap-3"><span className="font-black text-[#8F6900]">{i + 1}.</span><div><p className="font-black">{title}</p><p className="mt-1 text-sm leading-6 text-black/55">{text}</p></div></div></div>)}</div><div className="mt-12 overflow-hidden rounded-[32px] border border-black/10 bg-black shadow-2xl"><video controls playsInline preload="metadata" className="block aspect-video w-full bg-black object-contain"><source src={DESKTOP_VIDEO} type="video/mp4" /></video></div></div></section>

    <section className="border-y border-black/10 bg-white"><div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-4 sm:px-8">{t.trust.map((label) => <div key={label} className="flex items-center gap-3 rounded-2xl p-2 sm:justify-center"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF2B3] font-black">✓</span><span className="text-sm font-extrabold text-black/65">{label}</span></div>)}</div></section>

    <section id="how" className="bg-[#F4B400] py-24 sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><SectionTitle eyebrow={t.howEyebrow} title={t.howTitle} text={t.howLead} /><div className="mt-14 grid gap-4 lg:grid-cols-3">{t.howSteps.map(([title, desc], i) => <article key={title} className="rounded-[30px] bg-[#FFFDF8] p-8 shadow-lg"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-black text-white">0{i + 1}</div><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-black/55">{desc}</p></article>)}</div></div></section>

    <section id="events" className="bg-[#111111] py-24 text-white sm:py-32"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><SectionTitle eyebrow={t.eventsEyebrow} title={t.eventsTitle} text={t.eventsLead} light /><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{t.eventTitles.map((title, i) => <article key={title} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[.04]"><div className="relative aspect-[4/5]"><Image src={EVENT_IMAGES[i]} alt={`${title} — Guestcam`} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" /></div><div className="p-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{t.eventDescriptions[i]}</p></div></article>)}</div></div></section>

    <section id="templates" className="border-y border-black/5 bg-[#FFFDF8] py-20 sm:py-24"><div className="mx-auto max-w-[1480px] px-5 sm:px-8"><div className="mx-auto max-w-4xl text-center"><p className="text-xs font-black uppercase tracking-[.19em] text-[#8F6900]">{t.templatesEyebrow}</p><h2 className="mt-4 font-serif text-[clamp(3rem,7vw,5.8rem)] font-semibold leading-[.94] tracking-[-.05em]">{t.templatesTitle}</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">{t.templatesLead}</p></div><GuestcamShowcaseCarousel /><div className="mt-9 text-center"><Link href="/dashboard/new" className="inline-flex rounded-full bg-black px-7 py-4 font-black text-white">{t.templatesCta}</Link></div></div></section>

    <section id="features" className="scroll-mt-20 py-20 sm:py-24"><div className="mx-auto grid max-w-[1320px] gap-8 px-5 sm:px-8 lg:grid-cols-[.75fr_1.25fr]"><SectionTitle eyebrow={t.featuresEyebrow} title={t.featuresTitle} text={t.featuresLead} /><div className="grid gap-3 sm:grid-cols-2">{t.features.map(([title, desc], i) => <article key={title} className={`rounded-[24px] border p-6 ${i === 4 ? "border-[#F4B400]/55 bg-[#FFF9E7]" : "border-black/10 bg-white"}`}><div className="ml-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#FFF8D8] text-xs font-black ring-1 ring-[#F4B400]/30">{COMMON_FEATURE_IMAGES[i]}</div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-black/52">{desc}</p></article>)}</div></div></section>

    <section id="wall" className="bg-[#F4B400] py-24 sm:py-32"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[.18em] text-black/55">{t.wallEyebrow}</p><h2 className="mt-4 text-4xl font-black leading-[1.03] tracking-[-.05em] sm:text-6xl">{t.wallTitle}</h2><p className="mt-6 text-lg leading-8 text-black/62">{t.wallLead}</p><ul className="mt-7 space-y-3 font-bold text-black/65">{t.wallBullets.map((bullet) => <li key={bullet}>✓ {bullet}</li>)}</ul></div><div className="rounded-[34px] bg-black/12 p-3 shadow-2xl sm:p-5"><WallMiniDemo label="GUESTCAM LIVE" /></div></div></section>

    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle eyebrow={t.pricingEyebrow} title={t.pricingTitle} text={t.pricingLead} />
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {t.plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex min-h-[560px] flex-col rounded-[30px] p-7 ${plan.name === "Plus" ? "bg-black text-white ring-4 ring-[#F4B400] shadow-2xl" : "border border-black/10 bg-white shadow-sm"}`}
            >
              {plan.popular ? <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F4B400] px-4 py-1.5 text-[11px] font-black uppercase text-black">{plan.popular}</span> : null}
              <p className="text-sm font-black uppercase tracking-[.15em]">{plan.name}</p>
              <p className="mt-2 text-sm opacity-50">{plan.tag}</p>
              <p className="mt-6 text-5xl font-black">{plan.price}</p>
              {plan.localPrice ? <p className="mt-2 text-sm font-bold opacity-65">{plan.localPrice}</p> : null}
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm opacity-75">
                {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>
              <Link href={plan.name === "Free" ? "/dashboard/new" : `/dashboard/new?plan=${plan.name.toLowerCase()}`} className={`mt-8 rounded-full px-5 py-3.5 text-center font-black ${plan.name === "Plus" ? "bg-[#F4B400] text-black" : "bg-black text-white"}`}>{plan.cta}</Link>
            </article>
          ))}
        </div>
        {t.currencyNote ? <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-black/55">{t.currencyNote}</p> : null}
      </div>
    </section>

    <section id="business" className="bg-[#171717] py-24 text-white sm:py-32"><div className="mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center"><div className="relative min-h-[560px] overflow-hidden rounded-[34px]"><Image src="/events/organizacija-dogodkov-dogodek.webp" alt="Guestcam business event" fill sizes="50vw" className="object-cover" /></div><div><span className="inline-flex rounded-full bg-[#F4B400] px-4 py-2 text-xs font-black uppercase tracking-[.15em] text-black">{t.businessBadge}</span><h2 className="mt-6 text-4xl font-black leading-[1.04] tracking-[-.045em] sm:text-6xl">{t.businessTitle}</h2><p className="mt-6 text-lg leading-8 text-white/58">{t.businessLead}</p><div className="mt-9 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-2">{t.businessBullets.map((bullet) => <span key={bullet}>✓ {bullet}</span>)}</div><Link href={contactPath} className="mt-9 inline-flex rounded-full bg-[#F4B400] px-8 py-4 font-black text-black">{t.businessCta}</Link></div></div></section>

    <section id="faq" className="scroll-mt-20 bg-white py-24 sm:py-32"><div className="mx-auto grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[.65fr_1.35fr]"><SectionTitle eyebrow={t.faqEyebrow} title={t.faqTitle} /><div className="divide-y divide-black/10 border-y border-black/10">{t.faqs.map(([question, answer]) => <details key={question} className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-black"><span>{question}</span><span className="text-2xl font-normal text-black/35 group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-6 pr-12 leading-7 text-black/55">{answer}</p></details>)}</div></div></section>

    <section className="border-y border-black/10 bg-[#FFF4B8] py-24 text-center sm:py-28"><div className="mx-auto max-w-4xl px-5 sm:px-8"><p className="text-xs font-black uppercase tracking-[.18em] text-black/45">{t.finalEyebrow}</p><h2 className="mt-4 text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-6xl">{t.finalTitle}</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55">{t.finalLead}</p><Link href="/dashboard/new" className="mt-9 inline-flex rounded-full bg-black px-9 py-4 font-black text-white">{t.finalCta}</Link></div></section>
    <SeoFooter lang={lang} />
  </main>;
}
