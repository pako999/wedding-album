import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Kontakt in podpora",
  description: "Pišite nam — email, WhatsApp, Premium podpora za vašo poročno galerijo.",
  alternates: {
    canonical: "https://www.guestcam.si/contact",
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
    url: "https://www.guestcam.si/contact",
    title: "Kontakt in podpora",
    description: "Pišite nam — email, WhatsApp, Premium podpora za vašo poročno galerijo.",
    images: ["/og-image.png?v=2"],
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="sl" />;
}
