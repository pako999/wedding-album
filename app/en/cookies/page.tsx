import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Cookie Policy",
  alternates: { canonical: `${SITE_URL}/en/cookies`, languages: legalAlternates("cookies") },
  openGraph: { url: `${SITE_URL}/en/cookies`, title: "Cookie Policy", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="en" />;
}
