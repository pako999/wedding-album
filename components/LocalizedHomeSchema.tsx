import { localeAbsoluteUrl, SITE_URL } from "@/lib/urls";

type Lang = "en" | "de" | "hr" | "sr" | "es";

type SchemaCopy = {
  language: string;
  description: string;
  howToName: string;
  howToDescription: string;
  steps: [string, string][];
  faqs: [string, string][];
};

const COPY: Record<Lang, SchemaCopy> = {
  en: {
    language: "en-GB",
    description: "Wedding and event photo sharing platform that collects guest photos and videos through a QR code in one private gallery without requiring an app.",
    howToName: "How to collect guest photos with a Guestcam QR code",
    howToDescription: "Create a private Guestcam gallery, place the QR code at the event and let guests upload photos and videos from their phones.",
    steps: [["Create your event", "Create a private Guestcam gallery and receive its QR code."], ["Place the QR code", "Put the QR code on tables, invitations, signs or a screen."], ["Guests upload", "Guests scan the QR code and upload photos and videos without installing an app."]],
    faqs: [["Do guests need to install an app?", "No. Guests scan the QR code and upload directly from their mobile browser."], ["Are the photos private?", "Yes. The gallery is shared through a private link or QR code and can also be password protected."], ["Can Guestcam collect videos?", "Yes. Guestcam supports both photos and videos, with limits depending on the selected package."], ["Can I download everything after the event?", "Yes. Paid packages include ZIP download so the organizer can archive the event files together."]],
  },
  de: {
    language: "de-DE",
    description: "Plattform zum Sammeln von Hochzeits- und Eventfotos per QR-Code in einer privaten Galerie, ohne App für die Gäste.",
    howToName: "Gästefotos mit einem Guestcam QR-Code sammeln",
    howToDescription: "Private Guestcam-Galerie erstellen, QR-Code beim Event platzieren und Gäste Fotos und Videos vom Handy hochladen lassen.",
    steps: [["Event erstellen", "Private Guestcam-Galerie erstellen und QR-Code erhalten."], ["QR-Code platzieren", "QR-Code auf Tischen, Einladungen, Schildern oder einem Bildschirm platzieren."], ["Gäste laden hoch", "Gäste scannen den QR-Code und laden Fotos und Videos ohne App hoch."]],
    faqs: [["Müssen Gäste eine App installieren?", "Nein. Gäste scannen den QR-Code und laden direkt im mobilen Browser hoch."], ["Sind die Fotos privat?", "Ja. Die Galerie wird über einen privaten Link oder QR-Code geteilt und kann mit einem Passwort geschützt werden."], ["Unterstützt Guestcam Videos?", "Ja. Guestcam unterstützt Fotos und Videos; die Limits hängen vom gewählten Paket ab."], ["Kann ich nach dem Event alles herunterladen?", "Ja. Bezahlte Pakete enthalten einen ZIP-Download für die gesammelten Eventdateien."]],
  },
  hr: {
    language: "hr-HR",
    description: "Platforma za prikupljanje fotografija i videozapisa gostiju s vjenčanja i događaja putem QR koda u jednoj privatnoj galeriji, bez aplikacije.",
    howToName: "Kako prikupiti fotografije gostiju pomoću Guestcam QR koda",
    howToDescription: "Kreirajte privatnu Guestcam galeriju, postavite QR kod na događaj i omogućite gostima učitavanje fotografija i videa s mobitela.",
    steps: [["Kreirajte događaj", "Kreirajte privatnu Guestcam galeriju i dobijte QR kod."], ["Postavite QR kod", "Postavite QR kod na stolove, pozivnice, oznake ili zaslon."], ["Gosti učitavaju", "Gosti skeniraju QR kod i učitavaju fotografije i videozapise bez aplikacije."]],
    faqs: [["Moraju li gosti instalirati aplikaciju?", "Ne. Gosti skeniraju QR kod i učitavaju izravno iz mobilnog preglednika."], ["Jesu li fotografije privatne?", "Da. Galerija se dijeli privatnom poveznicom ili QR kodom i može biti zaštićena lozinkom."], ["Podržava li Guestcam videozapise?", "Da. Guestcam podržava fotografije i videozapise, a ograničenja ovise o paketu."], ["Mogu li nakon događaja sve preuzeti?", "Da. Plaćeni paketi uključuju ZIP preuzimanje svih prikupljenih datoteka."]],
  },
  sr: {
    language: "sr-RS",
    description: "Platforma za prikupljanje fotografija i video snimaka gostiju sa venčanja i događaja putem QR koda u jednoj privatnoj galeriji, bez aplikacije.",
    howToName: "Kako prikupiti fotografije gostiju pomoću Guestcam QR koda",
    howToDescription: "Napravite privatnu Guestcam galeriju, postavite QR kod na događaju i omogućite gostima da učitavaju fotografije i video snimke sa telefona.",
    steps: [["Napravite događaj", "Napravite privatnu Guestcam galeriju i dobijte QR kod."], ["Postavite QR kod", "Postavite QR kod na stolove, pozivnice, oznake ili ekran."], ["Gosti učitavaju", "Gosti skeniraju QR kod i učitavaju fotografije i video snimke bez aplikacije."]],
    faqs: [["Da li gosti moraju da instaliraju aplikaciju?", "Ne. Gosti skeniraju QR kod i učitavaju direktno iz mobilnog pregledača."], ["Da li su fotografije privatne?", "Da. Galerija se deli privatnim linkom ili QR kodom i može biti zaštićena lozinkom."], ["Da li Guestcam podržava video?", "Da. Guestcam podržava fotografije i video snimke, a ograničenja zavise od paketa."], ["Mogu li posle događaja sve da preuzmem?", "Da. Plaćeni paketi uključuju ZIP preuzimanje svih prikupljenih fajlova."]],
  },
  es: {
    language: "es-ES",
    description: "Plataforma para reunir fotos y vídeos de invitados de bodas y eventos mediante un código QR en una galería privada, sin necesidad de instalar una app.",
    howToName: "Cómo reunir fotos de invitados con un código QR de Guestcam",
    howToDescription: "Crea una galería privada de Guestcam, coloca el código QR en el evento y deja que los invitados suban fotos y vídeos desde sus móviles.",
    steps: [["Crea tu evento", "Crea una galería privada de Guestcam y obtén su código QR."], ["Coloca el código QR", "Pon el QR en mesas, invitaciones, carteles o una pantalla."], ["Los invitados suben", "Los invitados escanean el QR y suben fotos y vídeos sin instalar una app."]],
    faqs: [["¿Los invitados deben instalar una app?", "No. Escanean el código QR y suben directamente desde el navegador del móvil."], ["¿Las fotos son privadas?", "Sí. La galería se comparte mediante un enlace privado o QR y también puede protegerse con contraseña."], ["¿Guestcam admite vídeos?", "Sí. Guestcam admite fotos y vídeos; los límites dependen del paquete elegido."], ["¿Puedo descargarlo todo después del evento?", "Sí. Los paquetes de pago incluyen descarga ZIP de los archivos recopilados."]],
  },
};

export function LocalizedHomeSchema({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const url = localeAbsoluteUrl(lang, `/${lang}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}/#webpage`, url, name: "Guestcam", inLanguage: t.language, isPartOf: { "@id": `${SITE_URL}/#website` } },
      { "@type": "SoftwareApplication", "@id": `${SITE_URL}/#app`, name: "Guestcam", applicationCategory: "PhotographyApplication", operatingSystem: "Web", url, description: t.description, offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Basic", price: "39", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Plus", price: "49", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Premium", price: "99", priceCurrency: "EUR" },
      ] },
      { "@type": "HowTo", name: t.howToName, description: t.howToDescription, totalTime: "PT2M", inLanguage: t.language, step: t.steps.map(([name, text], index) => ({ "@type": "HowToStep", position: index + 1, name, text })) },
      { "@type": "FAQPage", inLanguage: t.language, mainEntity: t.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
