import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika povrata novca",
  alternates: { canonical: `${SITE_URL}/hr/refund` },
  openGraph: { url: `${SITE_URL}/hr/refund`, title: "Politika povrata novca", images: ["/opengraph-image?v=3"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="refund" lang="hr" />;
}
