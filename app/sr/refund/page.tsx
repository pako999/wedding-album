import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";
import { serbianGuestcamUrl } from "@/lib/site-domains";
import { localizedOgImageUrl } from "@/lib/og";

export const metadata: Metadata = {
  title: "Politika povraćaja novca",
  description: "Pravila i postupak povraćaja novca za prvu kupovinu Guestcam plaćenog paketa.",
  alternates: { canonical: serbianGuestcamUrl("/sr/refund"), languages: legalAlternates("refund") },
  openGraph: { url: serbianGuestcamUrl("/sr/refund"), title: "Politika povraćaja novca", description: "Kada i kako možete da zatražite povraćaj novca za Guestcam paket.", images: [localizedOgImageUrl("sr")] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sr" />;
}
