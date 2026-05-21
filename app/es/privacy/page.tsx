import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad | Guestcam",
  alternates: { canonical: "https://guestcam.si/es/privacy" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="es" />;
}
