import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de reembolsos",
  alternates: { canonical: `${SITE_URL}/es/refund` },
  openGraph: { url: `${SITE_URL}/es/refund`, title: "Política de reembolsos", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="es" />;
}
