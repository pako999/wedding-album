import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Ihre Rechte nach DSGVO",
  alternates: { canonical: "https://www.guestcam.si/de/gdpr" },
  openGraph: { url: "https://www.guestcam.si/de/gdpr", title: "Ihre Rechte nach DSGVO" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="de" />;
}
