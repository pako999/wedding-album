import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Ihre Rechte nach DSGVO | Guestcam",
  alternates: { canonical: "https://guestcam.si/de/gdpr" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="de" />;
}
