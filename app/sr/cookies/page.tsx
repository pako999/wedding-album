import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika kolačića",
  alternates: { canonical: `${SITE_URL}/sr/cookies`, languages: legalAlternates("cookies") },
  openGraph: { url: `${SITE_URL}/sr/cookies`, title: "Politika kolačića", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="sr" />;
}
