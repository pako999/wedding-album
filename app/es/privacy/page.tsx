import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: spanishGuestcamUrl("/es/privacy"), languages: legalAlternates("privacy") },
  openGraph: { url: spanishGuestcamUrl("/es/privacy"), title: "Política de privacidad", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="es" />;
}
