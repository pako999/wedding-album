import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen | Guestcam",
  alternates: { canonical: "https://www.guestcam.si/de/terms" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="de" />;
}
