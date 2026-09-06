import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Guestcam collects, uses and protects personal data belonging to users and guests under the GDPR.",
  alternates: { canonical: `${SITE_URL}/en/privacy`, languages: legalAlternates("privacy") },
  openGraph: { url: `${SITE_URL}/en/privacy`, title: "Privacy Policy", description: "How Guestcam processes and protects personal data.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="en" />;
}
