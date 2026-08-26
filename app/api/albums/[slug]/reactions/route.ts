import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photoLikes, photoComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/reactions
 *
 * Returns all likes and comments for every photo in this album in one round-trip.
 * Open link/QR albums work without a password. Protected albums use the same
 * HttpOnly access cookie as the gallery, so raw passwords never need to live in
 * Client Component props or request URLs.
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

  const [likes, comments] = await Promise.all([
    db.query.photoLikes
      .findMany({ where: eq(photoLikes.albumId, album.id) })
      .catch(() => []),
    db.query.photoComments
      .findMany({
        where: eq(photoComments.albumId, album.id),
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
