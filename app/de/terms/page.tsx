import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen",
  alternates: { canonical: "https://www.guestcam.si/de/terms" },
  openGraph: { url: "https://www.guestcam.si/de/terms", title: "Nutzungsbedingungen", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="de" />;
}
