import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Uvjeti korištenja",
  alternates: { canonical: `${SITE_URL}/hr/terms`, languages: legalAlternates("terms") },
  openGraph: { url: `${SITE_URL}/hr/terms`, title: "Uvjeti korištenja", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="hr" />;
}
