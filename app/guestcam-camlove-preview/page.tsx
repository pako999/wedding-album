import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { GuestcamCamloveHomepage } from "@/components/GuestcamCamloveHomepage";

export const metadata: Metadata = {
  title: "Guestcam full redesign preview",
  description: "Full photo-first Guestcam homepage redesign preview.",
  robots: { index: false, follow: false },
};

export default async function GuestcamCamlovePreviewPage() {
  let signedIn = false;
  try {
    const session = await auth();
    signedIn = !!session.userId;
  } catch {}

  return <GuestcamCamloveHomepage lang="sl" signedIn={signedIn} />;
}
