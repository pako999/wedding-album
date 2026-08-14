import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika zasebnosti",
  description: "Politika zasebnosti storitve CamLove. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
    languages: {
      sl: `${SITE_URL}/privacy`,
      hr: `${SITE_URL}/hr/privacy`,
      sr: `${SITE_URL}/sr/privacy`,
      de: `${SITE_URL}/de/privacy`,
      en: `${SITE_URL}/en/privacy`,
      es: `${SITE_URL}/es/privacy`,
      "x-default": `${SITE_URL}/privacy`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/privacy`,
    title: "Politika zasebnosti",
    description: "Politika zasebnosti storitve CamLove. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
    images: ["/opengraph-image?v=3"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sl" />;
}
