import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedGuestcamHomePageV3 } from "@/components/LocalizedGuestcamHomePageV3";

export const metadata: Metadata = {
  title: { absolute: "Wedding Photo Sharing App with QR Code · Free | Guestcam" },
  description: "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start. Built for weddings & events.",
  alternates: { canonical: `${SITE_URL}/en`, languages: { sl: `${SITE_URL}/`, hr: `${SITE_URL}/hr`, sr: `${SITE_URL}/sr`, de: `${SITE_URL}/de`, en: `${SITE_URL}/en`, es: `${SITE_URL}/es`, "x-default": `${SITE_URL}/` } },
  openGraph: { type: "website", locale: "en_GB", siteName: "Guestcam", url: `${SITE_URL}/en`, title: "Wedding Photo Sharing App with QR Code · Free | Guestcam", description: "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start. Built for weddings & events.", images: [{ url: `${SITE_URL}/og-image.png?v=2`, width: 910, height: 1200, alt: "Wedding Photo Sharing App with QR Code · Free | Guestcam", type: "image/png" }] },
  twitter: { card: "summary_large_image", title: "Wedding Photo Sharing App with QR Code · Free | Guestcam", description: "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start.", images: [`${SITE_URL}/og-image.png?v=2`] },
};

export default function EnHomePage() { return <LocalizedGuestcamHomePageV3 lang="en" />; }
