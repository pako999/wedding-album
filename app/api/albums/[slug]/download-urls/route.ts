/**
 * GET /api/albums/:slug/download-urls
 *
 * Returns a JSON list of { name, url } for every published photo/video
 * in the album.  The client-side downloader uses this list to fetch files
 * directly from the CDN and stream them into a ZIP (client-zip).
 *
 * URLs returned are /api/img?key=… proxy URLs so the browser can fetch
 * them (same-origin, auth via server config). For Bunny Stream videos
 * we skip them (they are not stored in Bunny Storage).
 *
 * Owner-only — requires Clerk session.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { bunnyOriginalUrl } from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }

  const albumPhotos = await db.query.photos.findMany({
    where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
    orderBy: (p, { asc }) => [asc(p.uploadedAt)],
  });

  let imgIdx = 1;
  let vidIdx = 1;

  const files = albumPhotos
    .filter((p) => !p.cfStreamVideoId) // skip Bunny Stream — not in storage
    .map((photo) => {
      const isVideo = photo.mimeType?.startsWith("video/") ?? false;
      const ext = photo.mimeType?.split("/")[1] ?? (isVideo ? "mp4" : "jpg");
      const defaultName = isVideo
        ? `video-${String(vidIdx).padStart(3, "0")}.${ext}`
        : `foto-${String(imgIdx).padStart(3, "0")}.${ext}`;
      const name = photo.originalFilename ?? defaultName;

      if (isVideo) vidIdx++; else imgIdx++;

      return {
        name: isVideo ? `videos/${name}` : `photos/${name}`,
        url: bunnyOriginalUrl(photo.blobUrl),
      };
    });

  return NextResponse.json({ files, albumName: album.coupleName, slug: album.slug });
}
