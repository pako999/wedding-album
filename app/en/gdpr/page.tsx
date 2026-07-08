import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Your GDPR Rights",
  alternates: { canonical: "https://www.guestcam.si/en/gdpr" },
  openGraph: { url: "https://www.guestcam.si/en/gdpr", title: "Your GDPR Rights", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="en" />;
}
