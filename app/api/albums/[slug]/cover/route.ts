/**
 * PUT /api/albums/:slug/cover
 *
 * Uploads a new cover photo for the album and persists the public URL on
 * `albums.coverImageUrl`. Owner-only + plan-gated (Plus / Premium).
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { deleteStoredMedia } from "@/lib/storage/delete-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif",
]);

const PLANS_WITH_COVER_UPLOAD = new Set(["plus", "premium"]);
const MAX_SOURCE_BYTES = 50 * 1024 * 1024;
const COVER_MAX_WIDTH = 800;
const COVER_WEBP_QUALITY = 82;

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

type Album = typeof albums.$inferSelect;

function isDedicatedCover(url: string | null, albumId: string) {
  return !!url && url.includes(`/albums/${albumId}/cover-`);
}

async function optimizeAndStoreCover(album: Album, source: ArrayBuffer) {
  let optimized: { data: Buffer; info: sharp.OutputInfo };
  try {
    optimized = await sharp(Buffer.from(source), { limitInputPixels: 100_000_000 })
      .rotate()
      .resize({
        width: COVER_MAX_WIDTH,
        withoutEnlargement: true,
      })
      .webp({ quality: COVER_WEBP_QUALITY, effort: 4 })
      .toBuffer({ resolveWithObject: true });
  } catch (error) {
    console.error("[cover-upload] Image optimization failed:", error);
    throw new Error("invalid_image");
  }

  const key = `albums/${album.id}/cover-${crypto.randomUUID()}.webp`;
  const endpoint = `https://storage.bunnycdn.com/${storageZone()}/${key}`;
  const bunnyRes = await fetch(endpoint, {
    method: "PUT",
    headers: {
      AccessKey: storageApiKey(),
      "Content-Type": "image/webp",
      "Content-Length": String(optimized.data.byteLength),
    },
    body: Uint8Array.from(optimized.data),
  });

  if (!bunnyRes.ok) {
    const msg = await bunnyRes.text().catch(() => bunnyRes.statusText);
    console.error(`[cover-upload] Bunny ${bunnyRes.status}:`, msg);
    throw new Error(`storage_${bunnyRes.status}`);
  }

  const publicUrl = `${cdnUrl()}/${key}`;
  const previousCover = album.coverImageUrl;

  await db
    .update(albums)
    .set({ coverImageUrl: publicUrl, updatedAt: new Date() })
    .where(eq(albums.id, album.id));

  if (isDedicatedCover(previousCover, album.id)) {
    deleteStoredMedia({ blobUrl: previousCover! }).catch((error) => {
      console.warn("[cover-upload] Previous cover cleanup failed:", error);
    });
  }

  return {
    publicUrl,
    width: optimized.info.width,
    height: optimized.info.height,
    bytes: optimized.data.byteLength,
    format: "webp",
  };
}

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
  if (buffer.byteLength > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Cover image too large (max 15 MB)" }, { status: 413 });
  }

  try {
    const result = await optimizeAndStoreCover(album, buffer);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "invalid_image") {
      return NextResponse.json({ error: "Invalid or unsupported image" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Storage error" },
      { status: 502 },
    );
  }
}

/** Creates a dedicated optimized cover from an existing gallery photo. */
export async function POST(
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

  const body = await req.json().catch(() => null);
  const photoId = typeof body?.photoId === "string" ? body.photoId : "";
  const photo = photoId
    ? await db.query.photos.findFirst({
        where: and(
          eq(photos.id, photoId),
          eq(photos.albumId, album.id),
          eq(photos.status, "published"),
        ),
      })
    : null;

  if (!photo || photo.mimeType?.startsWith("video/")) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const sourceUrl = new URL(photo.blobUrl, req.nextUrl.origin);
  const sourceRes = await fetch(sourceUrl, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  }).catch(() => null);
  if (!sourceRes?.ok) {
    return NextResponse.json({ error: "Failed to read source photo" }, { status: 502 });
  }

  const declaredLength = Number(sourceRes.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: "Source image too large" }, { status: 413 });
  }

  const source = await sourceRes.arrayBuffer();
  if (source.byteLength === 0 || source.byteLength > MAX_SOURCE_BYTES) {
    return NextResponse.json({ error: "Source image too large" }, { status: 413 });
  }

  try {
    const result = await optimizeAndStoreCover(album, source);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "invalid_image") {
      return NextResponse.json({ error: "Invalid or unsupported image" }, { status: 400 });
    }
    return NextResponse.json({ error: "Storage error" }, { status: 502 });
  }
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

  if (isDedicatedCover(album.coverImageUrl, album.id)) {
    try {
      await deleteStoredMedia({ blobUrl: album.coverImageUrl });
    } catch (err) {
      console.error(`[cover-delete] External cleanup failed for ${slug}:`, err);
      return NextResponse.json(
        { error: "Cover cleanup failed; cover was not removed", code: "media_cleanup_failed" },
        { status: 502 },
      );
    }
  }

  await db
    .update(albums)
    .set({ coverImageUrl: null, updatedAt: new Date() })
    .where(eq(albums.id, album.id));

  return NextResponse.json({ ok: true });
}
