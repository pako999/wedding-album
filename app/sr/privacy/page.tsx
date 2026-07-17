import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika privatnosti — Srbija",
  alternates: { canonical: "https://www.guestcam.si/sr/privacy" },
  openGraph: { url: "https://www.guestcam.si/sr/privacy", title: "Politika privatnosti — Srbija", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sr" />;
}
