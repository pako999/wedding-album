import type { PrintShowroomCopy } from "@/components/PrintShowroom";
import type { BusinessCopy } from "@/components/BusinessSection";

/**
 * Copy for the print-showroom and for-business homepage sections, all six
 * languages in one place so the SL page (app/page.tsx) and the localized
 * homepages render identical sections from the same source of truth.
 */

export type SectionLang = "sl" | "hr" | "sr" | "de" | "en" | "es";

export const NAV_BUSINESS: Record<SectionLang, string> = {
  sl: "Podjetja",
  hr: "Za tvrtke",
  sr: "Za firme",
  de: "Für Firmen",
  en: "For business",
  es: "Empresas",
};

export const PRINT_COPY: Record<SectionLang, PrintShowroomCopy> = {
  sl: {
    badge: "Tisk + namizni podstavki",
    title: "Mi natisnemo. Vi samo postavite na mize.",
    body: "Naročite fizične QR kartice in namizne podstavke skupaj z Guestcam paketom. Kartice personaliziramo z vašo QR kodo, natisnemo na 200 g papir in jih pošljemo pripravljene za vaš dogodek.",
    bullets: ["vaša Guestcam QR koda", "leseni ali zlati podstavek", "tisk je vključen v ceno", "dostava na vaš naslov"],
    cta: "Dodaj podstavke ob nakupu →",
    note: (p) => `Od ${p}/kos · naročite vsaj 10 dni pred dogodkom`,
    woodName: "Leseni podstavek", goldName: "Zlati podstavek", perPiece: " / kos",
  },
  hr: {
    badge: "Tisak + stolni stalci",
    title: "Mi tiskamo. Vi ih samo postavite na stolove.",
    body: "Naručite fizičke QR kartice i stolne stalke zajedno s Guestcam paketom. Kartice personaliziramo vašim QR kodom, tiskamo na papir od 200 g i šaljemo ih spremne za vaš događaj.",
    bullets: ["vaš Guestcam QR kod", "drveni ili zlatni stalak", "tisak je uključen u cijenu", "dostava na vašu adresu"],
    cta: "Dodaj stalke uz kupnju →",
    note: (p) => `Od ${p}/kom · naručite najmanje 10 dana prije događaja`,
    woodName: "Drveni stalak", goldName: "Zlatni stalak", perPiece: " / kom",
  },
  sr: {
    badge: "Štampa + stoni stalci",
    title: "Mi štampamo. Vi ih samo postavite na stolove.",
    body: "Naručite fizičke QR kartice i stone stalke zajedno sa Guestcam paketom. Kartice personalizujemo vašim QR kodom, štampamo na papiru od 200 g i šaljemo ih spremne za vaš događaj.",
    bullets: ["vaš Guestcam QR kod", "drveni ili zlatni stalak", "štampa je uključena u cenu", "dostava na vašu adresu"],
    cta: "Dodaj stalke uz kupovinu →",
    note: (p) => `Od ${p}/kom · naručite najmanje 10 dana pre događaja`,
    woodName: "Drveni stalak", goldName: "Zlatni stalak", perPiece: " / kom",
  },
  de: {
    badge: "Druck + Tischaufsteller",
    title: "Wir drucken. Sie stellen nur auf die Tische.",
    body: "Bestellen Sie physische QR-Karten und Tischaufsteller zusammen mit Ihrem Guestcam-Paket. Wir personalisieren die Karten mit Ihrem QR-Code, drucken auf 200-g-Papier und liefern alles fertig für Ihr Event.",
    bullets: ["Ihr Guestcam-QR-Code", "Holz- oder Gold-Aufsteller", "Druck im Preis enthalten", "Lieferung an Ihre Adresse"],
    cta: "Aufsteller beim Kauf hinzufügen →",
    note: (p) => `Ab ${p}/Stück · mindestens 10 Tage vor dem Event bestellen`,
    woodName: "Holz-Aufsteller", goldName: "Gold-Aufsteller", perPiece: " / Stück",
  },
  en: {
    badge: "Print + table stands",
    title: "We print. You just place them on the tables.",
    body: "Order physical QR cards and table stands together with your Guestcam plan. We personalise the cards with your QR code, print them on 200 g paper and ship them ready for your event.",
    bullets: ["your Guestcam QR code", "wooden or gold stand", "printing included in the price", "delivery to your address"],
    cta: "Add stands at checkout →",
    note: (p) => `From ${p}/piece · order at least 10 days before the event`,
    woodName: "Wooden stand", goldName: "Gold stand", perPiece: " / piece",
  },
  es: {
    badge: "Impresión + soportes de mesa",
    title: "Nosotros imprimimos. Tú solo los colocas en las mesas.",
    body: "Pide tarjetas QR físicas y soportes de mesa junto con tu plan de Guestcam. Personalizamos las tarjetas con tu código QR, las imprimimos en papel de 200 g y las enviamos listas para tu evento.",
    bullets: ["tu código QR de Guestcam", "soporte de madera o dorado", "impresión incluida en el precio", "envío a tu dirección"],
    cta: "Añade soportes al comprar →",
    note: (p) => `Desde ${p}/ud. · pide al menos 10 días antes del evento`,
    woodName: "Soporte de madera", goldName: "Soporte dorado", perPiece: " / ud.",
  },
};

export const BUSINESS_COPY: Record<SectionLang, BusinessCopy> = {
  sl: {
    badge: "Guestcam za podjetja",
    title: "Naj udeleženci ustvarijo vsebino za vaš dogodek.",
    body: "Za konference, promocije, sejme, športne dogodke, poslovna praznovanja in agencije. Udeleženci nalagajo prek QR kode, vsebine pa lahko prikažete v živo.",
    bullets: ["lastna grafična podoba", "Live Photo Wall", "zbiranje kontaktov ob soglasju", "sponzorski oglasi", "QR upload brez aplikacije", "prenos vseh vsebin"],
    cta: "Ponudba za podjetja →",
    imgAlt: "Poslovni dogodek z uporabo Guestcam QR galerije",
  },
  hr: {
    badge: "Guestcam za tvrtke",
    title: "Neka sudionici stvaraju sadržaj za vaš događaj.",
    body: "Za konferencije, promocije, sajmove, sportske događaje, poslovne proslave i agencije. Sudionici učitavaju putem QR koda, a sadržaj možete prikazati uživo.",
    bullets: ["vlastiti vizualni identitet", "Live Photo Wall", "prikupljanje kontakata uz privolu", "sponzorski oglasi", "QR upload bez aplikacije", "preuzimanje svih sadržaja"],
    cta: "Ponuda za tvrtke →",
    imgAlt: "Poslovni događaj s Guestcam QR galerijom",
  },
  sr: {
    badge: "Guestcam za firme",
    title: "Neka učesnici stvaraju sadržaj za vaš događaj.",
    body: "Za konferencije, promocije, sajmove, sportske događaje, poslovne proslave i agencije. Učesnici otpremaju preko QR koda, a sadržaj možete prikazati uživo.",
    bullets: ["sopstveni vizuelni identitet", "Live Photo Wall", "prikupljanje kontakata uz saglasnost", "sponzorski oglasi", "QR upload bez aplikacije", "preuzimanje svih sadržaja"],
    cta: "Ponuda za firme →",
    imgAlt: "Poslovni događaj sa Guestcam QR galerijom",
  },
  de: {
    badge: "Guestcam für Firmen",
    title: "Lassen Sie die Gäste den Content Ihres Events erstellen.",
    body: "Für Konferenzen, Promotions, Messen, Sportevents, Firmenfeiern und Agenturen. Teilnehmer laden per QR-Code hoch, die Inhalte zeigen Sie live.",
    bullets: ["eigenes Branding", "Live Photo Wall", "Kontakterfassung mit Einwilligung", "Sponsoren-Einblendungen", "QR-Upload ohne App", "Download aller Inhalte"],
    cta: "Angebot für Firmen →",
    imgAlt: "Firmenevent mit Guestcam QR-Galerie",
  },
  en: {
    badge: "Guestcam for business",
    title: "Let attendees create the content of your event.",
    body: "For conferences, promotions, trade shows, sports events, company celebrations and agencies. Attendees upload via QR code and you can show everything live.",
    bullets: ["your own branding", "Live Photo Wall", "consent-based lead capture", "sponsor slides", "QR upload with no app", "download of all content"],
    cta: "Business offer →",
    imgAlt: "Corporate event using a Guestcam QR gallery",
  },
  es: {
    badge: "Guestcam para empresas",
    title: "Deja que los asistentes creen el contenido de tu evento.",
    body: "Para conferencias, promociones, ferias, eventos deportivos, celebraciones de empresa y agencias. Los asistentes suben por código QR y todo se puede mostrar en directo.",
    bullets: ["tu propia imagen de marca", "Live Photo Wall", "captación de contactos con consentimiento", "anuncios de patrocinadores", "subida por QR sin app", "descarga de todo el contenido"],
    cta: "Oferta para empresas →",
    imgAlt: "Evento corporativo con galería QR de Guestcam",
  },
};
