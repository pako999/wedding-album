import {
  countryPublicPath,
  serbianGuestcamUrl,
  spanishGuestcamUrl,
} from "@/lib/site-domains";

/**
 * Canonical URL constants.
 *
 * IMPORTANT: `guestcam.si` (bare host) 307-redirects to `www.guestcam.si`
 * on Vercel. All indexable URLs — canonical <link> tags, sitemap entries,
 * hreflang alternates, OG image src, JSON-LD schemas, email deep links,
 * outbound links to our own domain — MUST use the www.-prefixed form.
 * If you hardcode "https://guestcam.si" instead of using SITE_URL you
 * WILL create redirects the Semrush audit flagged in July 2026.
 *
 * Prefer `SITE_URL` here over duplicating string constants across pages.
 * The value is env-overridable so a staging deploy or preview branch
 * can point its canonicals at itself without touching source.
 */

/** Canonical host with protocol, no trailing slash. Read from env when
 *  available so preview deploys canonicalize to themselves; the fallback
 *  is production. */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.guestcam.si";

/** Convenience: the origin without protocol, e.g. "www.guestcam.si". Used
 *  for HTML lang alt attributes and structured-data host fields. */
export const SITE_HOST: string = new URL(SITE_URL).host;

const SUPPORTED_LOCALES = new Set(["sl", "hr", "sr", "de", "en", "es"]);

/** Build an absolute URL for a path. Guarantees exactly one leading slash
 *  and never returns a bare-host redirect target. */
export function absoluteUrl(path: string = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

/** Remove internal /sr or /es route prefixes from country-domain public URLs. */
export function localePublicPath(locale: string, path: string = "/"): string {
  if (locale === "sr" || locale === "es") {
    return countryPublicPath(locale, path);
  }
  return path.startsWith("/") ? path : `/${path}`;
}

/** Build the canonical public URL for a localized route. Serbian and Spanish
 * marketing pages live on their ccTLDs; every account/app route stays on .si. */
export function localeAbsoluteUrl(locale: string, path: string = "/"): string {
  if (locale === "sr") return serbianGuestcamUrl(path);
  if (locale === "es") return spanishGuestcamUrl(path);
  return absoluteUrl(path);
}

/**
 * Keep the visitor's chosen language when a marketing page enters an account
 * surface. Account routes deliberately live on guestcam.si, including for the
 * Serbian and Spanish country sites, so the locale must travel explicitly in
 * the query string. This also survives refreshes, direct visits and opening a
 * CTA in a new tab where the Referer header may be absent.
 */
export function localizedAccountPath(locale: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!SUPPORTED_LOCALES.has(locale)) return normalizedPath;

  const hashIndex = normalizedPath.indexOf("#");
  const hash = hashIndex >= 0 ? normalizedPath.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? normalizedPath.slice(0, hashIndex) : normalizedPath;
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const params = new URLSearchParams(queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "");
  params.set("lang", locale);
  return `${pathname}?${params.toString()}${hash}`;
}
