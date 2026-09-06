import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { legalAlternates } from "@/lib/seo/legal-alternates";

export const metadata: Metadata = {
  title: "Cookie-Richtlinie",
  description: "Welche Cookies Guestcam verwendet, warum sie eingesetzt werden und wie Sie Ihre Einstellungen verwalten können.",
  alternates: { canonical: `${SITE_URL}/de/cookies`, languages: legalAlternates("cookies") },
  openGraph: { url: `${SITE_URL}/de/cookies`, title: "Cookie-Richtlinie", description: "Guestcam-Cookies und Möglichkeiten zur Verwaltung Ihrer Einstellungen.", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="de" />;
}
