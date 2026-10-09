import { SignIn } from "@clerk/nextjs";
import { safeAccountReturnPath } from "@/lib/urls";
import type { Metadata } from "next";

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
    <main className="flex min-h-[100svh] items-center justify-center bg-[#F2F4F8] px-4 py-8 sm:py-12">
      {/* Match the registration page: one centered Clerk card, one title and
          one built-in link to the complementary authentication flow. */}
      <div className="mx-auto flex w-full max-w-[460px] min-w-0 justify-center">
        <SignIn
          forceRedirectUrl={afterAuth}
          fallbackRedirectUrl="/dashboard"
          signUpUrl={signUpUrl}
          signUpForceRedirectUrl={afterAuth}
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
