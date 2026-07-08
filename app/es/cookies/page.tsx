import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de cookies",
  alternates: { canonical: "https://www.guestcam.si/es/cookies" },
  openGraph: { url: "https://www.guestcam.si/es/cookies", title: "Política de cookies", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="es" />;
}
