import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";

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

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    // Preserve previous 404 behaviour for non-owners (don't leak existence).
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
