import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  title: "Guestcam — Reúne todas las fotos de boda con un solo código QR",
  description:
    "Reúne todas las fotos y vídeos de tus invitados en una galería privada. Sin app, calidad completa — para bodas, cumpleaños y eventos.",
  alternates: {
    canonical: "https://guestcam.si/es",
    languages: {
      sl: "https://guestcam.si/",
      hr: "https://guestcam.si/hr",
      sr: "https://guestcam.si/sr",
      de: "https://guestcam.si/de",
      en: "https://guestcam.si/en",
      es: "https://guestcam.si/es",
      "x-default": "https://guestcam.si/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Guestcam",
    title: "Guestcam — Reúne todas las fotos de boda con un solo código QR",
    description:
      "Reúne todas las fotos y vídeos de tus invitados en una galería privada. Sin app, calidad completa.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Reúne todas las fotos de boda con un solo código QR",
    description: "Reúne todas las fotos y vídeos de tus invitados en una galería privada. Sin app, calidad completa — para bodas, cumpleaños y eventos.",
  },
};

export default function EsHomePage() {
  return <LocalizedHomePage lang="es" />;
}
