/**
 * GET /api/albums/:slug/download-urls
 *
 * Returns a JSON list of { name, url } for every published photo/video
 * in the album. The client-side downloader uses this list to fetch
 * files directly from the CDN and stream them into a ZIP (client-zip).
 *
 * Photos                       → Bunny Storage via /api/img proxy.
 * Bunny Stream videos          → our own /api/.../video-download proxy.
 *   The proxy does the authenticated Bunny API lookup, picks the
 *   highest available MP4 resolution, and streams it back. Goes
 *   through one extra hop but is bulletproof to: missing
 *   BUNNY_STREAM_CDN_URL, no 720p fallback (small phone clips),
 *   wrong pull-zone URL, MP4 Fallback recently enabled.
 * Local/uploaded videos        → bunnyOriginalUrl (same as photos).
 *
 * Owner-only via checkAlbumOwnership (Clerk id OR verified-email match).
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  bunnyOriginalUrl,
  isBunnyStreamConfigured,
} from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
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
  const streamConfigured = isBunnyStreamConfigured();

  // Same-origin URL the client will fetch. Using req.nextUrl.origin keeps
  // the proxy hop within the current domain (works for both www and apex).
  const origin = req.nextUrl.origin;

  const files: { name: string; url: string }[] = [];
  const skipped: { count: number; reason: string }[] = [];
  let streamSkipUnconfigured = 0;

  for (const photo of albumPhotos) {
    const isStreamVideo = !!photo.cfStreamVideoId;
    const isLocalVideo  = !isStreamVideo && (photo.mimeType?.startsWith("video/") ?? false);
    const isVideo       = isStreamVideo || isLocalVideo;

    let url: string | null = null;
    let extOverride: string | null = null;

    if (isStreamVideo) {
      if (!streamConfigured) {
        // BUNNY_STREAM_API_KEY / LIBRARY_ID missing — the proxy can't
        // authenticate so it would 503. Skip and surface why.
        streamSkipUnconfigured++;
        continue;
      }
      // Hit our own server proxy. It does the Bunny API lookup +
      // resolution picking + range-streamed pass-through. The /api/img
      // proxy pattern (used for photos) handles auth + CDN bypass; this
      // is the same idea for videos.
      url = `${origin}/api/albums/${slug}/video-download?vid=${encodeURIComponent(photo.cfStreamVideoId!)}`;
      extOverride = "mp4";
    } else {
      url = bunnyOriginalUrl(photo.blobUrl);
    }

    if (!url) continue;

    const ext = extOverride
      ?? photo.mimeType?.split("/")[1]
      ?? (isVideo ? "mp4" : "jpg");
    const defaultName = isVideo
      ? `video-${String(vidIdx).padStart(3, "0")}.${ext}`
      : `foto-${String(imgIdx).padStart(3, "0")}.${ext}`;
    let name = photo.originalFilename ?? defaultName;
    if (isStreamVideo) {
      name = name.replace(/\.[^.]+$/, "") + ".mp4";
    }

    if (isVideo) vidIdx++; else imgIdx++;

    files.push({
      name: isVideo ? `videos/${name}` : `photos/${name}`,
      url,
    });
  }

  if (streamSkipUnconfigured > 0) {
    const reason =
      "Bunny Stream API not configured (BUNNY_STREAM_API_KEY / BUNNY_STREAM_LIBRARY_ID). " +
      "Set these in Vercel so the server can authenticate against the Bunny Stream API.";
    console.warn(`[download-urls] ${streamSkipUnconfigured} stream video(s) skipped — ${reason}`);
    skipped.push({ count: streamSkipUnconfigured, reason });
  }

  return NextResponse.json({
    files,
    albumName: album.coupleName,
    slug: album.slug,
    skipped,
  });
}
