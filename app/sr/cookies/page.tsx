import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politika kolačića",
  alternates: { canonical: "https://www.guestcam.si/sr/cookies" },
  openGraph: { url: "https://www.guestcam.si/sr/cookies", title: "Politika kolačića", images: ["/og-image.png?v=2"] },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <LegalPage kind="cookies" lang="sr" />;
}
