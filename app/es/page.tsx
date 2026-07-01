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
    canonical: "https://www.guestcam.si/es",
    languages: {
      sl: "https://www.guestcam.si/",
      hr: "https://www.guestcam.si/hr",
      sr: "https://www.guestcam.si/sr",
      de: "https://www.guestcam.si/de",
      en: "https://www.guestcam.si/en",
      es: "https://www.guestcam.si/es",
      "x-default": "https://www.guestcam.si/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Guestcam",
    url: "https://www.guestcam.si/es",
    title: "Código QR para fotos de boda · Sin app · Gratis | Guestcam",
    description:
      "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://www.guestcam.si/og-image.png?v=2",
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
    images: ["https://www.guestcam.si/og-image.png?v=2"],
  },
};

export default function EsHomePage() {
  return <LocalizedHomePage lang="es" />;
}
