import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  title: "Guestcam — Sakupite sve fotografije gostiju jednim QR kodom",
  description:
    "Sakupite sve fotografije i video snimke gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punom kvalitetu — za venčanja, rođendane i događaje.",
  alternates: {
    canonical: "https://guestcam.si/sr",
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
    locale: "sr_RS",
    siteName: "Guestcam",
    url: "https://guestcam.si/sr",
    title: "Guestcam — Sakupite sve fotografije gostiju jednim QR kodom",
    description:
      "Sakupite sve fotografije i video snimke gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punom kvalitetu.",
    // Page-level openGraph REPLACES the root's, so the image has to
    // be repeated here. Same versioned filename across locales so we
    // can bust every Facebook/iMessage scrape cache in one go by
    // bumping ?v=.
    images: [
      {
        url: "https://guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "Guestcam — Sakupite sve fotografije gostiju jednim QR kodom",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Sakupite sve fotografije gostiju jednim QR kodom",
    description: "Sakupite sve fotografije i video snimke gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punom kvalitetu — za venčanja, rođendane i događaje.",
    images: ["https://guestcam.si/og-image.png?v=2"],
  },
};

export default function SrHomePage() {
  return <LocalizedHomePage lang="sr" />;
}
