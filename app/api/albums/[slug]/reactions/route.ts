import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, photoLikes, photoComments } from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/reactions
 *
 * Returns likes/comments only for media that is currently published in the
 * album. Open link/QR albums work without a password; protected albums use the
 * same HttpOnly access cookie as the guest gallery.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);

  if (!album || !album.isPublished) {
    return NextResponse.json({ likes: {}, comments: {} });
  }

  if (!(await hasAlbumRequestAccess(req, slug, album))) {
    return NextResponse.json({ likes: {}, comments: {} });
  }

  const published = await db
    .select({ id: photos.id })
    .from(photos)
    .where(and(eq(photos.albumId, album.id), eq(photos.status, "published")))
    .catch(() => []);
  const publishedIds = published.map((photo) => photo.id);

  if (publishedIds.length === 0) {
    return NextResponse.json({ likes: {}, comments: {} });
  }

  const [likes, comments] = await Promise.all([
    db.query.photoLikes
      .findMany({
        where: and(
          eq(photoLikes.albumId, album.id),
          inArray(photoLikes.photoId, publishedIds),
        ),
      })
      .catch(() => []),
    db.query.photoComments
      .findMany({
        where: and(
          eq(photoComments.albumId, album.id),
          inArray(photoComments.photoId, publishedIds),
        ),
        orderBy: (c, { asc }) => [asc(c.createdAt)],
      })
      .catch(() => []),
  ]);

  const likesMap: Record<string, number> = {};
  for (const l of likes) {
    likesMap[l.photoId] = (likesMap[l.photoId] ?? 0) + 1;
  }

  const commentsMap: Record<
    string,
    { id: string; uploaderName: string; body: string; createdAt: string }[]
  > = {};
  for (const c of comments) {
    if (!commentsMap[c.photoId]) commentsMap[c.photoId] = [];
    commentsMap[c.photoId].push({
      id: c.id,
      uploaderName: c.uploaderName,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    });
  }

  return NextResponse.json({ likes: likesMap, comments: commentsMap });
}
