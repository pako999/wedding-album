import { SignIn } from "@clerk/nextjs";
import { safeAccountReturnPath } from "@/lib/urls";
import type { Metadata } from "next";
import { GuestcamLogo } from "@/components/GuestcamLogo";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const afterAuth = safeAccountReturnPath(params.redirect_url);
  const requestedLang = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const query = new URLSearchParams({ redirect_url: afterAuth });
  if (requestedLang && ["sl", "hr", "sr", "de", "en", "es"].includes(requestedLang)) {
    query.set("lang", requestedLang);
  }
  const signUpUrl = `/sign-up?${query.toString()}`;

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <GuestcamLogo size="md" showMark={true} />
          <p className="text-sm text-gray-600">Prijavite se za dostop do vaših albumov</p>
        </div>
        <SignIn
          forceRedirectUrl={afterAuth}
          fallbackRedirectUrl="/dashboard"
          signUpUrl={signUpUrl}
          signUpForceRedirectUrl={afterAuth}
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
