import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika kolačića",
  alternates: { canonical: "https://www.guestcam.si/hr/cookies" },
  openGraph: { url: "https://www.guestcam.si/hr/cookies", title: "Politika kolačića" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="hr" />;
}
