import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika piškotkov",
  description: "Politika piškotkov Guestcam — uporabljamo le tehnično nujne piškotke, brez oglaševalskih ali sledilnih.",
  alternates: {
    canonical: `${SITE_URL}/cookies`,
    languages: legalAlternates("cookies"),
  },
  openGraph: {
    url: `${SITE_URL}/cookies`,
    title: "Politika piškotkov",
    description: "Politika piškotkov Guestcam — uporabljamo le tehnično nujne piškotke, brez oglaševalskih ali sledilnih.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="sl" />;
}
