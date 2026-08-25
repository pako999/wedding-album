import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedGuestcamHomePageV3 } from "@/components/LocalizedGuestcamHomePageV3";

export const metadata: Metadata = {
  title: { absolute: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam" },
  description: "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.",
  alternates: { canonical: `${SITE_URL}/hr`, languages: { sl: `${SITE_URL}/`, hr: `${SITE_URL}/hr`, sr: `${SITE_URL}/sr`, de: `${SITE_URL}/de`, en: `${SITE_URL}/en`, es: `${SITE_URL}/es`, "x-default": `${SITE_URL}/` } },
  openGraph: { type: "website", locale: "hr_HR", siteName: "Guestcam", url: `${SITE_URL}/hr`, title: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam", description: "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.", images: [{ url: `${SITE_URL}/og-image.png?v=2`, width: 910, height: 1200, alt: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam", type: "image/png" }] },
  twitter: { card: "summary_large_image", title: "QR kod za vjenčanje · Fotografije gostiju uživo | Guestcam", description: "Skupite sve fotografije i videozapise gostiju s vjenčanja preko QR koda u privatnoj galeriji. Bez aplikacije, puna kvaliteta, besplatno za isprobati.", images: [`${SITE_URL}/og-image.png?v=2`] },
};

export default function HrHomePage() { return <LocalizedGuestcamHomePageV3 lang="hr" />; }
