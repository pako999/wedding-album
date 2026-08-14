import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Pišite nam — email, WhatsApp, Premium podrška za vašu venčanu galeriju.",
  alternates: {
    canonical: `${SITE_URL}/sr/contact`,
    languages: {
      sl: `${SITE_URL}/contact`,
      hr: `${SITE_URL}/hr/contact`,
      sr: `${SITE_URL}/sr/contact`,
      de: `${SITE_URL}/de/contact`,
      en: `${SITE_URL}/en/contact`,
      es: `${SITE_URL}/es/contact`,
      "x-default": `${SITE_URL}/contact`,
    },
  },
  openGraph: {
    url: `${SITE_URL}/sr/contact`,
    title: "Kontakt",
    description: "Pišite nam — email, WhatsApp, Premium podrška za vašu venčanu galeriju.",
    images: ["/opengraph-image?v=3"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="sr" />;
}
