/**
 * DELETE /api/albums/:slug/delete
 *
 * Permanently deletes an album and all externally stored media.
 * Only the album owner can perform this action.
 * Requires { confirm: "<slug>" } in the request body as a second safety check.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { deleteStoredMedia } from "@/lib/storage/delete-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function cleanupAlbumMedia(albumId: string, coverImageUrl: string | null) {
  const rows = await db
    .select({
      id: photos.id,
      blobUrl: photos.blobUrl,
      streamVideoId: photos.cfStreamVideoId,
    })
    .from(photos)
    .where(eq(photos.albumId, albumId));

  const refs = [
    ...rows.map((row) => ({
      label: `photo:${row.id}`,
      blobUrl: row.blobUrl,
      streamVideoId: row.streamVideoId,
    })),
    ...(coverImageUrl
      ? [{ label: "cover", blobUrl: coverImageUrl, streamVideoId: null }]
      : []),
  ];

  const failures: string[] = [];
  const batchSize = 10;

  for (let i = 0; i < refs.length; i += batchSize) {
    const batch = refs.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((ref) => deleteStoredMedia(ref)),
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const label = batch[index]?.label ?? "unknown";
        failures.push(label);
        console.error(`[album-delete] External cleanup failed for ${label}:`, result.reason);
      }
    });
  }

  return { total: refs.length, failures };
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let body: { confirm?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.confirm !== slug) {
    return NextResponse.json(
      { error: "Confirmation text does not match album name" },
      { status: 400 },
    );
  }

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // External storage must be cleaned before the FK cascade removes the only
  // durable references to those objects. If any provider fails, leave the DB
  // intact so the cleanup can be safely retried.
  const cleanup = await cleanupAlbumMedia(album.id, album.coverImageUrl);
  if (cleanup.failures.length > 0) {
    return NextResponse.json(
      {
        error: "Media cleanup failed; album was not deleted",
        code: "media_cleanup_failed",
        failed: cleanup.failures.length,
        total: cleanup.total,
      },
      { status: 502 },
    );
  }

  await db.delete(albums).where(eq(albums.slug, slug));

  return NextResponse.json({ deleted: true, mediaDeleted: cleanup.total });
}
