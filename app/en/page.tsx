import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  // Optimized against the EN SERP for "wedding photo sharing app" /
  // "QR code wedding photos" — the #1 ranker (kululu.com) uses
  // "Wedding Photo Sharing App With QR Code | Easy & Free". We mirror
  // the same intent phrase and add "Free" as the differentiator that
  // every top ranker emphasises. `absolute` bypasses the root template.
  title: { absolute: "Wedding Photo Sharing App with QR Code · Free | Guestcam" },
  description:
    "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start. Built for weddings & events.",
  alternates: {
    canonical: "https://www.guestcam.si/en",
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
    locale: "en_GB",
    siteName: "Guestcam",
    url: "https://www.guestcam.si/en",
    title: "Wedding Photo Sharing App with QR Code · Free | Guestcam",
    description:
      "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start. Built for weddings & events.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://www.guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "Wedding Photo Sharing App with QR Code · Free | Guestcam",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Photo Sharing App with QR Code · Free | Guestcam",
    description: "Collect every wedding guest's photos and videos via QR code into one private gallery. No app, full quality, free to start.",
    images: ["https://www.guestcam.si/og-image.png?v=2"],
  },
};

export default function EnHomePage() {
  return <LocalizedHomePage lang="en" />;
}
