import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — email, WhatsApp, Premium wedding-day support.",
  alternates: {
    canonical: `${SITE_URL}/en/contact`,
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
    url: `${SITE_URL}/en/contact`,
    title: "Contact",
    description: "Get in touch — email, WhatsApp, Premium wedding-day support.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="en" />;
}
