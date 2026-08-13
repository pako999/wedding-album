import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the SR SERP for "QR kod za venčanje" — top
  // competitor (capturethemoment.rs) uses "QR Kod za Deljenje
  // Fotografija". We lead with the same intent phrase to match.
  // `absolute` bypasses the root layout's "%s | CamLove" template
  // so our title isn't double-branded.
  title: { absolute: "QR kod za venčanje · Fotografije gostiju uživo | CamLove" },
  description:
    "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
  alternates: {
    canonical: `${SITE_URL}/sr`,
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
    locale: "sr_RS",
    siteName: "CamLove",
    url: `${SITE_URL}/sr`,
    title: "QR kod za venčanje · Fotografije gostiju uživo | CamLove",
    description:
      "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
    // Page-level openGraph REPLACES the root's, so the image has to
    // be repeated here. Same versioned filename across locales so we
    // can bust every Facebook/iMessage scrape cache in one go by
    // bumping ?v=.
    images: [
      {
        url: `${SITE_URL}/og-image.png?v=2`,
        width: 910,
        height: 1200,
        alt: "QR kod za venčanje · Fotografije gostiju uživo | CamLove",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR kod za venčanje · Fotografije gostiju uživo | CamLove",
    description: "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
    images: [`${SITE_URL}/og-image.png?v=2`],
  },
};

export default function SrHomePage() {
  return <LocalizedHomePage lang="sr" />;
}
