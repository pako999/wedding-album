import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Tus derechos según el RGPD",
  alternates: { canonical: `${SITE_URL}/es/gdpr` },
  openGraph: { url: `${SITE_URL}/es/gdpr`, title: "Tus derechos según el RGPD", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="es" />;
}
