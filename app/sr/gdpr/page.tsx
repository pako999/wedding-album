import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Prava prema GDPR-u",
  description: "Pregled vaših prava prema GDPR-u i uputstva za pristup, ispravku ili brisanje ličnih podataka u Guestcam sistemu.",
  alternates: { canonical: `${SITE_URL}/sr/gdpr`, languages: legalAlternates("gdpr") },
  openGraph: { url: `${SITE_URL}/sr/gdpr`, title: "Prava prema GDPR-u", description: "Kako da ostvarite prava na pristup, ispravku ili brisanje ličnih podataka.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="gdpr" lang="sr" />;
}
