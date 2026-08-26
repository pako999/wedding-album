/**
 * POST /api/albums/:slug/upload-url
 *
 * Returns the upload strategy used by the browser:
 *   • videos -> Bunny Stream tus (direct browser -> Bunny)
 *   • photos -> Bunny S3 presigned PUT when S3 is selected
 *   • legacy Bunny Storage is only used by installations with NO S3 endpoint
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
  isBunnyS3Selected,
  createBunnyS3PresignedUpload,
} from "@/lib/storage/bunny-s3";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAlbumFlags } from "@/lib/album-flags";

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
  "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
  "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
  "image/gif": "gif", "video/mp4": "mp4", "video/quicktime": "mov",
  "video/mov": "mov", "video/webm": "webm", "video/mpeg": "mpeg",
  "video/3gpp": "3gp", "video/avi": "avi",
};

const MAX_IMAGE_BYTES = 250 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
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

  // Open/link-only albums pass automatically. Protected albums accept the
  // encrypted HttpOnly album-access cookie (or the legacy header for backwards
  // compatibility), so the browser never needs the raw password in client props.
  if (!(await hasAlbumRequestAccess(req, slug, album))) {
    return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const flags = await getAlbumFlags(album.id);
  if (flags.albumPermission === "view_only") {
    return NextResponse.json({ error: "uploads_disabled" }, { status: 403 });
  }
  if (isVideo && !flags.allowVideos) {
    return NextResponse.json({ error: "videos_not_allowed" }, { status: 403 });
  }
  if (isImage && !flags.allowPhotos) {
    return NextResponse.json({ error: "photos_not_allowed" }, { status: 403 });
  }

  if (album.photoCount + album.pendingCount >= album.maxPhotos) {
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
    if (Number(videoCountResult[0]?.count ?? 0) >= 1) {
      return NextResponse.json(
        { error: "Free plan allows only 1 video. Upgrade to upload more." },
        { status: 403 },
      );
    }
  }

  if (isVideo) {
    if (!isBunnyStreamConfigured()) {
      return NextResponse.json({ error: "Video uploads are temporarily unavailable" }, { status: 503 });
    }
    try {
      const creds = await createBunnyStreamUpload(filename);
      return NextResponse.json({ type: "bunny-stream", ...creds });
    } catch (err) {
      console.error("[upload-url/bunny-stream]", err);
      return NextResponse.json({ error: "Video upload service unavailable" }, { status: 503 });
    }
  }

  const ext = EXTENSION_BY_MIME[contentType] ?? "bin";
  const key = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;

  // Once an S3 endpoint is selected, configuration/signing errors fail closed.
  // Never route those files into the old zone and silently split new uploads.
  if (isBunnyS3Selected()) {
    if (!isBunnyS3Configured()) {
      console.error("[upload-url/bunny-s3] S3 selected but credentials are incomplete");
      return NextResponse.json({ error: "Photo storage configuration unavailable" }, { status: 503 });
    }
    try {
      const direct = await createBunnyS3PresignedUpload({ key, contentType, expiresIn: 300 });
      return NextResponse.json({ type: "bunny-s3", ...direct });
    } catch (err) {
      console.error("[upload-url/bunny-s3]", err);
      return NextResponse.json({ error: "Photo storage service unavailable" }, { status: 503 });
    }
  }

  // Historical/self-hosted installation compatibility only. Guestcam production
  // selects S3 and therefore never reaches this raw-byte serverless gateway.
  if (isBunnyStorageConfigured()) {
    return NextResponse.json({ type: "bunny-storage", key });
  }

  return NextResponse.json({ error: "Photo storage is temporarily unavailable" }, { status: 503 });
}
