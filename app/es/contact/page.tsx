import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = {
  title: "Contacto | Guestcam",
  description: "Escríbenos — email, WhatsApp, soporte Premium para tu galería de boda.",
  alternates: {
    canonical: "https://guestcam.si/es/contact",
    languages: {
      sl: "https://guestcam.si/contact",
      hr: "https://guestcam.si/hr/contact",
      sr: "https://guestcam.si/sr/contact",
      de: "https://guestcam.si/de/contact",
      en: "https://guestcam.si/en/contact",
      es: "https://guestcam.si/es/contact",
      "x-default": "https://guestcam.si/contact",
    },
  },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <ContactPage lang="es" />;
}
