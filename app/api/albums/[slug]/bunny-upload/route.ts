/**
 * PUT /api/albums/:slug/bunny-upload?key=<storage-key>
 *
 * Legacy raw-byte Bunny Storage gateway. Guestcam production uses direct S3
 * uploads and therefore returns 410 here. The implementation remains only for
 * older/self-hosted installations that have no BUNNY_S3_ENDPOINT configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";
import { isBunnyS3Selected } from "@/lib/storage/bunny-s3";
import { verifyAlbumPassword } from "@/lib/album-password";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAlbumFlags } from "@/lib/album-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // S3-selected Guestcam must never accept writes into the historical zone.
  if (isBunnyS3Selected()) {
    return NextResponse.json(
      { error: "Legacy upload gateway disabled; use direct S3 upload" },
      { status: 410 },
    );
  }

  if (!isBunnyStorageConfigured()) {
    return NextResponse.json({ error: "Bunny Storage not configured" }, { status: 501 });
  }

  const rl = await checkRateLimit("bunny-upload", 60, 60_000);
  if (!rl.ok) return rl.response;

  const { slug } = await params;
  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.password) {
    const provided = req.headers.get("x-album-password") ?? "";
    if (!(await verifyAlbumPassword(provided, album.password))) {
      return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
    }
  }

  const flags = await getAlbumFlags(album.id);
  if (flags.albumPermission === "view_only") {
    return NextResponse.json({ error: "uploads_disabled" }, { status: 403 });
  }

  if (album.photoCount + album.pendingCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  const key = req.nextUrl.searchParams.get("key") ?? "";
  const keyPattern = new RegExp(
    `^albums/${escapeRegExp(album.id)}/[0-9a-fA-F-]{36}\\.[A-Za-z0-9]{1,5}$`,
  );
  if (!keyPattern.test(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const contentType = (req.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (isImage && !flags.allowPhotos) {
    return NextResponse.json({ error: "photos_not_allowed" }, { status: 403 });
  }
  if (isVideo && !flags.allowVideos) {
    return NextResponse.json({ error: "videos_not_allowed" }, { status: 403 });
  }

  if (!req.body) return NextResponse.json({ error: "No body" }, { status: 400 });

  const publicUrl = `${cdnUrl()}/${key}`;
  const existing = await db.query.photos
    .findFirst({ where: eq(photos.blobUrl, publicUrl) })
    .catch(() => null);
  if (existing) {
    return NextResponse.json({ error: "Invalid key" }, { status: 409 });
  }

  try {
    const buffer = await req.arrayBuffer();
    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty file body" }, { status: 400 });
    }

    const cap = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (buffer.byteLength > cap) {
      const mb = Math.floor(cap / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large (max ${mb} MB per ${isVideo ? "video" : "photo"})` },
        { status: 413 },
      );
    }

    const endpoint = `https://storage.bunnycdn.com/${storageZone()}/${key}`;
    const bunnyRes = await fetch(endpoint, {
      method: "PUT",
      headers: {
        AccessKey: storageApiKey(),
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
      },
      body: buffer,
    });

    if (!bunnyRes.ok) {
      const msg = await bunnyRes.text().catch(() => bunnyRes.statusText);
      console.error(`[bunny-upload] Bunny error ${bunnyRes.status}:`, msg);
      if (bunnyRes.status === 429 || bunnyRes.status === 503) {
        const retryAfter = bunnyRes.headers.get("retry-after");
        return NextResponse.json(
          { error: "Storage busy, retrying", retriable: true },
          {
            status: bunnyRes.status,
            headers: retryAfter ? { "Retry-After": retryAfter } : undefined,
          },
        );
      }
      return NextResponse.json(
        { error: `Storage error (${bunnyRes.status})` },
        { status: 502 },
      );
    }

    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error("[bunny-upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
