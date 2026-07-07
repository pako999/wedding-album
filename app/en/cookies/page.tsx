import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  alternates: { canonical: "https://www.guestcam.si/en/cookies" },
  openGraph: { url: "https://www.guestcam.si/en/cookies", title: "Cookie Policy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="en" />;
}
