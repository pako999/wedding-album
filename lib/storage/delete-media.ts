import { del as deleteVercelBlob } from "@vercel/blob";
import { deleteBunnyFile, deleteBunnyStreamVideo } from "@/lib/storage/bunny";
import { deleteBunnyS3Object } from "@/lib/storage/bunny-s3";
import { deleteR2Object, isR2Configured } from "@/lib/storage/r2";
import { deleteStreamVideo, isStreamConfigured } from "@/lib/storage/stream";

export type DeletedMediaProvider =
  | "bunny-s3"
  | "bunny-storage"
  | "bunny-stream"
  | "cloudflare-r2"
  | "cloudflare-stream"
  | "vercel-blob"
  | "none";

export interface StoredMediaRef {
  blobUrl?: string | null;
  streamVideoId?: string | null;
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value, "https://guestcam.internal");
  } catch {
    return null;
  }
}

function validAlbumsKey(key: string): boolean {
  return (
    key.startsWith("albums/") &&
    !key.includes("..") &&
    !key.includes("\\") &&
    !key.includes("//") &&
    key.length <= 1024
  );
}

function decodePathKey(pathname: string, prefix: string): string | null {
  if (!pathname.startsWith(prefix)) return null;
  try {
    const key = decodeURIComponent(pathname.slice(prefix.length)).replace(/^\/+/, "");
    return validAlbumsKey(key) ? key : null;
  } catch {
    return null;
  }
}

/** Resolve the S3 object key from the stable Guestcam read URL or S3 CDN URL. */
function bunnyS3Key(blobUrl: string): string | null {
  const parsed = safeUrl(blobUrl);
  if (!parsed) return null;

  const internal = decodePathKey(parsed.pathname, "/api/bunny-s3-file/");
  if (internal) return internal;

  const cdn = (process.env.BUNNY_S3_CDN_URL ?? "").trim().replace(/\/+$/, "");
  if (cdn) {
    try {
      const base = new URL(cdn);
      if (parsed.origin === base.origin) {
        const basePath = base.pathname.replace(/\/+$/, "");
        const prefix = `${basePath}/`.replace(/^\/\//, "/");
        const key = decodePathKey(parsed.pathname, prefix);
        if (key) return key;
      }
    } catch {
      // Invalid optional CDN configuration is handled by normal S3 fallback paths.
    }
  }

  const endpoint = (process.env.BUNNY_S3_ENDPOINT ?? "").trim();
  if (endpoint) {
    try {
      const base = new URL(endpoint);
      if (parsed.origin === base.origin) {
        const bucket = (process.env.BUNNY_S3_BUCKET ?? process.env.BUNNY_STORAGE_ZONE ?? "").trim();
        const rawPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
        const key = bucket && rawPath.startsWith(`${bucket}/`)
          ? rawPath.slice(bucket.length + 1)
          : rawPath;
        if (validAlbumsKey(key)) return key;
      }
    } catch {
      // Ignore malformed absolute URLs and let another provider matcher try.
    }
  }

  return null;
}

function r2Key(blobUrl: string): string | null {
  const baseValue = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").trim().replace(/\/+$/, "");
  if (!baseValue) return null;

  try {
    const base = new URL(baseValue);
    const parsed = new URL(blobUrl);
    if (parsed.origin !== base.origin) return null;
    const basePath = base.pathname.replace(/\/+$/, "");
    const prefix = `${basePath}/`.replace(/^\/\//, "/");
    return decodePathKey(parsed.pathname, prefix);
  } catch {
    return null;
  }
}

function isVercelBlobUrl(blobUrl: string): boolean {
  try {
    const parsed = new URL(blobUrl);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function looksLikeLegacyBunny(blobUrl: string): boolean {
  return (
    blobUrl.startsWith("albums/") ||
    blobUrl.includes("/api/img") ||
    blobUrl.includes(".b-cdn.net")
  );
}

function looksLikeCloudflareStream(blobUrl: string | null | undefined): boolean {
  if (!blobUrl) return false;
  try {
    const host = new URL(blobUrl).hostname.toLowerCase();
    return host === "videodelivery.net" || host.endsWith(".videodelivery.net");
  } catch {
    return blobUrl.includes("videodelivery.net");
  }
}

/**
 * Delete the physical object represented by one photos-table row or cover URL.
 *
 * Unknown providers fail closed. Destructive callers must not remove the DB row
 * when this function throws, otherwise Guestcam loses the only reference to an
 * object that still exists in external storage.
 */
export async function deleteStoredMedia(ref: StoredMediaRef): Promise<DeletedMediaProvider> {
  const blobUrl = ref.blobUrl?.trim() || "";
  const streamVideoId = ref.streamVideoId?.trim() || "";

  if (streamVideoId) {
    if (looksLikeCloudflareStream(blobUrl)) {
      if (!isStreamConfigured()) {
        throw new Error("Cloudflare Stream deletion is not configured");
      }
      await deleteStreamVideo(streamVideoId);
      return "cloudflare-stream";
    }

    const deleted = await deleteBunnyStreamVideo(streamVideoId);
    if (!deleted) {
      throw new Error("Bunny Stream deletion failed or is not configured");
    }
    return "bunny-stream";
  }

  if (!blobUrl) return "none";

  const s3Key = bunnyS3Key(blobUrl);
  if (s3Key) {
    await deleteBunnyS3Object(s3Key);
    return "bunny-s3";
  }

  const cfR2Key = r2Key(blobUrl);
  if (cfR2Key) {
    if (!isR2Configured()) {
      throw new Error("Cloudflare R2 deletion is not configured");
    }
    await deleteR2Object(cfR2Key);
    return "cloudflare-r2";
  }

  if (isVercelBlobUrl(blobUrl)) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("Vercel Blob deletion is not configured");
    }
    await deleteVercelBlob(blobUrl);
    return "vercel-blob";
  }

  if (looksLikeLegacyBunny(blobUrl)) {
    const deleted = await deleteBunnyFile(blobUrl);
    if (!deleted) {
      throw new Error("Legacy Bunny Storage deletion failed or is not configured");
    }
    return "bunny-storage";
  }

  throw new Error("Unsupported media provider; refusing to orphan external media");
}
