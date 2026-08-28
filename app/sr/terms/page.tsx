import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  description: "Uslovi korišćenja platforme Guestcam za privatne galerije, otpremanje fotografija i plaćene pakete.",
  alternates: { canonical: `${SITE_URL}/sr/terms`, languages: legalAlternates("terms") },
  openGraph: { url: `${SITE_URL}/sr/terms`, title: "Uslovi korišćenja", description: "Pravila korišćenja Guestcam galerija, otpremanja fotografija i plaćenih paketa.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sr" />;
}
