import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Your GDPR Rights",
  description: "An overview of your GDPR rights and how to access, correct or delete personal data held by Guestcam.",
  alternates: { canonical: `${SITE_URL}/en/gdpr`, languages: legalAlternates("gdpr") },
  openGraph: { url: `${SITE_URL}/en/gdpr`, title: "Your GDPR Rights", description: "How to exercise your rights to access, correct or delete personal data.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="en" />;
}
