import { SITE_URL } from "@/lib/urls";
import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";
import { withRegionalHreflang } from "@/lib/seo/hreflang";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos — email, WhatsApp, soporte Premium para tu galería de boda.",
  alternates: {
    canonical: spanishGuestcamUrl("/es/contact"),
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
    url: spanishGuestcamUrl("/es/contact"),
    title: "Contacto",
    description: "Escríbenos — email, WhatsApp, soporte Premium para tu galería de boda.",
    images: [localizedOgImageUrl("es")],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="es" />;
}
