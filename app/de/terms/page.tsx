import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen",
  alternates: { canonical: `${SITE_URL}/de/terms`, languages: legalAlternates("terms") },
  openGraph: { url: `${SITE_URL}/de/terms`, title: "Nutzungsbedingungen", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="de" />;
}
