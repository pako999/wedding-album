import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedHomePage";

export const metadata: Metadata = {
  title: "Guestcam — Collect every guest photo with a single QR code",
  description:
    "Collect all your guests' photos and videos in one private gallery. No app, full quality — for weddings, birthdays and events.",
  alternates: {
    canonical: "https://guestcam.si/en",
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
    locale: "en_GB",
    siteName: "Guestcam",
    url: "https://guestcam.si/en",
    title: "Guestcam — Collect every guest photo with a single QR code",
    description:
      "Collect all your guests' photos and videos in one private gallery. No app, full quality.",
    // See app/sr/page.tsx for the per-locale image rationale.
    images: [
      {
        url: "https://guestcam.si/og-image.png?v=2",
        width: 910,
        height: 1200,
        alt: "Guestcam — Collect every guest photo with a single QR code",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Collect every guest photo with a single QR code",
    description: "Collect all your guests' photos and videos in one private gallery. No app, full quality — for weddings, birthdays and events.",
    images: ["https://guestcam.si/og-image.png?v=2"],
  },
};

export default function EnHomePage() {
  return <LocalizedHomePage lang="en" />;
}
