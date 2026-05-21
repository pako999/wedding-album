import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Guestcam",
  alternates: { canonical: "https://guestcam.si/en/privacy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="en" />;
}
