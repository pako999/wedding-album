import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, photoLikes } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * POST /api/albums/[slug]/photos/[photoId]/like
 * Body: { uploaderName: string; action: "like" | "unlike" }
 * Returns: { liked: boolean; count: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  const { slug, photoId } = await params;
  const { uploaderName, action } = await req.json() as {
    uploaderName: string;
    action: "like" | "unlike";
  };

  if (!uploaderName?.trim()) {
    return NextResponse.json({ error: "uploaderName required" }, { status: 400 });
  }

  // Verify photo belongs to this album
  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const photo = await db.query.photos
    .findFirst({ where: and(eq(photos.id, photoId), eq(photos.albumId, album.id)) })
    .catch(() => null);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "unlike") {
    await db
      .delete(photoLikes)
      .where(
        and(eq(photoLikes.photoId, photoId), eq(photoLikes.uploaderName, uploaderName.trim()))
      )
      .catch(() => null);
  } else {
    // INSERT ... ON CONFLICT DO NOTHING (unique constraint handles duplicates)
    await db
      .insert(photoLikes)
      .values({ photoId, albumId: album.id, uploaderName: uploaderName.trim() })
      .onConflictDoNothing()
      .catch(() => null);
  }

  // Return fresh count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(photoLikes)
    .where(eq(photoLikes.photoId, photoId));

  return NextResponse.json({ liked: action === "like", count: Number(total) });
}
