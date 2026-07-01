import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika piškotkov | Guestcam",
  description: "Politika piškotkov Guestcam — uporabljamo le tehnično nujne piškotke, brez oglaševalskih ali sledilnih.",
  alternates: {
    canonical: "https://www.guestcam.si/cookies",
    languages: {
      sl: "https://www.guestcam.si/cookies",
      hr: "https://www.guestcam.si/hr/cookies",
      sr: "https://www.guestcam.si/sr/cookies",
      de: "https://www.guestcam.si/de/cookies",
      en: "https://www.guestcam.si/en/cookies",
      es: "https://www.guestcam.si/es/cookies",
      "x-default": "https://www.guestcam.si/cookies",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="sl" />;
}
