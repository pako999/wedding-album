import type { ComponentProps, ReactNode } from "react";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import {
  PRIMARY_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
  isSpanishGuestcamHost,
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
  const satellite = isSpanishGuestcamHost(host);

  if (satellite) {
    return (
      <ClerkProvider
        localization={localization}
        isSatellite
        domain={host}
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
      allowedRedirectOrigins={[SPANISH_GUESTCAM_ORIGIN, "https://guestcam.es"]}
    >
      {children}
    </ClerkProvider>
  );
}
