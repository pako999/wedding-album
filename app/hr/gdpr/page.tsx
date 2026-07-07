import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Prava prema GDPR-u",
  alternates: { canonical: "https://www.guestcam.si/hr/gdpr" },
  openGraph: { url: "https://www.guestcam.si/hr/gdpr", title: "Prava prema GDPR-u" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="hr" />;
}
