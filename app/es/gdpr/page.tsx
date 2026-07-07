import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Tus derechos según el RGPD",
  alternates: { canonical: "https://www.guestcam.si/es/gdpr" },
  openGraph: { url: "https://www.guestcam.si/es/gdpr", title: "Tus derechos según el RGPD" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="es" />;
}
