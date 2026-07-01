import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Pogoji uporabe",
  description: "Pogoji uporabe storitve Guestcam — paketi, plačila, pravice in obveznosti uporabnikov.",
  alternates: {
    canonical: "https://www.guestcam.si/terms",
    languages: {
      sl: "https://www.guestcam.si/terms",
      hr: "https://www.guestcam.si/hr/terms",
      sr: "https://www.guestcam.si/sr/terms",
      de: "https://www.guestcam.si/de/terms",
      en: "https://www.guestcam.si/en/terms",
      es: "https://www.guestcam.si/es/terms",
      "x-default": "https://www.guestcam.si/terms",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sl" />;
}
