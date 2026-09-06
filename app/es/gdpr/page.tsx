import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Tus derechos según el RGPD",
  description: "Consulta tus derechos según el RGPD y cómo acceder, corregir o eliminar tus datos personales en Guestcam.",
  alternates: { canonical: spanishGuestcamUrl("/es/gdpr"), languages: legalAlternates("gdpr") },
  openGraph: { url: spanishGuestcamUrl("/es/gdpr"), title: "Tus derechos según el RGPD", description: "Cómo ejercer tus derechos de acceso, rectificación o supresión.", images: [localizedOgImageUrl("es")] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="es" />;
}
