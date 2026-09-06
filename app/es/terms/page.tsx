import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Condiciones aplicables a las galerías Guestcam, la subida de fotos y vídeos y los planes de pago.",
  alternates: { canonical: spanishGuestcamUrl("/es/terms"), languages: legalAlternates("terms") },
  openGraph: { url: spanishGuestcamUrl("/es/terms"), title: "Términos de uso", description: "Normas para las galerías Guestcam, las subidas y los planes de pago.", images: [localizedOgImageUrl("es")] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="es" />;
}
