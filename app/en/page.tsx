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
    title: "Guestcam — Collect every guest photo with a single QR code",
    description:
      "Collect all your guests' photos and videos in one private gallery. No app, full quality.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guestcam — Collect every guest photo with a single QR code",
    description: "Collect all your guests' photos and videos in one private gallery. No app, full quality — for weddings, birthdays and events.",
  },
};

export default function EnHomePage() {
  return <LocalizedHomePage lang="en" />;
}
