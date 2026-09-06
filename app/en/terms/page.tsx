import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing Guestcam galleries, photo and video uploads, and paid plans.",
  alternates: { canonical: `${SITE_URL}/en/terms`, languages: legalAlternates("terms") },
  openGraph: { url: `${SITE_URL}/en/terms`, title: "Terms of Service", description: "Rules for Guestcam galleries, uploads and paid plans.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="en" />;
}
