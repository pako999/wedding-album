import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Your GDPR Rights | Guestcam",
  alternates: { canonical: "https://www.guestcam.si/en/gdpr" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="en" />;
}
