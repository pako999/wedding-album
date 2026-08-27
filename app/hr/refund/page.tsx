import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika povrata novca",
  alternates: { canonical: `${SITE_URL}/hr/refund`, languages: legalAlternates("refund") },
  openGraph: { url: `${SITE_URL}/hr/refund`, title: "Politika povrata novca", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="hr" />;
}
