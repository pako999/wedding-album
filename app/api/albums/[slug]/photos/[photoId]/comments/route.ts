import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, photoComments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * POST /api/albums/[slug]/photos/[photoId]/comments
 * Body: { uploaderName: string; body: string }
 * Returns: the new comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  const { slug, photoId } = await params;
  const { uploaderName, body } = await req.json() as {
    uploaderName: string;
    body: string;
  };

  if (!uploaderName?.trim()) {
    return NextResponse.json({ error: "uploaderName required" }, { status: 400 });
  }
  if (!body?.trim() || body.trim().length > 500) {
    return NextResponse.json({ error: "body required (max 500 chars)" }, { status: 400 });
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const photo = await db.query.photos
    .findFirst({ where: and(eq(photos.id, photoId), eq(photos.albumId, album.id)) })
    .catch(() => null);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [comment] = await db
    .insert(photoComments)
    .values({
      photoId,
      albumId: album.id,
      uploaderName: uploaderName.trim(),
      body: body.trim(),
    })
    .returning();

  return NextResponse.json({
    id: comment.id,
    uploaderName: comment.uploaderName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  });
}
