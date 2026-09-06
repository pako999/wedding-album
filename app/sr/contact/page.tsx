import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";
import { withRegionalHreflang } from "@/lib/seo/hreflang";
import { serbianGuestcamUrl } from "@/lib/site-domains";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Pišite nam — email, WhatsApp, Premium podrška za vašu venčanu galeriju.",
  alternates: {
    canonical: serbianGuestcamUrl("/sr/contact"),
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
    url: serbianGuestcamUrl("/sr/contact"),
    title: "Kontakt",
    description: "Pišite nam — email, WhatsApp, Premium podrška za vašu venčanu galeriju.",
    images: [localizedOgImageUrl("sr")],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="sr" />;
}
