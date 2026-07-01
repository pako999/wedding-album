import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the HR SERP for "QR kod za vjenčanje" — top
  // competitors (weddingcamera.app, qrfoto.net, qrmemories.photo) all
  // use this exact phrase. `absolute` bypasses the root template.
  title: { absolute: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam" },
  description:
    "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
  alternates: {
    canonical: "https://www.guestcam.si/hr",
    languages: {
      sl: "https://www.guestcam.si/",
      hr: "https://www.guestcam.si/hr",
      sr: "https://www.guestcam.si/sr",
      de: "https://www.guestcam.si/de",
      en: "https://www.guestcam.si/en",
      es: "https://www.guestcam.si/es",
      "x-default": "https://www.guestcam.si/",
    },
  },
  openGraph: {
    type: "website",
    locale: "hr_HR",
    siteName: "Guestcam",
    url: "https://www.guestcam.si/hr",
    title: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam",
    description:
      "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://www.guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam",
    description: "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
    images: ["https://www.guestcam.si/og-image.png?v=2"],
  },
};

export default function HrHomePage() {
  return <LocalizedHomePage lang="hr" />;
}
