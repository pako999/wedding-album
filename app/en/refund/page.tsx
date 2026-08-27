import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: `${SITE_URL}/en/refund`, languages: legalAlternates("refund") },
  openGraph: { url: `${SITE_URL}/en/refund`, title: "Refund Policy", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="en" />;
}
