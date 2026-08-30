export const PRIMARY_GUESTCAM_ORIGIN = "https://www.guestcam.si";
export const SPANISH_GUESTCAM_ORIGIN = "https://guestcam.es";
export const SERBIAN_GUESTCAM_ORIGIN = "https://www.guestcam.rs";

// Both hosts are treated as official Guestcam routing hosts so a request is
// never mistaken for a customer's custom album domain. Vercel redirects the
// www host to the bare production domain before the app normally sees it.
const SPANISH_ROUTING_HOSTS = new Set(["guestcam.es", "www.guestcam.es"]);
const SERBIAN_ROUTING_HOSTS = new Set(["guestcam.rs", "www.guestcam.rs"]);

export function normalizedHostname(hostname: string): string {
  return hostname.split(":")[0].trim().toLowerCase();
}

export function isSpanishGuestcamHost(hostname: string): boolean {
  return SPANISH_ROUTING_HOSTS.has(normalizedHostname(hostname));
}

/**
 * guestcam.rs and guestcam.es are marketing/SEO hosts only. They deliberately
 * are not Clerk satellite domains: account creation and every authenticated
 * surface remain on the primary www.guestcam.si application.
 */
export function isSerbianGuestcamHost(hostname: string): boolean {
  return SERBIAN_ROUTING_HOSTS.has(normalizedHostname(hostname));
}

export function isPrimaryGuestcamHost(hostname: string): boolean {
  const host = normalizedHostname(hostname);
  return host === "guestcam.si" || host === "www.guestcam.si";
}

export function isCountryMarketingHost(hostname: string): boolean {
  return isSpanishGuestcamHost(hostname) || isSerbianGuestcamHost(hostname);
}

/** Strip the internal App Router locale prefix from a public country URL. */
export function countryPublicPath(locale: "sr" | "es", pathname = "/"): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const prefix = `/${locale}`;
  if (normalizedPath === prefix) return "/";
  if (normalizedPath.startsWith(`${prefix}/`)) {
    return normalizedPath.slice(prefix.length) || "/";
  }
  return normalizedPath;
}

/** Public Serbian URL for canonical, hreflang and sitemap output. */
export function serbianGuestcamUrl(pathname = "/"): string {
  return `${SERBIAN_GUESTCAM_ORIGIN}${countryPublicPath("sr", pathname)}`;
}

/** Public Spanish URL for canonical, hreflang and sitemap output. */
export function spanishGuestcamUrl(pathname = "/"): string {
  return `${SPANISH_GUESTCAM_ORIGIN}${countryPublicPath("es", pathname)}`;
}
