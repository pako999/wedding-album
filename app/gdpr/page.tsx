import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Pravice po GDPR",
  description: "Vaše pravice po GDPR pri uporabi storitve Guestcam: dostop, popravek, izbris, prenosljivost, pritožba.",
  alternates: {
    canonical: `${SITE_URL}/gdpr`,
    languages: {
      sl: `${SITE_URL}/gdpr`,
      hr: `${SITE_URL}/hr/gdpr`,
      sr: `${SITE_URL}/sr/gdpr`,
      de: `${SITE_URL}/de/gdpr`,
      en: `${SITE_URL}/en/gdpr`,
      es: `${SITE_URL}/es/gdpr`,
      "x-default": `${SITE_URL}/gdpr`,
    },
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
