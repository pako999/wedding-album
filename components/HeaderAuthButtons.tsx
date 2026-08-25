import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import type { LangCode } from "@/components/LanguageSwitcher";

/**
 * Auth-aware header buttons used on every public site header (homepage,
 * locale homepages, SEO landings, legal pages, mobile menu).
 *
 * Server component — calls Clerk's `auth()` to know whether the
 * visitor is signed in, then renders one of two branches:
 *
 *   • Signed out → "Prijava / Sign in / Anmelden / …" link.
 *   • Signed in  → "Nadzorna plošča / Dashboard / Panel / …" link +
 *                  Clerk's <UserButton/> avatar (popover has the
 *                  "Manage account" + "Sign out" menu).
 *
 * Using `auth()` server-side avoids the brief flash you'd get with
 * a client-side `<Show when="signed-in">` while Clerk boots — the
 * server already knows the auth state at render time.
 *
 * <UserButton> itself is a client component; Next.js handles the
 * server/client boundary automatically when it's rendered from a
 * server component like this one.
 */

const LABELS: Record<LangCode, {
  /** Anchor text when the visitor is signed out — links to /sign-in. */
  login: string;
  /** Anchor text when signed in — links to /dashboard. */
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
  /** Tailwind classes for the *text link* (Prijava / Nadzorna plošča).
   *  Defaults to the small grey link style used in the desktop nav.
   *  Pass a different value for the mobile sheet (full-width row). */
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
      <Link href="/sign-in" className={linkClassName}>
        {t.login}
      </Link>
    );
  }

  return (
    <>
      <Link href="/dashboard" className={linkClassName}>
        {t.dashboard}
      </Link>
      {/* UserButton: avatar + popover with Manage account / Sign out.
          Sized down a touch so it sits visually balanced next to the
          link + primary CTA. Sign-out destination is configured at
          the ClerkProvider in app/layout.tsx (Clerk 7+ removed the
          per-button afterSignOutUrl prop). */}
      <UserButton
        appearance={{ elements: { userButtonAvatarBox: { width: 30, height: 30 } } }}
      />
    </>
  );
}
