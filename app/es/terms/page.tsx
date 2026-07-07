import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Términos de uso",
  alternates: { canonical: "https://www.guestcam.si/es/terms" },
  openGraph: { url: "https://www.guestcam.si/es/terms", title: "Términos de uso" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="es" />;
}
