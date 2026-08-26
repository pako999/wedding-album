/**
 * GET /api/cron/expire-albums
 *
 * Vercel Cron Job — runs daily at 03:00 UTC.
 * Finds albums whose expiresAt has passed and removes their external media.
 * A photos-table row is deleted only after its physical object was successfully
 * deleted (or confirmed already gone) so failed cleanup remains retryable.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { deleteStoredMedia } from "@/lib/storage/delete-media";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const expiredAlbums = await db
    .select({
      id: albums.id,
      slug: albums.slug,
      coverImageUrl: albums.coverImageUrl,
    })
    .from(albums)
    .where(sql`${albums.expiresAt} IS NOT NULL AND ${albums.expiresAt} <= ${now}`);

  if (expiredAlbums.length === 0) {
    return NextResponse.json({ message: "No expired albums", processed: 0 });
  }

  let totalDeleted = 0;
  const results: { slug: string; deleted: number; errors: number }[] = [];
  const batchSize = 10;

  for (const album of expiredAlbums) {
    const albumPhotos = await db
      .select({
        id: photos.id,
        blobUrl: photos.blobUrl,
        streamVideoId: photos.cfStreamVideoId,
        status: photos.status,
      })
      .from(photos)
      .where(eq(photos.albumId, album.id));

    let deleted = 0;
    let errors = 0;
    const failedRows: typeof albumPhotos = [];

    for (let i = 0; i < albumPhotos.length; i += batchSize) {
      const batch = albumPhotos.slice(i, i + batchSize);
      const outcomes = await Promise.allSettled(
        batch.map((photo) =>
          deleteStoredMedia({
            blobUrl: photo.blobUrl,
            streamVideoId: photo.streamVideoId,
          }),
        ),
      );

      const successfulIds: string[] = [];
      outcomes.forEach((outcome, index) => {
        const photo = batch[index];
        if (!photo) return;
        if (outcome.status === "fulfilled") {
          successfulIds.push(photo.id);
          deleted++;
        } else {
          failedRows.push(photo);
          errors++;
          console.error(
            `[expire-albums] Failed to delete external media for photo ${photo.id}:`,
            outcome.reason,
          );
        }
      });

      if (successfulIds.length > 0) {
        await db.delete(photos).where(inArray(photos.id, successfulIds));
      }
    }

    let coverDeleted = !album.coverImageUrl;
    if (album.coverImageUrl) {
      try {
        await deleteStoredMedia({ blobUrl: album.coverImageUrl });
        coverDeleted = true;
        deleted++;
      } catch (err) {
        errors++;
        console.error(`[expire-albums] Failed to delete cover for ${album.slug}:`, err);
      }
    }

    // Only rows whose external cleanup failed remain. Keep counters aligned with
    // those retryable records instead of reporting zero while media still exists.
    const remainingPublished = failedRows.filter((row) => row.status === "published").length;
    const remainingPending = failedRows.filter((row) => row.status === "pending").length;

    await db
      .update(albums)
      .set({
        photoCount: remainingPublished,
        pendingCount: remainingPending,
        ...(coverDeleted ? { coverImageUrl: null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(albums.id, album.id));

    totalDeleted += deleted;
    results.push({ slug: album.slug, deleted, errors });
    console.log(
      `[expire-albums] Album "${album.slug}": deleted ${deleted} external object(s), ${errors} error(s)`,
    );
  }

  return NextResponse.json({
    message: `Processed ${expiredAlbums.length} expired album(s)`,
    totalDeleted,
    results,
  });
}
