import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived token used only for guest video playback through our same-origin
 * proxy. Re-use the already configured Bunny Stream API key as a server-only
 * signing secret so this fix does not require a new production environment
 * variable. The key itself never leaves the server.
 */
function playbackSecret(): string {
  return process.env.BUNNY_STREAM_API_KEY ?? "";
}

function payload(slug: string, videoId: string, expiresAt: number): string {
  return `${slug}:${videoId}:${expiresAt}`;
}

export function createVideoPlaybackToken(
  slug: string,
  videoId: string,
  expiresAt: number,
): string | null {
  const secret = playbackSecret();
  if (!secret) return null;
  return createHmac("sha256", secret)
    .update(payload(slug, videoId, expiresAt))
    .digest("base64url");
}

export function verifyVideoPlaybackToken(
  slug: string,
  videoId: string,
  expiresAt: number,
  token: string,
): boolean {
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  // Do not accept arbitrarily long-lived guest playback links even if a caller
  // somehow obtains a valid signed URL. The gallery generates 2-hour tokens.
  if (expiresAt > Math.floor(Date.now() / 1000) + 3 * 60 * 60) return false;

  const expected = createVideoPlaybackToken(slug, videoId, expiresAt);
  if (!expected) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
