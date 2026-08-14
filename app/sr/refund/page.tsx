import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika povraćaja novca",
  alternates: { canonical: `${SITE_URL}/sr/refund` },
  openGraph: { url: `${SITE_URL}/sr/refund`, title: "Politika povraćaja novca", images: ["/opengraph-image?v=3"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="sr" />;
}
