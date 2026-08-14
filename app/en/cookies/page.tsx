import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  alternates: { canonical: `${SITE_URL}/en/cookies` },
  openGraph: { url: `${SITE_URL}/en/cookies`, title: "Cookie Policy", images: ["/opengraph-image?v=3"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="en" />;
}
