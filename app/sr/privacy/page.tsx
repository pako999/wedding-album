import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  alternates: { canonical: `${SITE_URL}/sr/privacy`, languages: legalAlternates("privacy") },
  openGraph: { url: `${SITE_URL}/sr/privacy`, title: "Politika privatnosti", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sr" />;
}
