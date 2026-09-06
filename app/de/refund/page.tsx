import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Rückerstattungsrichtlinie",
  description: "Regeln und Ablauf für Rückerstattungen beim ersten Kauf eines kostenpflichtigen Guestcam-Pakets.",
  alternates: { canonical: `${SITE_URL}/de/refund`, languages: legalAlternates("refund") },
  openGraph: { url: `${SITE_URL}/de/refund`, title: "Rückerstattungsrichtlinie", description: "Wann und wie Sie eine Rückerstattung für ein Guestcam-Paket beantragen können.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="de" />;
}
