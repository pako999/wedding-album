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
import { enqueueDeletions } from "@/lib/storage/deletion-queue";

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

    // Queue every file for durable deletion BEFORE touching the DB rows.
    // The old flow deleted the remote file inline and dropped the DB row
    // even when that failed, orphaning paid storage with no pointer. Now
    // the queue owns the physical delete with retries and a dead-letter;
    // the worker runs hourly (/api/cron/deletion-worker).
    const jobs = albumPhotos
      .map((p) =>
        p.cfStreamVideoId
          ? { provider: "bunny-stream" as const, target: p.cfStreamVideoId }
          : p.blobUrl
            ? { provider: "bunny-storage" as const, target: p.blobUrl }
            : null,
      )
      .filter((j): j is { provider: "bunny-stream" | "bunny-storage"; target: string } => j !== null);

    let queued = 0;
    try {
      queued = await enqueueDeletions(jobs);
    } catch (err) {
      // If the hand-off to the queue fails, DO NOT delete the photo rows —
      // that would strand the files. Skip this album; next run retries.
      console.error(`[expire-albums] enqueue failed for "${album.slug}", keeping rows:`, err);
      results.push({ slug: album.slug, deleted: 0, errors: jobs.length });
      continue;
    }

    // Safe to remove the rows now that deletion is durably recorded.
    await db.delete(photos).where(eq(photos.albumId, album.id));
    await db
      .update(albums)
      .set({ photoCount: 0, pendingCount: 0 })
      .where(eq(albums.id, album.id));

    totalDeleted += queued;
    results.push({ slug: album.slug, deleted: queued, errors: 0 });
    console.log(`[expire-albums] Album "${album.slug}": queued ${queued} file(s) for deletion, rows removed`);
  }

  return NextResponse.json({
    message: `Processed ${expiredAlbums.length} expired album(s)`,
    totalDeleted,
    results,
  });
}
