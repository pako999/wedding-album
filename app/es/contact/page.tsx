import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";
import { withRegionalHreflang } from "@/lib/seo/hreflang";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos — email, WhatsApp, soporte Premium para tu galería de boda.",
  alternates: {
    canonical: `${SITE_URL}/es/contact`,
    languages: withRegionalHreflang({
      sl: `${SITE_URL}/contact`,
      hr: `${SITE_URL}/hr/contact`,
      sr: `${SITE_URL}/sr/contact`,
      de: `${SITE_URL}/de/contact`,
      en: `${SITE_URL}/en/contact`,
      es: `${SITE_URL}/es/contact`,
      "x-default": `${SITE_URL}/contact`,
    }),
  },
  openGraph: {
    url: `${SITE_URL}/es/contact`,
    title: "Contacto",
    description: "Escríbenos — email, WhatsApp, soporte Premium para tu galería de boda.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="es" />;
}
