/**
 * POST /api/albums/:slug/upload-url
 *
 * Returns a direct upload URL so the browser can upload straight to
 * Cloudflare R2 (images) or Cloudflare Stream (videos) — no server hop,
 * no body-size limit.
 *
 * Request body: { filename: string; contentType: string; size: number }
 *
 * Response (image):
 *   { type: "r2", presignedUrl: string, publicUrl: string, key: string }
 *
 * Response (video):
 *   { type: "stream", uploadUrl: string, videoId: string }
 *
 * Fallback (neither CF configured):
 *   { type: "vercel-blob" }  — client falls back to @vercel/blob/client
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isR2Configured, createR2PresignedUrl } from "@/lib/storage/r2";
import { isStreamConfigured, createStreamDirectUpload } from "@/lib/storage/stream";

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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json() as { filename: string; contentType: string; size: number };
  const { filename, contentType, size } = body;

  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  // Verify album exists and is published
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
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

  // ── Video → Cloudflare Stream ─────────────────────────────────────────────
  if (isVideo && isStreamConfigured()) {
    try {
      const { uploadUrl, videoId } = await createStreamDirectUpload();
      return NextResponse.json({ type: "stream", uploadUrl, videoId });
    } catch (err) {
      console.error("[upload-url/stream]", err);
      // Fall through to R2 or Vercel Blob
    }
  }

  // ── Image (or video fallback) → Cloudflare R2 ────────────────────────────
  if (isR2Configured()) {
    try {
      const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
      const key = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;
      const result = await createR2PresignedUrl({ key, contentType });
      return NextResponse.json({ type: "r2", ...result });
    } catch (err) {
      console.error("[upload-url/r2]", err);
      // Fall through to Vercel Blob
    }
  }

  // ── Fallback → Vercel Blob (existing behaviour) ───────────────────────────
  return NextResponse.json({ type: "vercel-blob" });
}
