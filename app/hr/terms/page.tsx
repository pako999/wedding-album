import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Uvjeti korištenja",
  description: "Uvjeti korištenja platforme Guestcam za privatne galerije, prijenos fotografija i plaćene pakete.",
  alternates: { canonical: `${SITE_URL}/hr/terms`, languages: legalAlternates("terms") },
  openGraph: { url: `${SITE_URL}/hr/terms`, title: "Uvjeti korištenja", description: "Pravila korištenja Guestcam galerija, prijenosa fotografija i plaćenih paketa.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="hr" />;
}
