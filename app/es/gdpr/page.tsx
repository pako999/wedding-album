import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Tus derechos según el RGPD",
  alternates: { canonical: spanishGuestcamUrl("/es/gdpr"), languages: legalAlternates("gdpr") },
  openGraph: { url: spanishGuestcamUrl("/es/gdpr"), title: "Tus derechos según el RGPD", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="es" />;
}
