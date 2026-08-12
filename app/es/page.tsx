import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the ES SERP for "aplicación fotos boda invitados
  // código QR" — top rankers (wedUploader, fotify, picbook) all use
  // "Código QR" + "fotos de boda" as the lead phrase. We do the same
  // and add "Sin app · Gratis" as the differentiators every top page
  // emphasises. `absolute` bypasses the root template.
  title: { absolute: "Código QR para fotos de boda · Sin app · Gratis | Guestcam" },
  description:
    "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.",
  alternates: {
    canonical: `${SITE_URL}/es`,
    languages: {
      sl: `${SITE_URL}/`,
      hr: `${SITE_URL}/hr`,
      sr: `${SITE_URL}/sr`,
      de: `${SITE_URL}/de`,
      en: `${SITE_URL}/en`,
      es: `${SITE_URL}/es`,
      "x-default": `${SITE_URL}/`,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Guestcam",
    url: `${SITE_URL}/es`,
    title: "Código QR para fotos de boda · Sin app · Gratis | Guestcam",
    description:
      "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: `${SITE_URL}/og-image.png?v=2`,
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
    images: [`${SITE_URL}/og-image.png?v=2`],
  },
};

export default function EsHomePage() {
  return <LocalizedHomePage lang="es" />;
}
