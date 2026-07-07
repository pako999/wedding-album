import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika vračila denarja",
  description: "Politika vračila denarja Guestcam — 30-dnevna garancija vračila, pogoji, postopek in roki.",
  alternates: {
    canonical: "https://www.guestcam.si/refund",
    languages: {
      sl: "https://www.guestcam.si/refund",
      hr: "https://www.guestcam.si/hr/refund",
      sr: "https://www.guestcam.si/sr/refund",
      de: "https://www.guestcam.si/de/refund",
      en: "https://www.guestcam.si/en/refund",
      es: "https://www.guestcam.si/es/refund",
      "x-default": "https://www.guestcam.si/refund",
    },
  },
  openGraph: {
    url: "https://www.guestcam.si/refund",
    title: "Politika vračila denarja",
    description: "Politika vračila denarja Guestcam — 30-dnevna garancija vračila, pogoji, postopek in roki.",
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sl" />;
}
