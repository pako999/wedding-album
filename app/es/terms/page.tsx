import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Términos de uso",
  alternates: { canonical: spanishGuestcamUrl("/es/terms"), languages: legalAlternates("terms") },
  openGraph: { url: spanishGuestcamUrl("/es/terms"), title: "Términos de uso", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="es" />;
}
