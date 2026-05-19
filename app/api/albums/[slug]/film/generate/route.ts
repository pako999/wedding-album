import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, filmGenerations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { submitMontage } from "@/lib/film/shotstack";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/albums/[slug]/film/generate
 *
 * Builds ONE montage video from the selected album photos via Shotstack.
 * The real photos are used as-is (no AI re-rendering) with Ken-Burns
 * motion + crossfade transitions.
 *
 * Body: { photoIds?: string[] }  — fallback: all published, non-video photos.
 * Requires the album owner to be authenticated (Clerk).
 *
 * Returns: { generationId }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Auth
  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Film creation is a paid feature — the free film tier cannot generate.
  if ((album.filmTier ?? "free") === "free") {
    return NextResponse.json(
      { error: "Film creation requires the Pro plan." },
      { status: 403 },
    );
  }

  // Only published, non-video photos
  const albumPhotos = await db.query.photos.findMany({
    where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
    orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
  });
  const imagePhotos = albumPhotos.filter(p => !p.mimeType?.startsWith("video/"));

  if (imagePhotos.length === 0) {
    return NextResponse.json({ error: "No photos to generate from" }, { status: 400 });
  }

  // Optional: caller can specify exact photo IDs (from the FilmStudio picker)
  const body = await req.json().catch(() => ({})) as { photoIds?: string[] };
  const requestedPhotoIds = Array.isArray(body?.photoIds) && body.photoIds.length > 0
    ? body.photoIds
    : null;

  // Enforce tier photo limit
  const TIER_LIMITS: Record<string, number> = { free: 48, pro: 100, premium: 300 };
  const tierLimit = TIER_LIMITS[album.filmTier ?? "free"] ?? 48;

  const selectedPhotos = requestedPhotoIds
    ? imagePhotos.filter(p => requestedPhotoIds.includes(p.id)).slice(0, tierLimit)
    : imagePhotos.slice(0, tierLimit);

  if (selectedPhotos.length === 0) {
    return NextResponse.json({ error: "No photos to generate from" }, { status: 400 });
  }

  // Raw CDN URLs — Shotstack fetches the images directly.
  const photoUrls = selectedPhotos.map(p => p.blobUrl);

  // Submit ONE montage render to Shotstack.
  let renderId: string;
  try {
    renderId = await submitMontage(photoUrls);
  } catch (err) {
    console.error("[film/generate] Shotstack submit error:", err);
    return NextResponse.json(
      { error: "Napaka pri zagonu generiranja filma." },
      { status: 502 },
    );
  }

  // Record one generation row for this montage render.
  const [generation] = await db
    .insert(filmGenerations)
    .values({
      albumId: album.id,
      status: "processing",
      clipsTotal: selectedPhotos.length,
      shotstackRenderId: renderId,
    })
    .returning();

  // Demo account: Film Studio unlocks for a single montage only — lock it
  // again now that the one render has been submitted.
  if (album.slug === "marko-40-udt5") {
    await db.update(albums)
      .set({ filmTier: "free" })
      .where(eq(albums.id, album.id));
  }

  return NextResponse.json({ generationId: generation.id });
}
