import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { deleteStoredMedia } from "@/lib/storage/delete-media";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }
  if (!album) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { photoId, action } = await req.json();

  const photo = await db.query.photos.findFirst({
    where: and(eq(photos.id, photoId), eq(photos.albumId, album.id)),
  });

  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  if (action === "approve") {
    await db.update(photos).set({ status: "published" }).where(eq(photos.id, photoId));
    await db.update(albums).set({
      photoCount: sql`${albums.photoCount} + 1`,
      pendingCount: sql`GREATEST(${albums.pendingCount} - 1, 0)`,
      updatedAt: new Date(),
    }).where(eq(albums.id, album.id));
  } else if (action === "reject") {
    const wasPublished = photo.status === "published";
    await db.update(photos).set({ status: "rejected" }).where(eq(photos.id, photoId));
    await db.update(albums).set({
      photoCount: wasPublished ? sql`GREATEST(${albums.photoCount} - 1, 0)` : albums.photoCount,
      pendingCount: !wasPublished ? sql`GREATEST(${albums.pendingCount} - 1, 0)` : albums.pendingCount,
      updatedAt: new Date(),
    }).where(eq(albums.id, album.id));
  } else if (action === "delete") {
    // Never remove the DB row until the physical object is gone. The row is the
    // only durable pointer we can use to retry cleanup after a provider outage.
    try {
      await deleteStoredMedia({
        blobUrl: photo.blobUrl,
        streamVideoId: photo.cfStreamVideoId,
      });
    } catch (err) {
      console.error(`[moderate] External cleanup failed for photo ${photo.id}:`, err);
      return NextResponse.json(
        { error: "Media cleanup failed; photo was not deleted", code: "media_cleanup_failed" },
        { status: 502 },
      );
    }

    const wasPublished = photo.status === "published";
    const wasPending = photo.status === "pending";
    await db.delete(photos).where(eq(photos.id, photoId));
    await db.update(albums).set({
      photoCount: wasPublished ? sql`GREATEST(${albums.photoCount} - 1, 0)` : albums.photoCount,
      pendingCount: wasPending ? sql`GREATEST(${albums.pendingCount} - 1, 0)` : albums.pendingCount,
      updatedAt: new Date(),
    }).where(eq(albums.id, album.id));
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
