/**
 * PUT /api/albums/:slug/cover
 *
 * Uploads a new cover photo for the album and persists the public URL on
 * `albums.coverImageUrl`. Owner-only + plan-gated (Plus / Premium / film
 * Pro / film Premium — anything paid above Basic).
 *
 * Body: raw image bytes. The caller sets Content-Type to image/jpeg etc.
 * Returns: { publicUrl: string }
 *
 * The bytes are PUT to Bunny Storage under
 *   albums/<album.id>/cover-<uuid>.<ext>
 * so we don't collide with the photo-upload tree (albums/<id>/<uuid>.<ext>).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif",
]);

const PLANS_WITH_COVER_UPLOAD = new Set(["plus", "premium"]);

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isBunnyStorageConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 501 });
  }

  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }

  // Plan gate — only Plus / Premium can upload a custom cover photo.
  if (!PLANS_WITH_COVER_UPLOAD.has(album.plan)) {
    return NextResponse.json(
      { error: "plan_required", requiredPlan: "plus" },
      { status: 402 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "application/octet-stream";
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (!req.body) return NextResponse.json({ error: "No body" }, { status: 400 });

  let buffer: ArrayBuffer;
  try {
    buffer = await req.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read body" }, { status: 400 });
  }
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty file body" }, { status: 400 });
  }
  // Hard cap — covers should be a single hero image, not a multi-MB raw.
  if (buffer.byteLength > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Cover image too large (max 15 MB)" }, { status: 413 });
  }

  const ext = contentType.includes("png") ? "png"
            : contentType.includes("webp") ? "webp"
            : contentType.includes("heic") ? "heic"
            : contentType.includes("heif") ? "heif"
            : "jpg";
  const key = `albums/${album.id}/cover-${crypto.randomUUID()}.${ext}`;
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
    console.error(`[cover-upload] Bunny ${bunnyRes.status}:`, msg);
    return NextResponse.json(
      { error: `Storage error (${bunnyRes.status})` },
      { status: 502 },
    );
  }

  const publicUrl = `${cdnUrl()}/${key}`;

  await db
    .update(albums)
    .set({ coverImageUrl: publicUrl, updatedAt: new Date() })
    .where(eq(albums.id, album.id));

  return NextResponse.json({ publicUrl });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }

  await db
    .update(albums)
    .set({ coverImageUrl: null, updatedAt: new Date() })
    .where(eq(albums.id, album.id));

  return NextResponse.json({ ok: true });
}
