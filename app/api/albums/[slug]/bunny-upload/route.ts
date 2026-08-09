/**
 * PUT /api/albums/:slug/bunny-upload?key=<storage-key>
 *
 * Node.js proxy — buffers the request body as an ArrayBuffer, then PUTs it to
 * Bunny Storage in a single reliable request.
 *
 * Why Node.js (not Edge)?
 * Vercel Edge functions have a hard 4.5 MB request-body limit, which is smaller
 * than a typical iPhone photo (5–30 MB). Node.js serverless functions have no
 * such limit — they're bounded only by memory (1 GB default) and maxDuration.
 *
 * Why arrayBuffer() instead of streaming?
 * Passing a ReadableStream from one fetch() to another can silently produce
 * 0-byte uploads in some runtimes. req.arrayBuffer() buffers the whole file
 * and then sends it as a single PUT — reliable for files up to ~500 MB.
 *
 * The `key` query param is returned by /upload-url as { type: "bunny-storage", key }.
 * Returns: { publicUrl: string }
 *
 * SECURITY — this endpoint writes straight to object storage, so it must
 * re-apply every gate /upload-url applies (the two are separate requests;
 * a client can call this one directly). Uploads are intentionally
 * ANONYMOUS — guests upload via link/QR with no login — so we do NOT
 * require auth. We DO require:
 *   • a real, published album,
 *   • the album password IFF the album has one set (open albums stay open),
 *   • a key that resolves to THIS album's own folder with a random-UUID
 *     filename (blocks path traversal + writing into other albums),
 *   • a whitelisted image/video content type,
 *   • a per-file size cap,
 *   • no overwrite of an already-recorded photo,
 *   • a rate limit.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";
import { verifyAlbumPassword } from "@/lib/album-password";
import { checkRateLimit } from "@/lib/rate-limit";

// Node.js runtime — no 4.5 MB Edge body-size cap; supports large phone photos
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — enough for a 50 MB photo on a slow connection

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

// Mirrors the whitelist in /upload-url. Keep the two in sync.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/mov",
  "video/webm", "video/mpeg", "video/3gpp", "video/avi",
]);
const MAX_IMAGE_BYTES = 60 * 1024 * 1024;   //  60 MB per photo
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;  // 500 MB per video

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isBunnyStorageConfigured()) {
    return NextResponse.json({ error: "Bunny Storage not configured" }, { status: 501 });
  }

  // Rate limit — this proxies raw bytes to paid storage; without a cap a
  // script could exhaust the storage bill. 60/min per IP covers a guest
  // dragging in a big batch while stopping abuse.
  const rl = await checkRateLimit("bunny-upload", 60, 60_000);
  if (!rl.ok) return rl.response;

  const { slug } = await params;

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Password gate — ONLY when the album actually has a password. Open
  // link/QR albums (the default) stay open, matching /upload-url.
  if (album.password) {
    const provided = req.headers.get("x-album-password") ?? "";
    const ok = await verifyAlbumPassword(provided, album.password);
    if (!ok) {
      return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
    }
  }

  // Photo-limit guard — stops storage-exhaustion past the plan cap.
  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  // Key must be EXACTLY the shape /upload-url issues:
  //   albums/<this album's id>/<uuid>.<ext>
  // Pinning the album-id segment to the resolved album blocks both path
  // traversal (../, //, \) and writing into another album's folder. The
  // UUID + short-ext tail keeps the filename server-shaped and unguessable.
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const keyPattern = new RegExp(
    `^albums/${escapeRegExp(album.id)}/[0-9a-fA-F-]{36}\\.[A-Za-z0-9]{1,5}$`,
  );
  if (!keyPattern.test(key)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  // Content type must be a whitelisted image/video; it also picks the cap.
  const contentType = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.has(contentType);
  const isVideo = ALLOWED_VIDEO_TYPES.has(contentType);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (!req.body) {
    return NextResponse.json({ error: "No body" }, { status: 400 });
  }

  // Refuse to overwrite a photo we've already recorded at this key — a
  // guest who reads a public CDN URL could otherwise replace someone
  // else's photo in the same album.
  const publicUrl = `${cdnUrl()}/${key}`;
  const existing = await db.query.photos
    .findFirst({ where: eq(photos.blobUrl, publicUrl) })
    .catch(() => null);
  if (existing) {
    return NextResponse.json({ error: "Invalid key" }, { status: 409 });
  }

  try {
    // Buffer entire body — avoids the ReadableStream double-consume bug in Edge
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
      return NextResponse.json(
        { error: `Storage error (${bunnyRes.status}): ${msg}` },
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

/** Escape a string for safe interpolation into a RegExp. album.id is a
 *  server-generated UUID, but escape defensively so a future id format
 *  can't inject regex metacharacters. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
