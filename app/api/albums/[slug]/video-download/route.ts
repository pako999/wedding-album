/**
 * GET /api/albums/:slug/video-download?vid=<bunnyVideoId>
 *
 * Owner-authenticated proxy that streams a Bunny Stream video back to
 * the client. Used by the ZIP downloader as a robust fallback for
 * every case where the public CDN URL doesn't work:
 *   • BUNNY_STREAM_CDN_URL env var not set (or set to the wrong pull zone)
 *   • Video has no 720p MP4 fallback (originals below 720p, or newly-
 *     enabled MP4 Fallback that hasn't reprocessed old uploads yet)
 *   • Bunny library's MP4 Fallback toggle is on but Bunny's CDN edge
 *     is serving stale 404s for a few minutes after enable
 *
 * Works by:
 *   1. Fetching the video metadata via Bunny Stream API (authenticated)
 *      to learn which resolutions Bunny actually transcoded.
 *   2. Building the best CDN MP4 URL from that list and fetching it,
 *      then streaming the response straight to the client. No buffering
 *      → no Vercel memory limit hit even for multi-GB videos.
 *   3. If the CDN MP4 also 404s (MP4 Fallback genuinely off in the
 *      library), returns a 502 with a clear message naming the toggle.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getBunnyStreamVideo,
  pickBestMp4Url,
  isBunnyStreamConfigured,
} from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — large guest videos take time

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isBunnyStreamConfigured()) {
    return NextResponse.json(
      { error: "BUNNY_STREAM_API_KEY / BUNNY_STREAM_LIBRARY_ID not configured" },
      { status: 503 },
    );
  }

  const { slug } = await params;
  const vid = req.nextUrl.searchParams.get("vid");
  if (!vid) return NextResponse.json({ error: "Missing vid" }, { status: 400 });

  // Auth — album owner or platform admin only. We don't want the proxy
  // to be a free unauthenticated CDN egress for every guest.
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) return NextResponse.json({ error: owner.error }, { status: owner.status });

  // Confirm this videoId actually belongs to this album — otherwise an
  // admin could be tricked into proxying any video in our Bunny library.
  const photo = await db.query.photos.findFirst({
    where: and(eq(photos.albumId, album.id), eq(photos.cfStreamVideoId, vid)),
  });
  if (!photo) {
    return NextResponse.json({ error: "Video not in this album" }, { status: 404 });
  }

  // Find which MP4 resolutions Bunny actually transcoded.
  const meta = await getBunnyStreamVideo(vid);
  if (!meta) {
    return NextResponse.json(
      { error: "Bunny Stream metadata fetch failed (check BUNNY_STREAM_API_KEY)" },
      { status: 502 },
    );
  }
  if (meta.status !== 4) {
    return NextResponse.json(
      { error: `Video still processing (Bunny status ${meta.status})` },
      { status: 425 },
    );
  }

  const best = pickBestMp4Url(vid, meta.availableResolutions);
  if (!best) {
    return NextResponse.json(
      {
        error:
          "No MP4 fallback URL available. Either BUNNY_STREAM_CDN_URL is unset " +
          "or Bunny Stream library has no `mp4Fallback` resolutions (enable " +
          "'MP4 Fallback' in the Bunny library settings; existing videos may " +
          "need to be reprocessed).",
        availableResolutions: meta.availableResolutions,
      },
      { status: 502 },
    );
  }

  // Stream the file back. We pass through the Range header so clients
  // that resume downloads still work.
  const upstreamHeaders: Record<string, string> = {};
  const range = req.headers.get("range");
  if (range) upstreamHeaders.range = range;

  const upstream = await fetch(best.url, { headers: upstreamHeaders });
  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json(
      {
        error: `Bunny CDN returned ${upstream.status} for ${best.res} MP4. ` +
               "Most common cause: MP4 Fallback is OFF in the library settings " +
               "(Bunny dashboard → Stream → Libraries → your library → toggle " +
               "'Enable MP4 Fallback'). Existing videos may need a re-encode.",
        url: best.url,
      },
      { status: 502 },
    );
  }

  // Filename — Content-Disposition so browsers + client-zip both pick it up.
  const downloadName =
    (photo.originalFilename ?? `video-${vid}`).replace(/\.[^.]+$/, "") + ".mp4";

  const outHeaders = new Headers();
  outHeaders.set("Content-Type", "video/mp4");
  outHeaders.set(
    "Content-Disposition",
    `attachment; filename="${downloadName.replace(/[^\w.\-]+/g, "_")}"`,
  );
  const len = upstream.headers.get("content-length");
  if (len) outHeaders.set("Content-Length", len);
  const cr = upstream.headers.get("content-range");
  if (cr) outHeaders.set("Content-Range", cr);
  const ar = upstream.headers.get("accept-ranges");
  if (ar) outHeaders.set("Accept-Ranges", ar);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}
