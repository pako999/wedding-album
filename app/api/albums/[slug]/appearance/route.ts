import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { getAlbumAppearance, setAlbumAppearance } from "@/lib/album-appearance";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";
import { deleteStoredMedia } from "@/lib/storage/delete-media";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;
/** Which appearance slot an uploaded image fills. */
const KINDS = { logo: "logoUrl", background: "backgroundUrl", welcome: "welcomeBgUrl" } as const;

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

/** Appearance is owner-only — collaborators manage the wall, not the brand. */
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
  return NextResponse.json({ appearance: await getAlbumAppearance(res.album.id) });
}

/** Text/toggle fields. Validation lives in setAlbumAppearance. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const ok = await setAlbumAppearance(res.album.id, body);
  if (!ok) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ appearance: await getAlbumAppearance(res.album.id) });
}

/** Image upload: PUT raw body with ?kind=logo|background|welcome. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isBunnyStorageConfigured()) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 501 });
  }
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;

  const kind = req.nextUrl.searchParams.get("kind") as keyof typeof KINDS | null;
  if (!kind || !(kind in KINDS)) {
    return NextResponse.json({ error: "kind must be logo|background|welcome" }, { status: 400 });
  }
  const contentType = req.headers.get("content-type") ?? "application/octet-stream";
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  let buffer: ArrayBuffer;
  try { buffer = await req.arrayBuffer(); } catch {
    return NextResponse.json({ error: "Failed to read body" }, { status: 400 });
  }
  if (buffer.byteLength === 0) return NextResponse.json({ error: "Empty file body" }, { status: 400 });
  if (buffer.byteLength > MAX_BYTES) return NextResponse.json({ error: "Image too large (max 10 MB)" }, { status: 413 });

  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const key = `albums/${res.album.id}/appearance-${kind}-${crypto.randomUUID()}.${ext}`;
  const bunnyRes = await fetch(`https://storage.bunnycdn.com/${storageZone()}/${key}`, {
    method: "PUT",
    headers: { AccessKey: storageApiKey(), "Content-Type": contentType, "Content-Length": String(buffer.byteLength) },
    body: buffer,
  });
  if (!bunnyRes.ok) {
    const msg = await bunnyRes.text().catch(() => bunnyRes.statusText);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 502 });
  }
  const url = `${cdnUrl()}/${key}`;
  // setAlbumAppearance never throws (a missing table must not break the
  // gallery) so it MUST be checked here. Ignoring it returned 200 with
  // appearance:null, which the UI read as "nothing changed" — the upload
  // looked like it silently did nothing.
  const stored = await setAlbumAppearance(res.album.id, { [KINDS[kind]]: url });
  if (!stored) {
    return NextResponse.json(
      { error: "Image uploaded but could not be saved. Please try again." },
      { status: 503 },
    );
  }
  return NextResponse.json({ url, appearance: await getAlbumAppearance(res.album.id) });
}

/** Remove one uploaded appearance image and its external storage object. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;

  const kind = req.nextUrl.searchParams.get("kind") as keyof typeof KINDS | null;
  if (!kind || !(kind in KINDS)) {
    return NextResponse.json({ error: "kind must be logo|background|welcome" }, { status: 400 });
  }

  const appearance = await getAlbumAppearance(res.album.id);
  const currentUrl = kind === "logo"
    ? appearance?.logoUrl
    : kind === "background"
      ? appearance?.backgroundUrl
      : appearance?.welcomeBgUrl;

  if (currentUrl) {
    try {
      await deleteStoredMedia({ blobUrl: currentUrl });
    } catch (error) {
      console.error("[appearance] failed to delete stored asset", { slug, kind, error });
      return NextResponse.json({ error: "Could not delete stored image" }, { status: 502 });
    }
  }

  const stored = await setAlbumAppearance(res.album.id, { [KINDS[kind]]: null });
  if (!stored) {
    return NextResponse.json({ error: "Could not clear appearance setting" }, { status: 503 });
  }

  return NextResponse.json({ appearance: await getAlbumAppearance(res.album.id) });
}