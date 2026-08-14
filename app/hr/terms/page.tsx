import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Uvjeti korištenja",
  alternates: { canonical: `${SITE_URL}/hr/terms` },
  openGraph: { url: `${SITE_URL}/hr/terms`, title: "Uvjeti korištenja", images: ["/opengraph-image?v=3"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="hr" />;
}
