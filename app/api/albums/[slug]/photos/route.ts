import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/photos
 * Returns all published photos for the album owner (for FilmStudio photo picker).
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

  const albumPhotos = await db.query.photos
    .findMany({
      where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
      orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
    })
    .catch(() => []);

  const imagePhotos = albumPhotos.filter(p => !p.mimeType?.startsWith("video/"));

  return NextResponse.json({
    photos: imagePhotos.map(p => ({
      id: p.id,
      blobUrl: p.blobUrl,
      thumbnailUrl: p.thumbnailUrl,
      uploaderName: p.uploaderName,
    })),
  });
}
