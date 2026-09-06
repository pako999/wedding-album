import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Política de reembolsos",
  description: "Normas y proceso para solicitar el reembolso de la primera compra de un plan de pago de Guestcam.",
  alternates: { canonical: spanishGuestcamUrl("/es/refund"), languages: legalAlternates("refund") },
  openGraph: { url: spanishGuestcamUrl("/es/refund"), title: "Política de reembolsos", description: "Cuándo y cómo solicitar el reembolso de un plan Guestcam.", images: [localizedOgImageUrl("es")] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="es" />;
}
