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

// ── URL helpers for display vs. download ──────────────────────────────────────

/**
 * Extracts the Bunny Storage object key from a stored blobUrl.
 *
 * Handles three forms:
 *   • CDN URL  → "https://frfr1.b-cdn.net/albums/slug/file.jpg"  → "albums/slug/file.jpg"
 *   • Proxy URL → "/api/img?key=albums%2Fslug%2Ffile.jpg"         → "albums/slug/file.jpg"
 *   • Raw key   → "albums/slug/file.jpg"                          → "albums/slug/file.jpg"
 *
 * Returns null for URLs that don't belong to Bunny Storage.
 */
function extractBunnyKey(url: string): string | null {
  try {
    // Already a proxy URL — extract key param
    if (url.includes("/api/img")) {
      const u = new URL(url, "http://localhost");
      return u.searchParams.get("key");
    }
    // Bunny CDN URL
    if (url.includes(".b-cdn.net")) {
      const u = new URL(url);
      // pathname is "/albums/…" — remove leading slash
      return u.pathname.replace(/^\//, "");
    }
    // Looks like a bare storage key already (starts with "albums/")
    if (url.startsWith("albums/")) {
      return url.split("?")[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns a proxy URL that fetches the image through /api/img.
 *
 * The proxy pulls the file directly from Bunny Storage using the API key,
 * bypassing the CDN Pull Zone entirely.  Vercel's CDN + browser both cache
 * the response (Cache-Control: immutable) so per-request cost is minimal.
 *
 * The `width` / `quality` params are accepted for API compatibility but are
 * no-ops until server-side resizing is wired up — the full-quality file is
 * always returned.
 *
 * Non-Bunny URLs (e.g. Vercel Blob) are returned unchanged.
 */
export function bunnyDisplayUrl(
  url: string | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _width = 800,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _quality = 82,
): string {
  if (!url) return "";
  const key = extractBunnyKey(url);
  if (!key) return url; // Non-Bunny URL — return as-is
  return `/api/img?key=${encodeURIComponent(key)}`;
}

/**
 * Returns a proxy URL for the original full-quality file.
 * Use this for ZIP downloads, Google Drive exports, and any server-side fetch.
 *
 * Non-Bunny URLs are returned with query params stripped.
 */
export function bunnyOriginalUrl(url: string | null | undefined): string {
  if (!url) return "";
  const key = extractBunnyKey(url);
  if (!key) return url.split("?")[0]; // Non-Bunny URL — strip params and return
  return `/api/img?key=${encodeURIComponent(key)}`;
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

// ── Storage: delete a file ────────────────────────────────────────────────────

/**
 * Delete a file from Bunny Storage by its blobUrl (CDN URL, proxy URL, or raw key).
 * Returns true if deleted (or already gone), false if Bunny isn't configured.
 */
export async function deleteBunnyFile(blobUrl: string): Promise<boolean> {
  if (!isBunnyStorageConfigured()) return false;
  const key = extractBunnyKey(blobUrl);
  if (!key) return false;
  const endpoint = `https://storage.bunnycdn.com/${storageZone()}/${key}`;
  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: { AccessKey: storageApiKey() },
  });
  return res.ok || res.status === 404;
}

/**
 * Delete a video from Bunny Stream by its videoId.
 */
export async function deleteBunnyStreamVideo(videoId: string): Promise<boolean> {
  if (!isBunnyStreamConfigured()) return false;
  const libraryId = streamLibrary();
  const res = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
    { method: "DELETE", headers: { AccessKey: streamApiKey() } },
  );
  return res.ok || res.status === 404;
}

// ── Stream: URL helpers ───────────────────────────────────────────────────────

export function bunnyStreamThumbnailUrl(videoId: string): string | undefined {
  const cdn = streamCdnUrl();
  return cdn ? `${cdn}/${videoId}/thumbnail.jpg` : undefined;
}

// ── Stream: video metadata + best-available MP4 picker ────────────────────────

/**
 * Subset of fields we care about from GET /library/<lib>/videos/<id>.
 * `availableResolutions` is a CSV like "240p,360p,480p,720p" — only the
 * resolutions Bunny actually transcoded. `length` is in seconds.
 */
export interface BunnyStreamVideoMeta {
  guid: string;
  status: number;                  // 4 = ready
  availableResolutions: string;    // CSV
  length: number;                  // seconds
  mp4Fallback?: boolean;           // present on newer accounts
}

/** Fetch one Bunny Stream video's metadata. Returns null on any error. */
export async function getBunnyStreamVideo(
  videoId: string,
): Promise<BunnyStreamVideoMeta | null> {
  const libraryId = streamLibrary();
  if (!libraryId || !streamApiKey()) return null;
  try {
    const res = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      { headers: { AccessKey: streamApiKey() }, cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as BunnyStreamVideoMeta;
  } catch {
    return null;
  }
}

/**
 * Pick the highest-resolution MP4 the video has actually been transcoded
 * to. Bunny only generates `play_<res>.mp4` files for resolutions listed
 * in availableResolutions (and only if MP4 Fallback is on in the
 * library), so blindly asking for 720p 404s on a low-res phone clip OR
 * on libraries where MP4 Fallback is off.
 *
 * Returns the CDN URL when the configured BUNNY_STREAM_CDN_URL is set,
 * or null when we can't safely build one (caller should fall back to
 * the authenticated /api/.../video-download proxy in that case).
 */
const RES_ORDER = ["1080p", "720p", "480p", "360p", "240p"];

export function pickBestMp4Url(
  videoId: string,
  availableResolutions: string,
): { url: string; res: string } | null {
  const cdn = streamCdnUrl().replace(/\/+$/, "");
  if (!cdn) return null;
  const present = new Set(
    availableResolutions.split(",").map((s) => s.trim()).filter(Boolean),
  );
  const chosen = RES_ORDER.find((r) => present.has(r));
  if (!chosen) return null;
  return { url: `${cdn}/${videoId}/play_${chosen}.mp4`, res: chosen };
}

/**
 * Embed-player iframe URL for Bunny Stream.
 * Stored in `photos.blob_url` so the player works without knowing the library ID at render time.
 */
export function bunnyStreamIframeUrl(videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${streamLibrary()}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
}
