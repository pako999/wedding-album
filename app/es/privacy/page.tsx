import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Descubre cómo Guestcam recopila, utiliza y protege los datos personales de usuarios e invitados conforme al RGPD.",
  alternates: { canonical: spanishGuestcamUrl("/es/privacy"), languages: legalAlternates("privacy") },
  openGraph: { url: spanishGuestcamUrl("/es/privacy"), title: "Política de privacidad", description: "Cómo Guestcam trata y protege los datos personales.", images: [localizedOgImageUrl("es")] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="es" />;
}
