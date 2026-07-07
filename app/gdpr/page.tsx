import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Pravice po GDPR",
  description: "Vaše pravice po GDPR pri uporabi storitve Guestcam: dostop, popravek, izbris, prenosljivost, pritožba.",
  alternates: {
    canonical: "https://www.guestcam.si/gdpr",
    languages: {
      sl: "https://www.guestcam.si/gdpr",
      hr: "https://www.guestcam.si/hr/gdpr",
      sr: "https://www.guestcam.si/sr/gdpr",
      de: "https://www.guestcam.si/de/gdpr",
      en: "https://www.guestcam.si/en/gdpr",
      es: "https://www.guestcam.si/es/gdpr",
      "x-default": "https://www.guestcam.si/gdpr",
    },
  },
  openGraph: {
    url: "https://www.guestcam.si/gdpr",
    title: "Pravice po GDPR",
    description: "Vaše pravice po GDPR pri uporabi storitve Guestcam: dostop, popravek, izbris, prenosljivost, pritožba.",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="sl" />;
}
