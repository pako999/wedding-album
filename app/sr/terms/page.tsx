import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { serbianGuestcamUrl } from "@/lib/site-domains";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  description: "Uslovi korišćenja platforme Guestcam za privatne galerije, otpremanje fotografija i plaćene pakete.",
  alternates: { canonical: serbianGuestcamUrl("/sr/terms"), languages: legalAlternates("terms") },
  openGraph: { url: serbianGuestcamUrl("/sr/terms"), title: "Uslovi korišćenja", description: "Pravila korišćenja Guestcam galerija, otpremanja fotografija i plaćenih paketa.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sr" />;
}
