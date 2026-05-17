import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos, filmGenerations, filmClips } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { queueKlingClip } from "@/lib/film/kling";
import { bunnyDisplayUrl } from "@/lib/storage/bunny";

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

  // Create generation record
  const [generation] = await db
    .insert(filmGenerations)
    .values({
      albumId: album.id,
      status: "processing",
      clipsTotal: imagePhotos.length,
    })
    .returning();

  // Build webhook URL (needs to be public; works on Vercel production)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${req.headers.get("host")}`;
  const webhookUrl = `${appUrl}/api/webhooks/fal`;

  // Insert all clip rows first so webhook can resolve request_id → clip
  const clipValues = imagePhotos.map((p, i) => ({
    generationId: generation.id,
    albumId: album.id,
    photoId: p.id,
    photoUrl: bunnyDisplayUrl(p.blobUrl, 1920, 92), // high-res for AI
    sortOrder: i,
    status: "queued" as const,
  }));

  const insertedClips = await db
    .insert(filmClips)
    .values(clipValues)
    .returning();

  // Queue each clip to fal.ai (5 at a time to respect rate limits)
  const BATCH = 5;
  for (let i = 0; i < insertedClips.length; i += BATCH) {
    const batch = insertedClips.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (clip) => {
        try {
          const falRequestId = await queueKlingClip({
            imageUrl: clip.photoUrl,
            eventType: album.eventType,
            webhookUrl,
          });
          await db
            .update(filmClips)
            .set({ falRequestId, status: "processing" })
            .where(eq(filmClips.id, clip.id));
        } catch (err) {
          console.error(`[film/generate] clip ${clip.id} queue error:`, err);
          await db
            .update(filmClips)
            .set({ status: "failed", errorMessage: String(err) })
            .where(eq(filmClips.id, clip.id));
          await db
            .update(filmGenerations)
            .set({ clipsFailed: generation.clipsFailed + 1 })
            .where(eq(filmGenerations.id, generation.id));
        }
      })
    );
  }

  return NextResponse.json({
    generationId: generation.id,
    clipsTotal: imagePhotos.length,
  });
}
