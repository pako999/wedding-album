import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Politika zasebnosti",
  description: "Politika zasebnosti storitve Guestcam. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
    languages: legalAlternates("privacy"),
  },
  openGraph: {
    url: `${SITE_URL}/privacy`,
    title: "Politika zasebnosti",
    description: "Politika zasebnosti storitve Guestcam. Izveste, katere podatke zbiramo, kako jih varujemo in kakšne so vaše pravice po GDPR.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sl" />;
}
