import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Pogoji uporabe",
  description: "Pogoji uporabe storitve CamLove — paketi, plačila, pravice in obveznosti uporabnikov.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
    languages: {
      sl: `${SITE_URL}/terms`,
      hr: `${SITE_URL}/hr/terms`,
      sr: `${SITE_URL}/sr/terms`,
      de: `${SITE_URL}/de/terms`,
      en: `${SITE_URL}/en/terms`,
      es: `${SITE_URL}/es/terms`,
      "x-default": `${SITE_URL}/terms`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/terms`,
    title: "Pogoji uporabe",
    description: "Pogoji uporabe storitve CamLove — paketi, plačila, pravice in obveznosti uporabnikov.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sl" />;
}
