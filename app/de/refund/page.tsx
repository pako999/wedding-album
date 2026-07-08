import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Rückerstattungsrichtlinie",
  alternates: { canonical: "https://www.guestcam.si/de/refund" },
  openGraph: { url: "https://www.guestcam.si/de/refund", title: "Rückerstattungsrichtlinie", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="de" />;
}
