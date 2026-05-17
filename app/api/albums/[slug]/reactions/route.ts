import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photoLikes, photoComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/reactions
 *
 * Returns all likes and comments for every photo in this album in one round-trip.
 * Shape:
 *   {
 *     likes:    { [photoId]: number }          // total like count
 *     comments: { [photoId]: CommentItem[] }   // newest-last
 *   }
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);

  if (!album) {
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

  // Aggregate likes → { photoId: count }
  const likesMap: Record<string, number> = {};
  for (const l of likes) {
    likesMap[l.photoId] = (likesMap[l.photoId] ?? 0) + 1;
  }

  // Group comments → { photoId: CommentItem[] }
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
