import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika privatnosti | Guestcam",
  alternates: { canonical: "https://guestcam.si/hr/privacy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="hr" />;
}
