import { SITE_URL } from "@/lib/urls";
import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  alternates: { canonical: `${SITE_URL}/sr/terms` },
  openGraph: { url: `${SITE_URL}/sr/terms`, title: "Uslovi korišćenja", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="terms" lang="sr" />;
}
