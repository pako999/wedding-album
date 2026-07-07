import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika povrata novca",
  alternates: { canonical: "https://www.guestcam.si/hr/refund" },
  openGraph: { url: "https://www.guestcam.si/hr/refund", title: "Politika povrata novca" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="hr" />;
}
