import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  alternates: { canonical: "https://www.guestcam.si/de/privacy" },
  openGraph: { url: "https://www.guestcam.si/de/privacy", title: "Datenschutzerklärung" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="de" />;
}
