export const PRIMARY_HOST = "www.guestcam.si";
export const PRIMARY_ORIGIN = `https://${PRIMARY_HOST}`;

export const SPANISH_HOST = "guestcam.es";
export const SPANISH_ORIGIN = `https://${SPANISH_HOST}`;

export function hostnameOnly(host: string | null | undefined): string {
  return (host ?? "").split(":")[0].toLowerCase();
}

export function isSpanishHost(host: string | null | undefined): boolean {
  return hostnameOnly(host) === SPANISH_HOST;
}
