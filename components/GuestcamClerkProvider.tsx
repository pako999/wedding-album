import type { ComponentProps, ReactNode } from "react";
import { headers } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import {
  isCountryMarketingHost,
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

  // Country domains are marketing-only. Do not boot Clerk on either origin
  // and do not register them as satellite domains. proxy.ts sends every
  // auth/account action to the existing www.guestcam.si Clerk flow.
  if (isCountryMarketingHost(host)) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      localization={localization}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
