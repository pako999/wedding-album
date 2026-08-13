/**
 * Canonical URL constants.
 *
 * IMPORTANT: `camlove.me` (bare host) 307-redirects to `www.camlove.me`
 * on Vercel. All indexable URLs — canonical <link> tags, sitemap entries,
 * hreflang alternates, OG image src, JSON-LD schemas, email deep links,
 * outbound links to our own domain — MUST use the www.-prefixed form.
 * If you hardcode "https://camlove.me" instead of using SITE_URL you
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
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://www.camlove.me";

/** Convenience: the origin without protocol, e.g. "www.camlove.me". Used
 *  for HTML lang alt attributes and structured-data host fields. */
export const SITE_HOST: string = new URL(SITE_URL).host;

/** Build an absolute URL for a path. Guarantees exactly one leading slash
 *  and never returns a bare-host redirect target. */
export function absoluteUrl(path: string = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
