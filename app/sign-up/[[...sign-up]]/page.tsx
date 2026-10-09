import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { safeAccountReturnPath } from "@/lib/urls";
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

  // An album or paid plan was selected before registration. After account
  // creation go back to that exact flow, not to a generic dashboard page.
  const afterAuth = safeAccountReturnPath(params.redirect_url);
  const requestedLang = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const lang = ["sl", "hr", "sr", "en", "de", "es"].includes(requestedLang ?? "")
    ? requestedLang!
    : "sl";
  const signInParams = new URLSearchParams({ lang, redirect_url: afterAuth });
  const signInUrl = `/sign-in?${signInParams.toString()}`;

  const copy: Record<string, { heading: string; subtitle: string; existing: string; login: string }> = {
    sl: { heading: "Ustvarite svoj račun", subtitle: "Registrirajte se in ustvarite svojo prvo galerijo.", existing: "Že imate račun?", login: "Prijavite se" },
    hr: { heading: "Izradite svoj račun", subtitle: "Registrirajte se i izradite svoju prvu galeriju.", existing: "Već imate račun?", login: "Prijavite se" },
    sr: { heading: "Napravite svoj nalog", subtitle: "Registrujte se i napravite svoju prvu galeriju.", existing: "Već imate nalog?", login: "Prijavite se" },
    en: { heading: "Create your account", subtitle: "Sign up to create your first photo gallery.", existing: "Already have an account?", login: "Sign in" },
    de: { heading: "Konto erstellen", subtitle: "Registrieren Sie sich und erstellen Sie Ihre erste Galerie.", existing: "Sie haben bereits ein Konto?", login: "Anmelden" },
    es: { heading: "Crea tu cuenta", subtitle: "Regístrate y crea tu primera galería.", existing: "¿Ya tienes una cuenta?", login: "Inicia sesión" },
  };
  const t = copy[lang];

  return (
    <main className="min-h-screen bg-[#F2F4F8] flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        <header className="mb-6 flex flex-col items-center gap-2 text-center">
          <GuestcamLogo size="md" showMark={true} />
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0F1729] sm:text-3xl">{t.heading}</h1>
          <p className="max-w-sm text-sm leading-6 text-gray-600 sm:text-base">{t.subtitle}</p>
        </header>

        {/* New visitors see registration first, large and prominent. */}
        <div className="rounded-[28px] border border-[#C9820A]/20 bg-white p-2 shadow-[0_18px_60px_rgba(15,23,41,.09)] sm:p-3">
          <SignUp
            unsafeMetadata={{ guestcamAttribution: signupSource }}
            forceRedirectUrl={afterAuth}
            fallbackRedirectUrl="/dashboard"
            signInUrl={signInUrl}
            signInForceRedirectUrl={afterAuth}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full !max-w-none !rounded-[22px] !border-0 !shadow-none bg-white",
                headerTitle: "text-[#0F1729] font-bold",
                formButtonPrimary: "bg-[#0F1729] hover:bg-[#C9820A] transition-colors rounded-xl",
                footerAction: "hidden",
                footerActionLink: "text-[#C9820A] hover:text-[#152C66]",
              },
            }}
          />
        </div>

        {/* Existing customers can still sign in, but it isn't the main CTA. */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm shadow-sm">
          <span className="text-gray-600">{t.existing}</span>
          <Link href={signInUrl} className="font-bold text-[#915A00] underline underline-offset-4 hover:text-[#0F1729]">
            {t.login} →
          </Link>
        </div>
      </div>
    </main>
  );
}
