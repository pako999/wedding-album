/**
 * Cloudflare Stream — managed video hosting with encoding, thumbnails, HLS.
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_STREAM_TOKEN   ← API token with Stream:Edit permission
 *
 * Flow:
 *   1. Server calls createStreamDirectUpload() → gets { uploadUrl, videoId }
 *   2. Client uploads video via tus to uploadUrl (tus-js-client)
 *   3. Client saves videoId to DB via /save-upload endpoint
 *   4. Stream auto-encodes, generates thumbnail, creates HLS manifest
 */

const CF_API = "https://api.cloudflare.com/client/v4";

export function isStreamConfigured(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_STREAM_TOKEN
  );
}

export interface StreamDirectUpload {
  uploadUrl: string;   // tus endpoint — client POSTs video here
  videoId: string;     // uid — save to DB, use to build playback URLs
}

/**
 * Create a one-time direct upload URL for Cloudflare Stream.
 * Valid for 30 minutes; the client uses tus to upload.
 */
export async function createStreamDirectUpload(opts?: {
  maxDurationSeconds?: number;
}): Promise<StreamDirectUpload> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN!;

  const res = await fetch(
    `${CF_API}/accounts/${accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: opts?.maxDurationSeconds ?? 3600, // 1 hour max
        requireSignedURLs: false,
        allowedOrigins: ["*"],
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudflare Stream API error ${res.status}: ${body}`);
  }

  const json = await res.json() as {
    success: boolean;
    result: { uid: string; uploadURL: string };
  };

  if (!json.success) throw new Error("Stream direct upload creation failed");

  return {
    uploadUrl: json.result.uploadURL,
    videoId: json.result.uid,
  };
}

/** Delete a video from Cloudflare Stream. */
export async function deleteStreamVideo(videoId: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN!;

  await fetch(`${CF_API}/accounts/${accountId}/stream/${videoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── URL helpers ───────────────────────────────────────────────────────────────

/** Thumbnail image URL for a Stream video (auto-generated at first frame). */
export function streamThumbnailUrl(videoId: string, time = "1s"): string {
  return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=${time}&height=400`;
}

/** HLS manifest URL (for native <video> on iOS/Safari). */
export function streamHlsUrl(videoId: string): string {
  return `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
}

/** Iframe embed URL — works everywhere, no extra libs needed. */
export function streamIframeUrl(videoId: string): string {
  return `https://iframe.videodelivery.net/${videoId}?poster=${encodeURIComponent(streamThumbnailUrl(videoId))}&controls=true&autoplay=false&loop=false&muted=false`;
}
