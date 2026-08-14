import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  alternates: { canonical: `${SITE_URL}/sr/privacy` },
  openGraph: { url: `${SITE_URL}/sr/privacy`, title: "Politika privatnosti", images: ["/opengraph-image?v=3"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="privacy" lang="sr" />;
}
