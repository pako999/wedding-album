import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  description: "Saznajte kako Guestcam prikuplja, koristi i štiti osobne podatke korisnika i gostiju u skladu s GDPR-om.",
  alternates: { canonical: `${SITE_URL}/hr/privacy`, languages: legalAlternates("privacy") },
  openGraph: { url: `${SITE_URL}/hr/privacy`, title: "Politika privatnosti", description: "Kako Guestcam obrađuje i štiti osobne podatke korisnika i gostiju.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="hr" />;
}
