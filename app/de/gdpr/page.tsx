import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Ihre Rechte nach DSGVO",
  description: "Überblick über Ihre DSGVO-Rechte und Anleitungen zu Auskunft, Berichtigung und Löschung Ihrer Daten bei Guestcam.",
  alternates: { canonical: `${SITE_URL}/de/gdpr`, languages: legalAlternates("gdpr") },
  openGraph: { url: `${SITE_URL}/de/gdpr`, title: "Ihre Rechte nach DSGVO", description: "So machen Sie Ihre Rechte auf Auskunft, Berichtigung oder Löschung geltend.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="de" />;
}
