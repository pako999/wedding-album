import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the HR SERP for "QR kod za vjenčanje" — top
  // competitors (weddingcamera.app, qrfoto.net, qrmemories.photo) all
  // use this exact phrase. `absolute` bypasses the root template.
  title: { absolute: "QR kod za vjenčanje · Fotografije gostiju uživo | CamLove" },
  description:
    "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
  alternates: {
    canonical: `${SITE_URL}/hr`,
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
    locale: "hr_HR",
    siteName: "CamLove",
    url: `${SITE_URL}/hr`,
    title: "QR kod za vjenčanje · Fotografije gostiju uživo | CamLove",
    description:
      "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: `${SITE_URL}/og-image.png?v=2`,
        width: 910,
        height: 1200,
        alt: "QR kod za vjenčanje · Fotografije gostiju uživo | CamLove",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR kod za vjenčanje · Fotografije gostiju uživo | CamLove",
    description: "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
    images: [`${SITE_URL}/og-image.png?v=2`],
  },
};

export default function HrHomePage() {
  return <LocalizedHomePage lang="hr" />;
}
