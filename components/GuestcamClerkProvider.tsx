import type { ComponentProps, ReactNode } from "react";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import {
  PRIMARY_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
  isSpanishGuestcamSatelliteHost,
  normalizedHostname,
} from "@/lib/site-domains";

type Localization = ComponentProps<typeof ClerkProvider>["localization"];

export async function GuestcamClerkProvider({
  children,
  localization,
}: {
  children: ReactNode;
  localization: Localization;
}) {
  const h = await headers();
  const host = normalizedHostname(
    h.get("x-forwarded-host") ?? h.get("host") ?? "www.guestcam.si",
  );
  const satellite = isSpanishGuestcamSatelliteHost(host);

  if (satellite) {
    return (
      <ClerkProvider
        localization={localization}
        isSatellite
        domain="guestcam.es"
        signInUrl={`${PRIMARY_GUESTCAM_ORIGIN}/sign-in`}
        signUpUrl={`${PRIMARY_GUESTCAM_ORIGIN}/sign-up`}
        satelliteAutoSync
      >
        {children}
      </ClerkProvider>
    );
  }

  return (
    <ClerkProvider
      localization={localization}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      allowedRedirectOrigins={[SPANISH_GUESTCAM_ORIGIN]}
    >
      {children}
    </ClerkProvider>
  );
}
