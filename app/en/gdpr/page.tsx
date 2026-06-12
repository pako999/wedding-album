import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Your GDPR Rights | Guestcam",
  alternates: {
    canonical: "https://guestcam.si/en/gdpr",
    languages: {
      "sl": "https://guestcam.si/gdpr",
      "hr": "https://guestcam.si/hr/gdpr",
      "sr": "https://guestcam.si/sr/gdpr",
      "de": "https://guestcam.si/de/gdpr",
      "en": "https://guestcam.si/en/gdpr",
      "es": "https://guestcam.si/es/gdpr",
      "x-default": "https://guestcam.si/gdpr",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="en" />;
}
