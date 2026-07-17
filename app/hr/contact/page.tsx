import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Kontakt i podrška za vjenčanja",
  description: "Pišite nam — email, WhatsApp, Premium podrška za vašu vjenčanu galeriju.",
  alternates: {
    canonical: "https://www.guestcam.si/hr/contact",
    languages: {
      sl: "https://www.guestcam.si/contact",
      hr: "https://www.guestcam.si/hr/contact",
      sr: "https://www.guestcam.si/sr/contact",
      de: "https://www.guestcam.si/de/contact",
      en: "https://www.guestcam.si/en/contact",
      es: "https://www.guestcam.si/es/contact",
      "x-default": "https://www.guestcam.si/contact",
    },
  },
  openGraph: {
    url: "https://www.guestcam.si/hr/contact",
    title: "Kontakt i podrška za vjenčanja",
    description: "Pišite nam — email, WhatsApp, Premium podrška za vašu vjenčanu galeriju.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="hr" />;
}
