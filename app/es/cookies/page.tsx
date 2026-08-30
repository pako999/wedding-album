import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Política de cookies",
  alternates: { canonical: spanishGuestcamUrl("/es/cookies"), languages: legalAlternates("cookies") },
  openGraph: { url: spanishGuestcamUrl("/es/cookies"), title: "Política de cookies", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="es" />;
}
