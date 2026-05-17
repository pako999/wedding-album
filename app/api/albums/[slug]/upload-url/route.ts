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
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  isBunnyStorageConfigured,
  isBunnyStreamConfigured,
  createBunnyStreamUpload,
} from "@/lib/storage/bunny";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/mov",
  "video/webm", "video/mpeg", "video/3gpp",
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
  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);

  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
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
