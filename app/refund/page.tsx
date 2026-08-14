import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika vračila denarja",
  description: "Politika vračila denarja Guestcam — 30-dnevna garancija vračila, pogoji, postopek in roki.",
  alternates: {
    canonical: `${SITE_URL}/refund`,
    languages: {
      sl: `${SITE_URL}/refund`,
      hr: `${SITE_URL}/hr/refund`,
      sr: `${SITE_URL}/sr/refund`,
      de: `${SITE_URL}/de/refund`,
      en: `${SITE_URL}/en/refund`,
      es: `${SITE_URL}/es/refund`,
      "x-default": `${SITE_URL}/refund`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/refund`,
    title: "Politika vračila denarja",
    description: "Politika vračila denarja Guestcam — 30-dnevna garancija vračila, pogoji, postopek in roki.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sl" />;
}
