import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Guestcam",
  alternates: {
    canonical: "https://guestcam.si/en/privacy",
    languages: {
      "sl": "https://guestcam.si/privacy",
      "hr": "https://guestcam.si/hr/privacy",
      "sr": "https://guestcam.si/sr/privacy",
      "de": "https://guestcam.si/de/privacy",
      "en": "https://guestcam.si/en/privacy",
      "es": "https://guestcam.si/es/privacy",
      "x-default": "https://guestcam.si/privacy",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="en" />;
}
