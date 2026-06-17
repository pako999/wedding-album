import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Rückerstattungsrichtlinie | Guestcam",
  alternates: { canonical: "https://guestcam.si/de/refund" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="de" />;
}
