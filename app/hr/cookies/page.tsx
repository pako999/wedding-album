import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika kolačića",
  description: "Saznajte koje kolačiće Guestcam koristi, zašto ih koristi i kako možete upravljati svojim postavkama.",
  alternates: { canonical: `${SITE_URL}/hr/cookies`, languages: legalAlternates("cookies") },
  openGraph: { url: `${SITE_URL}/hr/cookies`, title: "Politika kolačića", description: "Pregled Guestcam kolačića i mogućnosti upravljanja postavkama.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="hr" />;
}
