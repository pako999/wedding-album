import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import type { LangCode } from "@/components/LanguageSwitcher";

/**
 * Auth-aware header buttons used on every public site header.
 *
 * Signed-out users use Clerk's SignInButton instead of a hardcoded /sign-in
 * link. That matters for guestcam.es: Clerk's satellite flow must build the
 * primary-domain sign-in URL and append its session-sync parameters before
 * returning the user to the Spanish domain.
 */
const LABELS: Record<LangCode, {
  login: string;
  dashboard: string;
}> = {
  sl: { login: "Prijava",        dashboard: "Nadzorna plošča" },
  hr: { login: "Prijava",        dashboard: "Nadzorna ploča"  },
  sr: { login: "Prijava",        dashboard: "Kontrolna tabla" },
  de: { login: "Anmelden",       dashboard: "Dashboard"       },
  en: { login: "Sign in",        dashboard: "Dashboard"       },
  es: { login: "Iniciar sesión", dashboard: "Panel"           },
};

interface Props {
  lang: LangCode;
  linkClassName?: string;
}

const DEFAULT_LINK_CLASS =
  "hidden sm:inline text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors";

export async function HeaderAuthButtons({
  lang,
  linkClassName = DEFAULT_LINK_CLASS,
}: Props) {
  const t = LABELS[lang];

  let signedIn = false;
  try {
    const session = await auth();
    signedIn = !!session.userId;
  } catch {
    // Clerk hiccup → treat as signed-out and let the user retry.
  }

  if (!signedIn) {
    return (
      <SignInButton mode="redirect">
        <button type="button" className={linkClassName}>
          {t.login}
        </button>
      </SignInButton>
    );
  }

  return (
    <>
      <Link href="/dashboard" className={linkClassName}>
        {t.dashboard}
      </Link>
      <UserButton
        appearance={{ elements: { userButtonAvatarBox: { width: 30, height: 30 } } }}
      />
    </>
  );
}
