import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "https://www.guestcam.si/es/privacy" },
  openGraph: { url: "https://www.guestcam.si/es/privacy", title: "Política de privacidad" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="es" />;
}
