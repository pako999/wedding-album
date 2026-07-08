import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Prava prema GDPR-u",
  alternates: { canonical: "https://www.guestcam.si/sr/gdpr" },
  openGraph: { url: "https://www.guestcam.si/sr/gdpr", title: "Prava prema GDPR-u", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="sr" />;
}
