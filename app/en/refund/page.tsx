import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Rules and process for requesting a refund on your first purchase of a paid Guestcam plan.",
  alternates: { canonical: `${SITE_URL}/en/refund`, languages: legalAlternates("refund") },
  openGraph: { url: `${SITE_URL}/en/refund`, title: "Refund Policy", description: "When and how to request a refund for a Guestcam plan.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="en" />;
}
