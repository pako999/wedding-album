import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  title: "Guestcam — Skupite sve fotografije gostiju jednim QR kodom",
  description:
    "Sakupite sve fotografije i videozapise gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punoj kvaliteti — za vjenčanja, rođendane i događaje.",
  alternates: {
    canonical: "https://guestcam.si/hr",
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
    locale: "hr_HR",
    siteName: "Guestcam",
    title: "Guestcam — Skupite sve fotografije gostiju jednim QR kodom",
    description:
      "Sakupite sve fotografije i videozapise gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punoj kvaliteti.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Skupite sve fotografije gostiju jednim QR kodom",
    description: "Sakupite sve fotografije i videozapise gostiju u jednoj privatnoj galeriji. Bez aplikacije, u punoj kvaliteti — za vjenčanja, rođendane i događaje.",
  },
};

export default function HrHomePage() {
  return <LocalizedHomePage lang="hr" />;
}
