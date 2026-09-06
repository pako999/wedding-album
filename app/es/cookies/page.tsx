import { spanishGuestcamUrl } from "@/lib/site-domains";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies utiliza Guestcam, por qué se usan y cómo puedes administrar tus preferencias.",
  alternates: { canonical: spanishGuestcamUrl("/es/cookies"), languages: legalAlternates("cookies") },
  openGraph: { url: spanishGuestcamUrl("/es/cookies"), title: "Política de cookies", description: "Cookies de Guestcam y opciones para administrar tus preferencias.", images: [localizedOgImageUrl("es")] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="es" />;
}
