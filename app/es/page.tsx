import { SITE_URL } from "@/lib/urls";
import { SPANISH_ORIGIN } from "@/lib/domains";
import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  title: { absolute: "Código QR para fotos de boda · Sin app · Gratis | Guestcam" },
  description:
    "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.",
  alternates: {
    canonical: `${SPANISH_ORIGIN}/`,
    languages: {
      sl: `${SITE_URL}/`,
      hr: `${SITE_URL}/hr`,
      sr: `${SITE_URL}/sr`,
      de: `${SITE_URL}/de`,
      en: `${SITE_URL}/en`,
      es: `${SPANISH_ORIGIN}/`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Guestcam",
    url: `${SPANISH_ORIGIN}/`,
    title: "Código QR para fotos de boda · Sin app · Gratis | Guestcam",
    description:
      "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.",
    images: [
      {
        url: `${SPANISH_ORIGIN}/og-image.png?v=2`,
        width: 910,
        height: 1200,
        alt: "Código QR para fotos de boda · Sin app · Gratis | Guestcam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Código QR para fotos de boda · Sin app · Gratis | Guestcam",
    description: "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar.",
    images: [`${SPANISH_ORIGIN}/og-image.png?v=2`],
  },
};

export default function EsHomePage() {
  return <LocalizedHomePage lang="es" />;
}
