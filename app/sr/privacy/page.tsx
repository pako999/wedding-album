import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { serbianGuestcamUrl } from "@/lib/site-domains";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  description: "Saznajte kako Guestcam prikuplja, koristi i štiti lične podatke korisnika i gostiju u skladu sa GDPR-om.",
  alternates: { canonical: serbianGuestcamUrl("/sr/privacy"), languages: legalAlternates("privacy") },
  openGraph: { url: serbianGuestcamUrl("/sr/privacy"), title: "Politika privatnosti", description: "Kako Guestcam obrađuje i štiti lične podatke korisnika i gostiju.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sr" />;
}
