import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "https://www.guestcam.si/en/terms" },
  openGraph: { url: "https://www.guestcam.si/en/terms", title: "Terms of Service", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="en" />;
}
