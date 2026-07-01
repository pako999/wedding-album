import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Contact | Guestcam",
  description: "Get in touch — email, WhatsApp, Premium wedding-day support.",
  alternates: {
    canonical: "https://www.guestcam.si/en/contact",
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
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="en" />;
}
