import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de reembolsos",
  alternates: { canonical: "https://www.guestcam.si/es/refund" },
  openGraph: { url: "https://www.guestcam.si/es/refund", title: "Política de reembolsos" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="es" />;
}
