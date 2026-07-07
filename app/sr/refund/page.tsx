import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika povraćaja novca",
  alternates: { canonical: "https://www.guestcam.si/sr/refund" },
  openGraph: { url: "https://www.guestcam.si/sr/refund", title: "Politika povraćaja novca" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sr" />;
}
