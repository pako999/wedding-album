import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie-Richtlinie",
  alternates: { canonical: "https://www.guestcam.si/de/cookies" },
  openGraph: { url: "https://www.guestcam.si/de/cookies", title: "Cookie-Richtlinie", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="de" />;
}
