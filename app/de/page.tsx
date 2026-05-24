import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  title: "Guestcam — Hochzeitsfotos der Gäste mit einem QR-Code sammeln",
  description:
    "Sammeln Sie alle Fotos und Videos Ihrer Gäste in einer privaten Galerie. Keine App, volle Qualität — für Hochzeiten, Geburtstage und Veranstaltungen.",
  alternates: {
    canonical: "https://guestcam.si/de",
    languages: {
      sl: "https://guestcam.si/",
      hr: "https://guestcam.si/hr",
      sr: "https://guestcam.si/sr",
      de: "https://guestcam.si/de",
      en: "https://guestcam.si/en",
      es: "https://guestcam.si/es",
      "x-default": "https://guestcam.si/",
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Guestcam",
    url: "https://guestcam.si/de",
    title: "Guestcam — Hochzeitsfotos der Gäste mit einem QR-Code sammeln",
    description:
      "Sammeln Sie alle Fotos und Videos Ihrer Gäste in einer privaten Galerie. Keine App, volle Qualität.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "Guestcam — Hochzeitsfotos der Gäste mit einem QR-Code sammeln",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Hochzeitsfotos der Gäste mit einem QR-Code sammeln",
    description: "Sammeln Sie alle Fotos und Videos Ihrer Gäste in einer privaten Galerie. Keine App, volle Qualität — für Hochzeiten, Geburtstage und Veranstaltungen.",
    images: ["https://guestcam.si/og-image.png?v=2"],
  },
};

export default function DeHomePage() {
  return <LocalizedHomePage lang="de" />;
}
