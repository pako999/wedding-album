import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika povrata novca",
  description: "Pravila i postupak povrata novca za prvu kupnju Guestcam plaćenog paketa.",
  alternates: { canonical: `${SITE_URL}/hr/refund`, languages: legalAlternates("refund") },
  openGraph: { url: `${SITE_URL}/hr/refund`, title: "Politika povrata novca", description: "Kada i kako možete zatražiti povrat novca za Guestcam paket.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="hr" />;
}
