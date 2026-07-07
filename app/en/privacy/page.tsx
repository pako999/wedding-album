import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "https://www.guestcam.si/en/privacy" },
  openGraph: { url: "https://www.guestcam.si/en/privacy", title: "Privacy Policy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="en" />;
}
