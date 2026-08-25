export const PRIMARY_GUESTCAM_ORIGIN = "https://www.guestcam.si";
export const SPANISH_GUESTCAM_ORIGIN = "https://www.guestcam.es";

const SPANISH_HOSTS = new Set(["guestcam.es", "www.guestcam.es"]);

export function normalizedHostname(hostname: string): string {
  return hostname.split(":")[0].trim().toLowerCase();
}

export function isSpanishGuestcamHost(hostname: string): boolean {
  return SPANISH_HOSTS.has(normalizedHostname(hostname));
}
