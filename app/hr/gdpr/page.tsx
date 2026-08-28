import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Prava prema GDPR-u",
  description: "Pregled vaših prava prema GDPR-u i upute za pristup, ispravak ili brisanje osobnih podataka u Guestcam sustavu.",
  alternates: { canonical: `${SITE_URL}/hr/gdpr`, languages: legalAlternates("gdpr") },
  openGraph: { url: `${SITE_URL}/hr/gdpr`, title: "Prava prema GDPR-u", description: "Kako ostvariti prava na pristup, ispravak ili brisanje osobnih podataka.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="hr" />;
}
