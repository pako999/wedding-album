/**
 * POST /api/albums/:slug/upload-url
 *
 * Returns the upload strategy used by the browser:
 *   • videos -> Bunny Stream tus (direct browser -> Bunny)
 *   • photos -> Bunny Storage key, uploaded through the streaming Bunny gateway
 *
 * Guestcam intentionally stays on Bunny for event media. We do NOT expose the
 * Bunny Storage API key to the browser: Storage API writes require the zone
 * password/API key, so the browser receives only an album-scoped random object
 * key. /bunny-upload re-validates the album, password, MIME type and key before
 * streaming the request body to Bunny Storage.
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
 * Hundreds of guests at a venue often share one public NAT/Wi-Fi IP. A tiny
 * per-IP limit therefore blocks legitimate guests. This endpoint only handles
 * small metadata requests and issues album-scoped random keys; file bytes do
 * not pass through it. 2,000/min is enough for a 500-person first burst while
 * still putting a ceiling on obvious single-source abuse.
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

  // Videos upload directly from the guest device to Bunny Stream using tus.
  // No video bytes pass through a Vercel function.
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

  // Photos stay on Bunny Storage. The key is random and pinned to this album;
  // the separate gateway re-validates it before forwarding bytes to Bunny.
  if (!isBunnyStorageConfigured()) {
    return NextResponse.json(
      { error: "Photo storage is temporarily unavailable" },
      { status: 503 },
    );
  }

  const ext = (filename.split(".").pop() ?? "bin")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 5) || "bin";
  const key = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;
  return NextResponse.json({ type: "bunny-storage", key });
}
