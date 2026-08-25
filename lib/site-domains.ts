export const PRIMARY_GUESTCAM_ORIGIN = "https://www.guestcam.si";
export const SPANISH_GUESTCAM_ORIGIN = "https://guestcam.es";

// Both hosts are treated as official Guestcam routing hosts so a request is
// never mistaken for a customer's custom album domain. Vercel redirects the
// www host to the bare production domain before the app normally sees it.
const SPANISH_ROUTING_HOSTS = new Set(["guestcam.es", "www.guestcam.es"]);

export function normalizedHostname(hostname: string): string {
  return hostname.split(":")[0].trim().toLowerCase();
}

export function isSpanishGuestcamHost(hostname: string): boolean {
  return SPANISH_ROUTING_HOSTS.has(normalizedHostname(hostname));
}

// Clerk satellite billing/configuration is attached only to the verified bare
// domain. www.guestcam.es is only a Vercel 308 redirect and must not be treated
// as a second Clerk satellite domain.
export function isSpanishGuestcamSatelliteHost(hostname: string): boolean {
  return normalizedHostname(hostname) === "guestcam.es";
}
