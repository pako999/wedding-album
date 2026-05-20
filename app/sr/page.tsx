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
    title: "Guestcam — Sakupite sve fotografije gostiju jednim QR kodom",
    description:
      "Sakupite sve fotografije i video snimke gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punom kvalitetu.",
  },
};

export default function SrHomePage() {
  return <LocalizedHomePage lang="sr" />;
}
