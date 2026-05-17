import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, filmGenerations, filmClips } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/film/status
 *
 * Returns the latest film generation + all its clips.
 * Frontend polls this every few seconds while processing.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Latest generation for this album
  const [generation] = await db
    .select()
    .from(filmGenerations)
    .where(eq(filmGenerations.albumId, album.id))
    .orderBy(desc(filmGenerations.createdAt))
    .limit(1)
    .catch(() => []);

  if (!generation) {
    return NextResponse.json({ generation: null, clips: [] });
  }

  const clips = await db.query.filmClips
    .findMany({
      where: eq(filmClips.generationId, generation.id),
      orderBy: (c, { asc }) => [asc(c.sortOrder)],
    })
    .catch(() => []);

  // Re-derive counts from actual clip rows in case webhook updated them
  const done   = clips.filter(c => c.status === "done").length;
  const failed = clips.filter(c => c.status === "failed").length;
  const total  = clips.length;

  // Auto-complete when all clips resolved
  let status = generation.status;
  if (status === "processing" && done + failed === total && total > 0) {
    status = failed === total ? "failed" : "complete";
    await db
      .update(filmGenerations)
      .set({ status, clipsDone: done, clipsFailed: failed, completedAt: new Date() })
      .where(eq(filmGenerations.id, generation.id))
      .catch(() => null);
  }

  return NextResponse.json({
    generation: {
      id: generation.id,
      status,
      clipsTotal: total,
      clipsDone: done,
      clipsFailed: failed,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt,
    },
    clips: clips.map(c => ({
      id: c.id,
      photoId: c.photoId,
      photoUrl: c.photoUrl,
      status: c.status,
      videoUrl: c.videoUrl,
      sortOrder: c.sortOrder,
    })),
  });
}
