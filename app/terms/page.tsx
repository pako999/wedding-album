import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Pogoji uporabe | Guestcam",
  description: "Pogoji uporabe storitve Guestcam — paketi, plačila, pravice in obveznosti uporabnikov.",
  alternates: {
    canonical: "https://guestcam.si/terms",
    languages: {
      sl: "https://guestcam.si/terms",
      hr: "https://guestcam.si/hr/terms",
      sr: "https://guestcam.si/sr/terms",
      de: "https://guestcam.si/de/terms",
      en: "https://guestcam.si/en/terms",
      es: "https://guestcam.si/es/terms",
      "x-default": "https://guestcam.si/terms",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sl" />;
}
