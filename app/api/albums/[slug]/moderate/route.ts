import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
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

  const body = await req.json().catch(() => null) as {
    photoId?: unknown;
    photoIds?: unknown;
    action?: unknown;
  } | null;
  const photoId = typeof body?.photoId === "string" ? body.photoId : "";
  const action = body?.action;
  const photoIds = Array.isArray(body?.photoIds)
    ? Array.from(new Set(body.photoIds.filter((id): id is string => typeof id === "string" && id.length > 0)))
    : [];

  if (action === "delete_many") {
    if (photoIds.length === 0 || photoIds.length > 100) {
      return NextResponse.json({ error: "Select between 1 and 100 media items" }, { status: 400 });
    }

    const selected = await db.query.photos.findMany({
      where: and(eq(photos.albumId, album.id), inArray(photos.id, photoIds)),
    });

    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    // Keep storage-provider traffic bounded. The dashboard sends larger
    // selections in batches of 25, while each request performs at most five
    // external deletions concurrently.
    for (let offset = 0; offset < selected.length; offset += 5) {
      const batch = selected.slice(offset, offset + 5);
      const results = await Promise.allSettled(batch.map(async (photo) => {
        await deleteStoredMedia({
          blobUrl: photo.blobUrl,
          streamVideoId: photo.cfStreamVideoId,
        });
        return photo.id;
      }));

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          deletedIds.push(result.value);
        } else {
          failedIds.push(batch[index].id);
          console.error(`[moderate] Bulk cleanup failed for photo ${batch[index].id}:`, result.reason);
        }
      });
    }

    const deleted = deletedIds.length > 0
      ? await db.delete(photos)
          .where(and(eq(photos.albumId, album.id), inArray(photos.id, deletedIds)))
          .returning({ id: photos.id, status: photos.status })
      : [];

    const publishedDeleted = deleted.filter((photo) => photo.status === "published").length;
    const pendingDeleted = deleted.filter((photo) => photo.status === "pending").length;

    if (deleted.length > 0) {
      await db.update(albums).set({
        photoCount: publishedDeleted > 0
          ? sql`GREATEST(${albums.photoCount} - ${publishedDeleted}, 0)`
          : albums.photoCount,
        pendingCount: pendingDeleted > 0
          ? sql`GREATEST(${albums.pendingCount} - ${pendingDeleted}, 0)`
          : albums.pendingCount,
        updatedAt: new Date(),
      }).where(eq(albums.id, album.id));
    }

    // IDs that were stale or belonged to another album are reported as failed
    // without revealing whether they exist elsewhere.
    const matchedIds = new Set(selected.map((photo) => photo.id));
    for (const requestedId of photoIds) {
      if (!matchedIds.has(requestedId)) failedIds.push(requestedId);
    }

    return NextResponse.json({
      ok: failedIds.length === 0,
      deletedCount: deleted.length,
      deletedIds: deleted.map((photo) => photo.id),
      failedIds,
    }, { status: failedIds.length > 0 ? 207 : 200 });
  }

  if (!photoId || !["approve", "reject", "delete"].includes(String(action))) {
    return NextResponse.json({ error: "Invalid moderation request" }, { status: 400 });
  }

  const photo = await db.query.photos.findFirst({
    where: and(eq(photos.id, photoId), eq(photos.albumId, album.id)),
  });
  if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

  if (action === "approve") {
    // Only pending -> published is a valid approve transition. The status is
    // included in the UPDATE predicate so double-clicks / concurrent requests
    // cannot increment counters twice.
    const changed = await db.update(photos)
      .set({ status: "published" })
      .where(and(
        eq(photos.id, photoId),
        eq(photos.albumId, album.id),
        eq(photos.status, "pending"),
      ))
      .returning({ id: photos.id });

    if (changed.length === 0) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    await db.update(albums).set({
      photoCount: sql`${albums.photoCount} + 1`,
      pendingCount: sql`GREATEST(${albums.pendingCount} - 1, 0)`,
      updatedAt: new Date(),
    }).where(eq(albums.id, album.id));
  } else if (action === "reject") {
    if (photo.status === "rejected") {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Compare-and-set on the status we actually read. If another moderator
    // changes it first, this request becomes a harmless no-op instead of
    // applying a second counter delta.
    const changed = await db.update(photos)
      .set({ status: "rejected" })
      .where(and(
        eq(photos.id, photoId),
        eq(photos.albumId, album.id),
        eq(photos.status, photo.status),
      ))
      .returning({ id: photos.id });

    if (changed.length === 0) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    await db.update(albums).set({
      photoCount: photo.status === "published"
        ? sql`GREATEST(${albums.photoCount} - 1, 0)`
        : albums.photoCount,
      pendingCount: photo.status === "pending"
        ? sql`GREATEST(${albums.pendingCount} - 1, 0)`
        : albums.pendingCount,
      updatedAt: new Date(),
    }).where(eq(albums.id, album.id));
  } else if (action === "delete") {
    // Never remove the durable DB pointer until the physical object is gone.
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

    // Only the request that actually deletes the row adjusts counters.
    const deleted = await db.delete(photos)
      .where(and(eq(photos.id, photoId), eq(photos.albumId, album.id)))
      .returning({ status: photos.status });

    if (deleted.length === 0) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    const deletedStatus = deleted[0].status;
    await db.update(albums).set({
      photoCount: deletedStatus === "published"
        ? sql`GREATEST(${albums.photoCount} - 1, 0)`
        : albums.photoCount,
      pendingCount: deletedStatus === "pending"
        ? sql`GREATEST(${albums.pendingCount} - 1, 0)`
        : albums.pendingCount,
      updatedAt: new Date(),
    }).where(eq(albums.id, album.id));
  }

  return NextResponse.json({ ok: true });
}
