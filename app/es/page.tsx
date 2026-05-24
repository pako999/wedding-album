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
    url: "https://guestcam.si/es",
    title: "Guestcam — Reúne todas las fotos de boda con un solo código QR",
    description:
      "Reúne todas las fotos y vídeos de tus invitados en una galería privada. Sin app, calidad completa.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "Guestcam — Reúne todas las fotos de boda con un solo código QR",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Reúne todas las fotos de boda con un solo código QR",
    description: "Reúne todas las fotos y vídeos de tus invitados en una galería privada. Sin app, calidad completa — para bodas, cumpleaños y eventos.",
    images: ["https://guestcam.si/og-image.png?v=2"],
  },
};

export default function EsHomePage() {
  return <LocalizedHomePage lang="es" />;
}
