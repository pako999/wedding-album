import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Pravice po GDPR",
  description: "Vaše pravice po GDPR pri uporabi storitve Guestcam: dostop, popravek, izbris, prenosljivost, pritožba.",
  alternates: {
    canonical: `${SITE_URL}/gdpr`,
    languages: legalAlternates("gdpr"),
  },
  openGraph: {
    url: `${SITE_URL}/gdpr`,
    title: "Pravice po GDPR",
    description: "Vaše pravice po GDPR pri uporabi storitve Guestcam: dostop, popravek, izbris, prenosljivost, pritožba.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="sl" />;
}
