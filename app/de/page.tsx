import { SITE_URL } from "@/lib/urls";
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
    canonical: `${SITE_URL}/de`,
    languages: {
      sl: `${SITE_URL}/`,
      hr: `${SITE_URL}/hr`,
      sr: `${SITE_URL}/sr`,
      de: `${SITE_URL}/de`,
      en: `${SITE_URL}/en`,
      es: `${SITE_URL}/es`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Guestcam",
    url: `${SITE_URL}/de`,
    title: "Hochzeitsfotos per QR-Code sammeln · Kostenlos | Guestcam",
    description:
      "Alle Fotos und Videos Ihrer Gäste in einer privaten Galerie sammeln — per QR-Code. Keine App, volle Qualität, kostenlos starten. Für Hochzeiten & Events.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: `${SITE_URL}/og-image.png?v=2`,
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
    images: [`${SITE_URL}/og-image.png?v=2`],
  },
};

export default function DeHomePage() {
  return <LocalizedHomePage lang="de" />;
}
