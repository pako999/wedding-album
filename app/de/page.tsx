import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the DE SERP for "Hochzeitsfotos per QR Code
  // sammeln" — the #1 ranker (mymillionsnaps.com) uses that exact
  // phrase. We match it word-for-word in the title to compete head-on.
  // `absolute` bypasses the root template.
  title: { absolute: "Hochzeitsfotos per QR-Code sammeln · Kostenlos | Guestcam" },
  description:
    "Alle Fotos und Videos Ihrer Gäste in einer privaten Galerie sammeln — per QR-Code. Keine App, volle Qualität, kostenlos starten. Für Hochzeiten & Events.",
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
    title: "Hochzeitsfotos per QR-Code sammeln · Kostenlos | Guestcam",
    description:
      "Alle Fotos und Videos Ihrer Gäste in einer privaten Galerie sammeln — per QR-Code. Keine App, volle Qualität, kostenlos starten. Für Hochzeiten & Events.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "Hochzeitsfotos per QR-Code sammeln · Kostenlos | Guestcam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hochzeitsfotos per QR-Code sammeln · Kostenlos | Guestcam",
    description: "Alle Fotos und Videos Ihrer Gäste in einer privaten Galerie sammeln — per QR-Code. Keine App, volle Qualität, kostenlos starten.",
    images: ["https://guestcam.si/og-image.png?v=2"],
  },
};

export default function DeHomePage() {
  return <LocalizedHomePage lang="de" />;
}
