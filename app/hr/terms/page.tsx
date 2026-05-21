import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Uvjeti korištenja | Guestcam",
  alternates: { canonical: "https://guestcam.si/hr/terms" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="hr" />;
}
