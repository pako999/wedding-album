import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  alternates: { canonical: "https://www.guestcam.si/sr/terms" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sr" />;
}
