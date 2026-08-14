import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the EN SERP for "wedding photo sharing app" /
  // "QR code wedding photos" — the #1 ranker (kululu.com) uses
  // "Wedding Photo Sharing App With QR Code | Easy & Free". We mirror
  // the same intent phrase and add "Free" as the differentiator that
  // every top ranker emphasises. `absolute` bypasses the root template.
  title: { absolute: "Wedding Photo Sharing App with QR Code · Free | CamLove" },
  description:
    "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start. Built for weddings & events.",
  alternates: {
    canonical: `${SITE_URL}/en`,
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
    locale: "en_GB",
    siteName: "CamLove",
    url: `${SITE_URL}/en`,
    title: "Wedding Photo Sharing App with QR Code · Free | CamLove",
    description:
      "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start. Built for weddings & events.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: `${SITE_URL}/opengraph-image?v=3`,
        width: 1200,
        height: 630,
        alt: "Wedding Photo Sharing App with QR Code · Free | CamLove",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Photo Sharing App with QR Code · Free | CamLove",
    description: "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start.",
    images: [`${SITE_URL}/opengraph-image?v=3`],
  },
};

export default function EnHomePage() {
  return <LocalizedHomePage lang="en" />;
}
