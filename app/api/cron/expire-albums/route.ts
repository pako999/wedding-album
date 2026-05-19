/**
 * GET /api/cron/expire-albums
 *
 * Vercel Cron Job — runs daily at 03:00 UTC.
 * Finds albums whose expiresAt has passed, deletes all photos/videos
 * from Bunny Storage/Stream, then removes them from the DB.
 *
 * Protected with CRON_SECRET env var (set in Vercel dashboard).
 * Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on cron calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { deleteBunnyFile, deleteBunnyStreamVideo } from "@/lib/storage/bunny";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — enough for large albums

export async function GET(req: NextRequest) {
  // Verify cron secret — fail closed if CRON_SECRET is not configured.
  // This endpoint deletes photos, so it must never run unauthenticated.
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all expired albums that still have photos
  const expiredAlbums = await db
    .select({ id: albums.id, slug: albums.slug, photoCount: albums.photoCount })
    .from(albums)
    .where(
      // expiresAt IS NOT NULL AND expiresAt <= now
      sql`${albums.expiresAt} IS NOT NULL AND ${albums.expiresAt} <= ${now}`,
    );

  if (expiredAlbums.length === 0) {
    return NextResponse.json({ message: "No expired albums", processed: 0 });
  }

  let totalDeleted = 0;
  const results: { slug: string; deleted: number; errors: number }[] = [];

  for (const album of expiredAlbums) {
    if ((album.photoCount ?? 0) === 0) continue;

    // Load all photos for this album
    const albumPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.albumId, album.id));

    let deleted = 0;
    let errors = 0;

    for (const photo of albumPhotos) {
      try {
        if (photo.cfStreamVideoId) {
          // Bunny Stream video
          await deleteBunnyStreamVideo(photo.cfStreamVideoId);
        } else if (photo.blobUrl) {
          // Bunny Storage file
          await deleteBunnyFile(photo.blobUrl);
        }
        deleted++;
      } catch (err) {
        console.error(`[expire-albums] Failed to delete file for photo ${photo.id}:`, err);
        errors++;
      }
    }

    // Delete all photos from DB for this album
    await db.delete(photos).where(eq(photos.albumId, album.id));

    // Reset album photo/pending counts
    await db
      .update(albums)
      .set({ photoCount: 0, pendingCount: 0 })
      .where(eq(albums.id, album.id));

    totalDeleted += deleted;
    results.push({ slug: album.slug, deleted, errors });
    console.log(`[expire-albums] Album "${album.slug}": deleted ${deleted} files, ${errors} errors`);
  }

  return NextResponse.json({
    message: `Processed ${expiredAlbums.length} expired album(s)`,
    totalDeleted,
    results,
  });
}
