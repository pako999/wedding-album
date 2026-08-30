import { SITE_URL } from "@/lib/urls";
import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LocalizedGuestcamHomePageV3 } from "@/components/LocalizedGuestcamHomePageV3";
import { withRegionalHreflang } from "@/lib/seo/hreflang";

export const metadata: Metadata = {
  title: { absolute: "Código QR para fotos de boda · Sin app · Gratis | Guestcam" },
  description: "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.",
  alternates: { canonical: spanishGuestcamUrl("/es"), languages: withRegionalHreflang({ sl: `${SITE_URL}/`, hr: `${SITE_URL}/hr`, sr: `${SITE_URL}/sr`, de: `${SITE_URL}/de`, en: `${SITE_URL}/en`, es: `${SITE_URL}/es`, "x-default": `${SITE_URL}/` }) },
  openGraph: { type: "website", locale: "es_ES", siteName: "Guestcam", url: spanishGuestcamUrl("/es"), title: "Código QR para fotos de boda · Sin app · Gratis | Guestcam", description: "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar. Para bodas.", images: [{ url: `${SITE_URL}/og-image.png?v=2`, width: 910, height: 1200, alt: "Código QR para fotos de boda · Sin app · Gratis | Guestcam", type: "image/png" }] },
  twitter: { card: "summary_large_image", title: "Código QR para fotos de boda · Sin app · Gratis | Guestcam", description: "Reúne todas las fotos y vídeos de tus invitados con un código QR en una galería privada. Sin app, calidad completa, gratis para empezar.", images: [`${SITE_URL}/og-image.png?v=2`] },
};

export default function EsHomePage() { return <LocalizedGuestcamHomePageV3 lang="es" />; }
