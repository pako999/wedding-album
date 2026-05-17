import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, filmGenerations, filmClips } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { submitKlingJob } from "@/lib/film/kling";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/albums/[slug]/film/generate
 *
 * Starts a new Kling AI film generation for every published photo in the album.
 * Requires the album owner to be authenticated (Clerk).
 *
 * Returns: { generationId, clipsTotal }
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

  let limitedPhotos = requestedPhotoIds
    ? imagePhotos.filter(p => requestedPhotoIds.includes(p.id)).slice(0, tierLimit)
    : imagePhotos.slice(0, tierLimit);

  // Create generation record
  const [generation] = await db
    .insert(filmGenerations)
    .values({
      albumId: album.id,
      status: "processing",
      clipsTotal: limitedPhotos.length,
    })
    .returning();

  // Insert all clip rows first, then submit to Kling and store task_id
  const clipValues = limitedPhotos.map((p, i) => ({
    generationId: generation.id,
    albumId: album.id,
    photoId: p.id,
    photoUrl: p.blobUrl, // raw CDN URL — Kling image_url requires a clean URL without query params
    sortOrder: i,
    status: "queued" as const,
  }));

  const insertedClips = await db
    .insert(filmClips)
    .values(clipValues)
    .returning();

  // Submit each clip to Kling AI (3 at a time — direct API rate limit is ~5 rps)
  const BATCH = 3;
  for (let i = 0; i < insertedClips.length; i += BATCH) {
    const batch = insertedClips.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (clip) => {
        try {
          const taskId = await submitKlingJob({
            imageUrl: clip.photoUrl,
            eventType: album.eventType,
          });
          await db
            .update(filmClips)
            .set({ falRequestId: taskId, status: "processing" })
            .where(eq(filmClips.id, clip.id));
        } catch (err) {
          console.error(`[film/generate] clip ${clip.id} submit error:`, err);
          await db
            .update(filmClips)
            .set({ status: "failed", errorMessage: String(err) })
            .where(eq(filmClips.id, clip.id));
        }
      })
    );
    // Small delay between batches to respect rate limits
    if (i + BATCH < insertedClips.length) await new Promise(r => setTimeout(r, 500));
  }

  return NextResponse.json({
    generationId: generation.id,
    clipsTotal: limitedPhotos.length,
    tierLimit,
    totalPhotos: imagePhotos.length,
  });
}
