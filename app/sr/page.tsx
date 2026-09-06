import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedGuestcamHomePageV3 } from "@/components/LocalizedGuestcamHomePageV3";
import { withRegionalHreflang } from "@/lib/seo/hreflang";
import { SERBIAN_GUESTCAM_ORIGIN, serbianGuestcamUrl } from "@/lib/site-domains";

export const metadata: Metadata = {
  title: { absolute: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam" },
  description: "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.",
  alternates: { canonical: serbianGuestcamUrl("/sr"), languages: withRegionalHreflang({ sl: `${SITE_URL}/`, hr: `${SITE_URL}/hr`, sr: `${SITE_URL}/sr`, de: `${SITE_URL}/de`, en: `${SITE_URL}/en`, es: `${SITE_URL}/es`, "x-default": `${SITE_URL}/` }) },
  openGraph: { type: "website", locale: "sr_RS", siteName: "Guestcam", url: serbianGuestcamUrl("/sr"), title: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam", description: "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.", images: [{ url: `${SERBIAN_GUESTCAM_ORIGIN}/og-image-sr.jpg?v=1`, width: 910, height: 1200, alt: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam", type: "image/jpeg" }] },
  twitter: { card: "summary_large_image", title: "QR kod za venčanje · Fotografije gostiju uživo | Guestcam", description: "Sakupite sve fotografije i video snimke gostiju sa venčanja preko QR koda u privatnoj galeriji. Bez aplikacije, pun kvalitet, besplatno za probu.", images: [`${SERBIAN_GUESTCAM_ORIGIN}/og-image-sr.jpg?v=1`] },
};

export default function SrHomePage() { return <LocalizedGuestcamHomePageV3 lang="sr" />; }
