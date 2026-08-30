import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Política de reembolsos",
  alternates: { canonical: spanishGuestcamUrl("/es/refund"), languages: legalAlternates("refund") },
  openGraph: { url: spanishGuestcamUrl("/es/refund"), title: "Política de reembolsos", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="es" />;
}
