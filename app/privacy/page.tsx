import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika zasebnosti",
  description: "Politika zasebnosti storitve Guestcam. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
  alternates: {
    canonical: "https://www.guestcam.si/privacy",
    languages: {
      sl: "https://www.guestcam.si/privacy",
      hr: "https://www.guestcam.si/hr/privacy",
      sr: "https://www.guestcam.si/sr/privacy",
      de: "https://www.guestcam.si/de/privacy",
      en: "https://www.guestcam.si/en/privacy",
      es: "https://www.guestcam.si/es/privacy",
      "x-default": "https://www.guestcam.si/privacy",
    },
  },
  openGraph: {
    url: "https://www.guestcam.si/privacy",
    title: "Politika zasebnosti",
    description: "Politika zasebnosti storitve Guestcam. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sl" />;
}
