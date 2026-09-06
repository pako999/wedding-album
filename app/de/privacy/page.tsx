import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Erfahren Sie, wie Guestcam personenbezogene Daten von Nutzern und Gästen gemäß DSGVO verarbeitet und schützt.",
  alternates: { canonical: `${SITE_URL}/de/privacy`, languages: legalAlternates("privacy") },
  openGraph: { url: `${SITE_URL}/de/privacy`, title: "Datenschutzerklärung", description: "Wie Guestcam personenbezogene Daten verarbeitet und schützt.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="de" />;
}
