/**
 * Photo Wall sponsor slides — owner-managed.
 *
 *   GET    /api/albums/:slug/sponsors        list
 *   PUT    /api/albums/:slug/sponsors        upload one (raw image bytes)
 *   DELETE /api/albums/:slug/sponsors?id=…   remove one
 *
 * Sponsor images are PUT to Bunny Storage under
 *   albums/<album.id>/sponsor-<uuid>.<ext>
 * so they never collide with guest photos (albums/<id>/<uuid>.<ext>) or
 * the cover image (albums/<id>/cover-<uuid>.<ext>).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, wallSponsors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { isBunnyStorageConfigured, deleteBunnyFile } from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { getSponsors } from "@/lib/wall-sponsors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
]);

/** Plenty for a logo or a designed slide; keeps one bad upload from
 *  eating the request budget. */
const MAX_BYTES = 10 * 1024 * 1024;
/** Sanity cap so a wall can't be turned into an ad reel. */
const MAX_SPONSORS = 12;

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

/** Resolve + authorize the album for every verb below. */
async function requireOwnedAlbum(slug: string) {
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album) return { error: NextResponse.json({ error: "Album not found" }, { status: 404 }) };
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) return { error: NextResponse.json({ error: owner.error }, { status: owner.status }) };
  return { album };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;
  return NextResponse.json({ sponsors: await getSponsors(res.album.id) });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isBunnyStorageConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 501 });
  }
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;
  const album = res.album;

  const contentType = req.headers.get("content-type") ?? "application/octet-stream";
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (!req.body) return NextResponse.json({ error: "No body" }, { status: 400 });

  // Enforce the cap before spending bandwidth on the upload.
  const existing = await getSponsors(album.id);
  if (existing.length >= MAX_SPONSORS) {
    return NextResponse.json(
      { error: "too_many", max: MAX_SPONSORS },
      { status: 409 },
    );
  }

  let buffer: ArrayBuffer;
  try {
    buffer = await req.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to read body" }, { status: 400 });
  }
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty file body" }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large (max 10 MB)" }, { status: 413 });
  }

  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const key = `albums/${album.id}/sponsor-${crypto.randomUUID()}.${ext}`;

  const bunnyRes = await fetch(`https://storage.bunnycdn.com/${storageZone()}/${key}`, {
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
    console.error(`[sponsor-upload] Bunny ${bunnyRes.status}:`, msg);
    return NextResponse.json({ error: `Storage error (${bunnyRes.status})` }, { status: 502 });
  }

  const imageUrl = `${cdnUrl()}/${key}`;
  const caption = (req.nextUrl.searchParams.get("caption") ?? "").trim().slice(0, 80) || null;

  try {
    const inserted = await db
      .insert(wallSponsors)
      .values({ albumId: album.id, imageUrl, caption, sortOrder: existing.length })
      .returning({ id: wallSponsors.id });
    return NextResponse.json({ id: inserted[0]?.id, imageUrl, caption });
  } catch (err) {
    // Table missing (deploy ahead of migration) — don't leave the file
    // orphaned in storage, and tell the caller what actually went wrong.
    console.error("[sponsor-upload] insert failed:", err);
    await deleteBunnyFile(imageUrl).catch(() => {});
    return NextResponse.json({ error: "sponsors_unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // Scope the delete to THIS album so an id from another album can't be
    // removed by its slug's owner.
    const rows = await db
      .delete(wallSponsors)
      .where(and(eq(wallSponsors.id, id), eq(wallSponsors.albumId, res.album.id)))
      .returning({ imageUrl: wallSponsors.imageUrl });
    if (rows[0]?.imageUrl) await deleteBunnyFile(rows[0].imageUrl).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[sponsor-delete] failed:", err);
    return NextResponse.json({ error: "sponsors_unavailable" }, { status: 503 });
  }
}
