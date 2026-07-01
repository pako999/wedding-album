import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the SR SERP for "QR kod za venčanje" — top
  // competitor (capturethemoment.rs) uses "QR Kod za Deljenje
  // Fotografija". We lead with the same intent phrase to match.
  // `absolute` bypasses the root layout's "%s | Guestcam" template
  // so our title isn't double-branded.
  title: { absolute: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam" },
  description:
    "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
  alternates: {
    canonical: "https://www.guestcam.si/sr",
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
    locale: "sr_RS",
    siteName: "Guestcam",
    url: "https://www.guestcam.si/sr",
    title: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam",
    description:
      "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
    // Page-level openGraph REPLACES the root's, so the image has to
    // be repeated here. Same versioned filename across locales so we
    // can bust every Facebook/iMessage scrape cache in one go by
    // bumping ?v=.
    images: [
      {
        url: "https://www.guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam",
    description: "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
    images: ["https://www.guestcam.si/og-image.png?v=2"],
  },
};

export default function SrHomePage() {
  return <LocalizedHomePage lang="sr" />;
}
