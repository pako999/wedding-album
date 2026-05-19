import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, filmGenerations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { pollMontage } from "@/lib/film/shotstack";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/film/status
 *
 * Returns the latest film montage generation for the album. If it is still
 * processing, polls Shotstack and updates the row.
 * The frontend polls this every few seconds while rendering.
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
    return NextResponse.json({ generation: null });
  }

  let status = generation.status;
  let videoUrl = generation.videoUrl;
  let completedAt = generation.completedAt;

  // If still processing, poll Shotstack for the render result.
  if (status === "processing" && generation.shotstackRenderId) {
    try {
      const result = await pollMontage(generation.shotstackRenderId);
      if (result.status === "done") {
        status = "complete";
        videoUrl = result.url ?? null;
        completedAt = new Date();
        await db
          .update(filmGenerations)
          .set({
            status: "complete",
            videoUrl,
            clipsDone: generation.clipsTotal,
            completedAt,
          })
          .where(eq(filmGenerations.id, generation.id))
          .catch(() => null);
      } else if (result.status === "failed") {
        status = "failed";
        completedAt = new Date();
        await db
          .update(filmGenerations)
          .set({
            status: "failed",
            clipsFailed: generation.clipsTotal,
            completedAt,
          })
          .where(eq(filmGenerations.id, generation.id))
          .catch(() => null);
      }
    } catch (err) {
      console.error("[film/status] Shotstack poll error:", err);
      // Leave status as processing — the client will retry on the next poll.
    }
  }

  return NextResponse.json({
    generation: {
      id: generation.id,
      status,
      videoUrl,
      clipsTotal: generation.clipsTotal,
      createdAt: generation.createdAt,
      completedAt,
    },
  });
}
