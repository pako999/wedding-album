import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika piškotkov",
  description: "Politika piškotkov CamLove — uporabljamo le tehnično nujne piškotke, brez oglaševalskih ali sledilnih.",
  alternates: {
    canonical: `${SITE_URL}/cookies`,
    languages: {
      sl: `${SITE_URL}/cookies`,
      hr: `${SITE_URL}/hr/cookies`,
      sr: `${SITE_URL}/sr/cookies`,
      de: `${SITE_URL}/de/cookies`,
      en: `${SITE_URL}/en/cookies`,
      es: `${SITE_URL}/es/cookies`,
      "x-default": `${SITE_URL}/cookies`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/cookies`,
    title: "Politika piškotkov",
    description: "Politika piškotkov CamLove — uporabljamo le tehnično nujne piškotke, brez oglaševalskih ali sledilnih.",
    images: ["/opengraph-image?v=3"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="sl" />;
}
