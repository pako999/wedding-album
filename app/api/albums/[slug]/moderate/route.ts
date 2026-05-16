import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });

  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { photoId, action } = await req.json();

  const photo = await db.query.photos.findFirst({
    where: and(eq(photos.id, photoId), eq(photos.albumId, album.id)),
  });

  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  if (action === "approve") {
    await db.update(photos).set({ status: "published" }).where(eq(photos.id, photoId));
    // Update counts
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
