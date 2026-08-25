/**
 * POST /api/albums/:slug/upload-url
 *
 * Returns the upload strategy. Large media bytes should bypass Vercel:
 *   • videos -> Bunny Stream tus (direct browser -> Bunny)
 *   • photos -> Cloudflare R2 presigned PUT when configured
 *   • photos -> Vercel Blob client upload when R2 is unavailable but Blob is configured
 *   • Bunny Storage proxy is legacy fallback only
 *
 * The request itself is intentionally tiny (metadata only), so the endpoint can
 * safely serve a large event without proxying hundreds of image bodies through
 * serverless memory.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, like, sql } from "drizzle-orm";
import {
  isBunnyStorageConfigured,
  isBunnyStreamConfigured,
  createBunnyStreamUpload,
} from "@/lib/storage/bunny";
import { isR2Configured, createR2PresignedUrl } from "@/lib/storage/r2";
import { hashAlbumPassword, needsRehash, verifyAlbumPassword } from "@/lib/album-password";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/mov",
  "video/webm", "video/mpeg", "video/3gpp", "video/avi",
]);

const MAX_IMAGE_BYTES = 60 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

/**
 * Venue-safe coarse abuse cap.
 *
 * Hundreds of guests at a venue often share ONE public NAT/Wi-Fi IP. The old
 * 30/minute per-IP limit treated a whole wedding/concert as one user and could
 * reject legitimate uploads. This endpoint only performs small DB reads and
 * signs a destination URL, so 2,000/minute per public IP leaves headroom for a
 * 500-person burst while still putting a ceiling on a single-source script.
 * Plan limits, file caps, key scoping and save-upload validation remain the
 * authoritative abuse controls.
 */
const VENUE_REQUESTS_PER_MINUTE = 2_000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const rl = await checkRateLimit("upload-url-venue", VENUE_REQUESTS_PER_MINUTE, 60_000);
  if (!rl.ok) return rl.response;

  let body: { filename?: string; contentType?: string; size?: number };
  try {
    body = await req.json() as { filename?: string; contentType?: string; size?: number };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const filename = typeof body.filename === "string" ? body.filename : "";
  const contentType = typeof body.contentType === "string"
    ? body.contentType.split(";")[0].trim().toLowerCase()
    : "";

  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.password) {
    const provided = req.headers.get("x-album-password") ?? "";
    const ok = await verifyAlbumPassword(provided, album.password);
    if (!ok) {
      return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
    }
    if (needsRehash(album.password)) {
      const upgraded = await hashAlbumPassword(provided);
      await db.update(albums).set({ password: upgraded }).where(eq(albums.id, album.id)).catch(() => {});
    }
  }

  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  if (typeof body.size === "number" && Number.isFinite(body.size)) {
    const dup = await db.query.photos
      .findFirst({
        where: and(
          eq(photos.albumId, album.id),
          eq(photos.originalFilename, filename),
          eq(photos.sizeBytes, body.size),
        ),
      })
      .catch(() => null);
    if (dup) return NextResponse.json({ type: "duplicate" });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const cap = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (typeof body.size === "number" && (!Number.isFinite(body.size) || body.size < 0 || body.size > cap)) {
    const mb = Math.floor(cap / (1024 * 1024));
    return NextResponse.json(
      { error: `File too large (max ${mb} MB per ${isVideo ? "video" : "photo"})` },
      { status: 413 },
    );
  }

  if (isVideo && album.plan === "free") {
    const videoCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(and(eq(photos.albumId, album.id), like(photos.mimeType, "video/%")));
    const videoCount = Number(videoCountResult[0]?.count ?? 0);
    if (videoCount >= 1) {
      return NextResponse.json(
        { error: "Free plan allows only 1 video. Upgrade to upload more." },
        { status: 403 },
      );
    }
  }

  // Videos: direct tus upload to Bunny Stream. The video body never reaches Vercel.
  if (isVideo && isBunnyStreamConfigured()) {
    try {
      const creds = await createBunnyStreamUpload(filename);
      return NextResponse.json({ type: "bunny-stream", ...creds });
    } catch (err) {
      console.error("[upload-url/bunny-stream]", err);
    }
  }

  const ext = (filename.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const key = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;

  // Preferred image path for large events: browser -> Cloudflare R2 directly.
  // Vercel only signs a short-lived URL; it never buffers the photo bytes.
  if (isImage && isR2Configured()) {
    try {
      const signed = await createR2PresignedUrl({ key, contentType, expiresIn: 300 });
      return NextResponse.json({ type: "r2", ...signed });
    } catch (err) {
      console.error("[upload-url/r2]", err);
      // Gracefully fall through to another direct provider.
    }
  }

  // Vercel Blob client uploads are also direct/multipart; prefer them to the
  // legacy Bunny byte proxy when a Blob token is available.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ type: "vercel-blob" });
  }

  // Legacy fallback only. This route proxies bytes through a Node function and
  // therefore is not the recommended path for a 500+ person simultaneous burst.
  if (isBunnyStorageConfigured()) {
    return NextResponse.json({ type: "bunny-storage", key });
  }

  return NextResponse.json(
    { error: "No upload storage provider configured" },
    { status: 503 },
  );
}
