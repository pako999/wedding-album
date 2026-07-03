/**
 * POST /api/albums/:slug/upload-url
 *
 * Returns the upload strategy so the browser can upload directly to storage
 * — no server-side body buffering, no Vercel size limits for large files.
 *
 * Request body: { filename: string; contentType: string; size: number }
 *
 * Possible responses:
 *   { type: "bunny-stream";  uploadUrl, videoId, signature, expiration, libraryId }
 *   { type: "bunny-storage"; key: string }          ← proxied via /bunny-upload
 *   { type: "vercel-blob" }                          ← fallback
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

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/mov",
  "video/webm", "video/mpeg", "video/3gpp", "video/avi",
]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await req.json() as { filename: string; contentType: string; size: number };
  const { filename, contentType } = body;

  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  // Verify album
  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }
  // Password-protected albums: the guest must supply the album password
  // (collected at the password gate) to obtain an upload destination.
  // Verifies against scrypt-hashed OR legacy plaintext (see
  // lib/album-password.ts) and silently upgrades legacy rows on match.
  if (album.password) {
    const provided = req.headers.get("x-album-password") ?? "";
    const ok = await verifyAlbumPassword(provided, album.password);
    if (!ok) {
      return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
    }
    if (needsRehash(album.password)) {
      const upgraded = await hashAlbumPassword(provided);
      await db
        .update(albums)
        .set({ password: upgraded })
        .where(eq(albums.id, album.id))
        .catch(() => {}); // best-effort; wrong hash won't lock out the guest
    }
  }
  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  // Skip duplicates — an identical file (same name + size) is already in this album.
  if (typeof body.size === "number") {
    const dup = await db.query.photos
      .findFirst({
        where: and(
          eq(photos.albumId, album.id),
          eq(photos.originalFilename, filename),
          eq(photos.sizeBytes, body.size),
        ),
      })
      .catch(() => null);
    if (dup) {
      return NextResponse.json({ type: "duplicate" });
    }
  }

  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);

  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  // Free plan: max 1 video
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

  // ── Video → Bunny Stream (tus direct upload) ───────────────────────────────
  if (isVideo && isBunnyStreamConfigured()) {
    try {
      const creds = await createBunnyStreamUpload(filename);
      return NextResponse.json({ type: "bunny-stream", ...creds });
    } catch (err) {
      console.error("[upload-url/bunny-stream]", err);
      // Fall through
    }
  }

  // ── Image (or video fallback) → Bunny Storage (streaming proxy) ───────────
  if (isBunnyStorageConfigured()) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
    const key = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;
    return NextResponse.json({ type: "bunny-storage", key });
  }

  // ── Fallback → Vercel Blob ─────────────────────────────────────────────────
  return NextResponse.json({ type: "vercel-blob" });
}
