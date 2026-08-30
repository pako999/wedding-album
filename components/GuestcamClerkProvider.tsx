import type { ComponentProps, ReactNode } from "react";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import {
  PRIMARY_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
  isSerbianGuestcamHost,
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

  // guestcam.rs is marketing-only. Do not boot Clerk on that origin and do
  // not register it as a satellite domain; its auth/account links are
  // redirected by proxy.ts to the existing www.guestcam.si Clerk flow.
  if (isSerbianGuestcamHost(host)) {
    return <>{children}</>;
  }

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
