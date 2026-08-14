import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Schreiben Sie uns — E-Mail, WhatsApp, Premium-Support für Ihre Hochzeitsgalerie.",
  alternates: {
    canonical: `${SITE_URL}/de/contact`,
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
    url: `${SITE_URL}/de/contact`,
    title: "Kontakt",
    description: "Schreiben Sie uns — E-Mail, WhatsApp, Premium-Support für Ihre Hochzeitsgalerie.",
    images: ["/opengraph-image?v=3"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="de" />;
}
