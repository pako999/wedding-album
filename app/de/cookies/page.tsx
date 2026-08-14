import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie-Richtlinie",
  alternates: { canonical: `${SITE_URL}/de/cookies` },
  openGraph: { url: `${SITE_URL}/de/cookies`, title: "Cookie-Richtlinie", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="de" />;
}
