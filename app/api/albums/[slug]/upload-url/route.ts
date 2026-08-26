/**
 * POST /api/albums/:slug/upload-url
 *
 * Returns the upload strategy used by the browser:
 *   • videos -> Bunny Stream tus (direct browser -> Bunny)
 *   • photos -> Bunny S3 presigned PUT (direct browser -> Bunny) when enabled
 *   • legacy Bunny Storage gateway is kept only as a fallback
 *
 * The preferred photo path preserves the exact original bytes from the phone.
 * A 30 MB photo is stored as the same 30 MB object; gallery optimization is
 * applied later only when displaying the image.
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
import {
  isBunnyS3Configured,
  createBunnyS3PresignedUpload,
} from "@/lib/storage/bunny-s3";
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

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/mov": "mov",
  "video/webm": "webm",
  "video/mpeg": "mpeg",
  "video/3gpp": "3gp",
  "video/avi": "avi",
};

// Safety ceiling only — not a normal phone-photo limit. This intentionally
// allows 20 MB, 30 MB, 50 MB and much larger originals without recompression.
const MAX_IMAGE_BYTES = 250 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

/**
 * Venue-safe coarse abuse cap.
 * Hundreds of guests often share one public NAT/Wi-Fi IP, so a tiny per-IP
 * limiter would block legitimate event traffic.
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

  const filename = typeof body.filename === "string" ? body.filename.trim() : "";
  const contentType = typeof body.contentType === "string"
    ? body.contentType.split(";")[0].trim().toLowerCase()
    : "";

  if (!filename || !contentType || filename.length > 255) {
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
  if (typeof body.size !== "number" || !Number.isFinite(body.size) || body.size < 0 || body.size > cap) {
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

  // Videos upload directly from the guest device to Bunny Stream using tus.
  if (isVideo) {
    if (!isBunnyStreamConfigured()) {
      return NextResponse.json(
        { error: "Video uploads are temporarily unavailable" },
        { status: 503 },
      );
    }
    try {
      const creds = await createBunnyStreamUpload(filename);
      return NextResponse.json({ type: "bunny-stream", ...creds });
    } catch (err) {
      console.error("[upload-url/bunny-stream]", err);
      return NextResponse.json(
        { error: "Video upload service unavailable" },
        { status: 503 },
      );
    }
  }

  const ext = EXTENSION_BY_MIME[contentType] ?? "bin";
  const key = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;

  // Preferred photo path: original file goes directly from the guest device to
  // Bunny S3. Vercel only signs the short-lived URL and never sees the bytes.
  if (isImage && isBunnyS3Configured()) {
    try {
      const direct = await createBunnyS3PresignedUpload({
        key,
        contentType,
        expiresIn: 300,
      });
      return NextResponse.json({ type: "bunny-s3", ...direct });
    } catch (err) {
      console.error("[upload-url/bunny-s3]", err);
    }
  }

  // Legacy fallback for installations where Bunny S3 has not yet been enabled.
  // This is not the desired path for large originals because it traverses the
  // Vercel upload gateway. Once the CamLove S3 envs are present in Guestcam,
  // normal photo uploads never reach this branch.
  if (isBunnyStorageConfigured()) {
    return NextResponse.json({ type: "bunny-storage", key });
  }

  return NextResponse.json(
    { error: "Photo storage is temporarily unavailable" },
    { status: 503 },
  );
}
