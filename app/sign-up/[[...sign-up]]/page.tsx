import { SignUp } from "@clerk/nextjs";
import { safeAccountReturnPath } from "@/lib/urls";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AFFILIATE_COOKIE } from "@/lib/affiliate/attribution";
import {
  SIGNUP_ATTR_COOKIE,
  SIGNUP_SOURCE_PARAM,
  buildSignupSourceSnapshot,
  parseAttr,
  parseSignupSourceParam,
} from "@/lib/attribution/signup";
import { GUEST_REF_COOKIE } from "@/lib/referral/attribution";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const transferredValue = params[SIGNUP_SOURCE_PARAM];
  const transferredSource = parseSignupSourceParam(
    Array.isArray(transferredValue) ? transferredValue[0] : transferredValue,
  );
  const jar = await cookies();
  const localSource = buildSignupSourceSnapshot(
    parseAttr(jar.get(SIGNUP_ATTR_COOKIE)?.value),
    {
      affiliateRef: jar.get(AFFILIATE_COOKIE)?.value,
      referralCode: jar.get(GUEST_REF_COOKIE)?.value,
      appHost: "guestcam.si",
      siteHost: "guestcam.si",
    },
  );
  // A country-domain bridge wins over an older .si cookie. This preserves the
  // actual Serbian/Spanish acquisition source despite cross-domain isolation.
  const signupSource = transferredSource ?? localSource;

  // An album or paid plan was selected before registration. After account
  // creation go back to that exact flow, not to a generic dashboard page.
  const afterAuth = safeAccountReturnPath(params.redirect_url);
  const requestedLang = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const lang = ["sl", "hr", "sr", "en", "de", "es"].includes(requestedLang ?? "")
    ? requestedLang!
    : "sl";
  const signInParams = new URLSearchParams({ lang, redirect_url: afterAuth });
  const signInUrl = `/sign-in?${signInParams.toString()}`;

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F2F4F8] px-4 py-8 sm:py-12">
      {/* Clerk owns ONE complete centered card, including its built-in
          "Already have an account? Sign in" link. No duplicate wrapper,
          separate footer link, or second brand/title block. */}
      <div className="mx-auto flex w-full max-w-[460px] min-w-0 justify-center">
        <SignUp
          unsafeMetadata={{ guestcamAttribution: signupSource }}
          forceRedirectUrl={afterAuth}
          fallbackRedirectUrl="/dashboard"
          signInUrl={signInUrl}
          signInForceRedirectUrl={afterAuth}
          appearance={{
            variables: {
              colorPrimary: "#0F1729",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "flex w-full min-w-0 justify-center",
              cardBox: "mx-auto w-full min-w-0 max-w-full",
              card: "w-full min-w-0 overflow-hidden rounded-[22px] border border-[#E4E6EC] bg-white shadow-[0_18px_50px_rgba(15,23,41,0.10)]",
              headerTitle: "font-bold text-[#0F1729]",
              headerSubtitle: "text-[#596579]",
              formFieldInput: "rounded-xl border-gray-200",
              formButtonPrimary: "rounded-xl bg-[#0F1729] text-white transition-colors hover:bg-[#C9820A]",
              footerActionLink: "font-semibold text-[#976100] hover:text-[#0F1729]",
            },
          }}
        />
      </div>
    </main>
  );
}
