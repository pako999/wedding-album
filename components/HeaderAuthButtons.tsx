import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import type { LangCode } from "@/components/LanguageSwitcher";
import { DemoButton } from "@/components/DemoButton";

const LABELS: Record<LangCode, { login: string; dashboard: string }> = {
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
  /** Optional server-resolved state for headers that already called auth(). */
  signedIn?: boolean;
}

const DEFAULT_LINK_CLASS =
  "hidden sm:inline text-sm font-medium text-gray-600 hover:text-[#0F1729] transition-colors";

export async function HeaderAuthButtons({
  lang,
  linkClassName = DEFAULT_LINK_CLASS,
  signedIn: resolvedSignedIn,
}: Props) {
  const t = LABELS[lang];
  let signedIn = resolvedSignedIn ?? false;

  if (resolvedSignedIn === undefined) {
    try {
      const session = await auth();
      signedIn = !!session.userId;
    } catch {
      signedIn = false;
    }
  }

  // Every localized homepage keeps its redesigned visual button as a normal
  // /demo link. This invisible bridge opens the localized QR/demo modal in
  // place instead of navigating to a locale route that does not exist.
  const demoBridge = <DemoButton variant="bridge" lang={lang} />;

  if (!signedIn) {
    return <>{demoBridge}<Link href="/sign-in" className={linkClassName}>{t.login}</Link></>;
  }

  return (
    <>
      {demoBridge}
      <Link href="/dashboard" className={linkClassName}>{t.dashboard}</Link>
      <UserButton appearance={{ elements: { userButtonAvatarBox: { width: 30, height: 30 } } }} />
    </>
  );
}
