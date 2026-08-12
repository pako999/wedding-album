import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Términos de uso",
  alternates: { canonical: `${SITE_URL}/es/terms` },
  openGraph: { url: `${SITE_URL}/es/terms`, title: "Términos de uso", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="es" />;
}
