import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika kolačića",
  alternates: { canonical: `${SITE_URL}/sr/cookies` },
  openGraph: { url: `${SITE_URL}/sr/cookies`, title: "Politika kolačića", images: ["/opengraph-image?v=3"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="sr" />;
}
