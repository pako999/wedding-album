import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Pogoji uporabe",
  description: "Pogoji uporabe storitve Guestcam — paketi, plačila, pravice in obveznosti uporabnikov.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
    languages: legalAlternates("terms"),
  },
  openGraph: {
    url: `${SITE_URL}/terms`,
    title: "Pogoji uporabe",
    description: "Pogoji uporabe storitve Guestcam — paketi, plačila, pravice in obveznosti uporabnikov.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sl" />;
}
