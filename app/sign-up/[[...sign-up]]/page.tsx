import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { GuestcamLogo } from "@/components/GuestcamLogo";
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

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <GuestcamLogo size="md" showMark={true} />
          <p className="text-sm text-gray-600">Ustvarite račun in začnite zbirati spomine</p>
        </div>
        <SignUp
          unsafeMetadata={{ guestcamAttribution: signupSource }}
          fallbackRedirectUrl="/dashboard"
          signInUrl="/sign-in"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-md rounded-2xl border border-[#C9820A]/15 bg-white",
              headerTitle: "font-serif text-[#0F1729]",
              formButtonPrimary: "bg-[#0F1729] hover:bg-[#C9820A] transition-colors rounded-xl",
              footerActionLink: "text-[#C9820A] hover:text-[#152C66]",
            },
          }}
        />
      </div>
    </div>
  );
}
