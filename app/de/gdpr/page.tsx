import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Ihre Rechte nach DSGVO",
  alternates: { canonical: `${SITE_URL}/de/gdpr`, languages: legalAlternates("gdpr") },
  openGraph: { url: `${SITE_URL}/de/gdpr`, title: "Ihre Rechte nach DSGVO", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="de" />;
}
