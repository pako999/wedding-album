import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika kolačića | Guestcam",
  alternates: {
    canonical: "https://guestcam.si/hr/cookies",
    languages: {
      "sl": "https://guestcam.si/cookies",
      "hr": "https://guestcam.si/hr/cookies",
      "sr": "https://guestcam.si/sr/cookies",
      "de": "https://guestcam.si/de/cookies",
      "en": "https://guestcam.si/en/cookies",
      "es": "https://guestcam.si/es/cookies",
      "x-default": "https://guestcam.si/cookies",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="hr" />;
}
