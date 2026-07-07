import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Uvjeti korištenja",
  alternates: { canonical: "https://www.guestcam.si/hr/terms" },
  openGraph: { url: "https://www.guestcam.si/hr/terms", title: "Uvjeti korištenja" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="hr" />;
}
