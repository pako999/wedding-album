import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika povraćaja novca",
  description: "Pravila i postupak povraćaja novca za prvu kupovinu Guestcam plaćenog paketa.",
  alternates: { canonical: `${SITE_URL}/sr/refund`, languages: legalAlternates("refund") },
  openGraph: { url: `${SITE_URL}/sr/refund`, title: "Politika povraćaja novca", description: "Kada i kako možete da zatražite povraćaj novca za Guestcam paket.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sr" />;
}
