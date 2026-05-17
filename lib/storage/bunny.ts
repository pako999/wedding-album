// ── Web Crypto helper (works in Node.js 18+ and Edge runtime) ────────────────

/** SHA-256 hex digest — no Node.js `crypto` import needed. */
async function sha256hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Bunny Storage ─────────────────────────────────────────────────────────────

const storageApiKey  = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone    = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
// Pull zone CDN hostname — frfr1 is the pull zone linked to the frank1 storage zone.
// Override with BUNNY_CDN_URL env var if the hostname changes.
const cdnUrl         = () =>
  process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

// ── Bunny Stream ──────────────────────────────────────────────────────────────

const streamApiKey   = () => process.env.BUNNY_STREAM_API_KEY ?? "";
const streamLibrary  = () => process.env.BUNNY_STREAM_LIBRARY_ID ?? "";
const streamCdnUrl   = () => process.env.BUNNY_STREAM_CDN_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────

export function isBunnyStorageConfigured(): boolean {
  return !!(process.env.BUNNY_STORAGE_API_KEY && process.env.BUNNY_STORAGE_ZONE);
}

export function isBunnyStreamConfigured(): boolean {
  return !!(process.env.BUNNY_STREAM_API_KEY && process.env.BUNNY_STREAM_LIBRARY_ID);
}

// ── Storage: stream-proxy upload ─────────────────────────────────────────────

/**
 * Upload a file to Bunny Storage by streaming the body directly.
 * No server-side buffering — the Edge runtime proxy passes bytes straight through.
 *
 * `body` is the raw `ReadableStream` from `req.body`.
 * Returns the public CDN URL.
 */
export async function uploadToBunnyStorage(
  body: ReadableStream,
  key: string,
  contentType: string,
): Promise<string> {
  const endpoint = `https://storage.bunnycdn.com/${storageZone()}/${key}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: storageApiKey(),
      "Content-Type": contentType,
    },
    body: body as BodyInit,
    // duplex:"half" is required in Node.js 18+ undici for streaming request bodies.
    // It is a no-op / silently ignored in Edge (browser-like) environments.
    // @ts-expect-error — not present in all TypeScript lib versions
    duplex: "half",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Bunny Storage upload failed (${res.status}): ${msg}`);
  }

  return `${cdnUrl()}/${key}`;
}

// ── Stream: create video + tus credentials ────────────────────────────────────

export interface BunnyStreamUpload {
  videoId: string;
  uploadUrl: string;
  signature: string;
  expiration: number;
  libraryId: string;
}

/**
 * Create a Bunny Stream video record and return tus upload credentials.
 * The browser then uploads directly to Bunny using `tus-js-client`.
 */
export async function createBunnyStreamUpload(title: string): Promise<BunnyStreamUpload> {
  const libraryId = streamLibrary();
  if (!libraryId) throw new Error("BUNNY_STREAM_LIBRARY_ID not configured");

  // 1. Create the video record
  const createRes = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: streamApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    },
  );
  if (!createRes.ok) {
    throw new Error(
      `Bunny Stream create failed: ${createRes.status} ${await createRes.text()}`,
    );
  }
  const { guid: videoId } = (await createRes.json()) as { guid: string };

  // 2. Generate tus auth: SHA-256(libraryId + apiKey + expiration + videoId)
  //    Uses Web Crypto — works in both Node.js 18+ and Edge runtime.
  const expiration = Math.floor(Date.now() / 1000) + 3600; // 1 h
  const hashInput  = `${libraryId}${streamApiKey()}${expiration}${videoId}`;
  const signature  = await sha256hex(hashInput);

  return {
    videoId,
    uploadUrl: "https://video.bunnycdn.com/tusupload",
    signature,
    expiration,
    libraryId,
  };
}

// ── Stream: URL helpers ───────────────────────────────────────────────────────

export function bunnyStreamThumbnailUrl(videoId: string): string | undefined {
  const cdn = streamCdnUrl();
  return cdn ? `${cdn}/${videoId}/thumbnail.jpg` : undefined;
}

/**
 * Embed-player iframe URL for Bunny Stream.
 * Stored in `photos.blob_url` so the player works without knowing the library ID at render time.
 */
export function bunnyStreamIframeUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${streamLibrary()}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
}
