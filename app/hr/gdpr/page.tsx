import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "GDPR prava — Hrvatska",
  alternates: { canonical: "https://www.guestcam.si/hr/gdpr" },
  openGraph: { url: "https://www.guestcam.si/hr/gdpr", title: "GDPR prava — Hrvatska", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="hr" />;
}
