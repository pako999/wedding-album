import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  alternates: { canonical: "https://www.guestcam.si/sr/privacy" },
  openGraph: { url: "https://www.guestcam.si/sr/privacy", title: "Politika privatnosti" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sr" />;
}
