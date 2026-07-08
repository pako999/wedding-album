import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy",
  alternates: { canonical: "https://www.guestcam.si/en/refund" },
  openGraph: { url: "https://www.guestcam.si/en/refund", title: "Refund Policy", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="en" />;
}
