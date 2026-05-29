import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika vračila denarja | Guestcam",
  description: "Politika vračila denarja Guestcam — 30-dnevna garancija vračila, pogoji, postopek in roki.",
  alternates: {
    canonical: "https://guestcam.si/refund",
    languages: {
      sl: "https://guestcam.si/refund",
      hr: "https://guestcam.si/hr/refund",
      sr: "https://guestcam.si/sr/refund",
      de: "https://guestcam.si/de/refund",
      en: "https://guestcam.si/en/refund",
      es: "https://guestcam.si/es/refund",
      "x-default": "https://guestcam.si/refund",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sl" />;
}
