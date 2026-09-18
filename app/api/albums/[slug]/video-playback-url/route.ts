import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";
import { createVideoPlaybackToken } from "@/lib/video-playback-token";
import {
  bunnyStreamIframeUrl,
  getBunnyStreamVideo,
  isBunnyStreamConfigured,
  isBunnyStreamVideoReady,
} from "@/lib/storage/bunny";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Return a short-lived same-origin Guestcam playback URL for a Bunny Stream
 * video that belongs to this published album.
 *
 * Existing and newly uploaded Bunny Stream videos use the same reliable
 * Guestcam MP4/Range proxy. Link-only albums need no password. Protected
 * albums are authorized through the encrypted HttpOnly album-access cookie
 * (or the legacy x-album-password header for backwards compatibility), so the
 * password never needs to appear in the browser URL.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const vid = req.nextUrl.searchParams.get("vid") ?? "";

  if (!vid) {
    return NextResponse.json({ error: "Missing vid" }, { status: 400 });
  }

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!(await hasAlbumRequestAccess(req, slug, album))) {
    return NextResponse.json({ error: "Password required" }, { status: 403 });
  }

  const photo = await db.query.photos.findFirst({
    where: and(
      eq(photos.albumId, album.id),
      eq(photos.cfStreamVideoId, vid),
      eq(photos.status, "published"),
    ),
  });

  if (!photo) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // A Bunny Stream upload is visible in the album as soon as its metadata is
  // saved, but transcoding can continue for another minute or two. Do not hand
  // the browser a video URL that will immediately fail with HTTP 425. The
  // gallery polls this lightweight readiness endpoint and starts playback as
  // soon as Bunny reports the video as ready.
  if (!isBunnyStreamConfigured()) {
    return NextResponse.json({ error: "Video playback unavailable" }, { status: 503 });
  }

  const meta = await getBunnyStreamVideo(vid);
  if (!meta) {
    return NextResponse.json({ error: "Video status unavailable" }, { status: 503 });
  }
  if (!isBunnyStreamVideoReady(meta)) {
    return NextResponse.json(
      { error: "Video is still processing", processing: true },
      { status: 425, headers: { "Retry-After": "5", "Cache-Control": "no-store" } },
    );
  }

  // Bunny's status-8/JIT pipeline serves HLS through its player, but it does
  // not necessarily create the optional play_<resolution>.mp4 fallback files.
  // Sending those videos to the MP4 proxy produces a permanent 404 even though
  // the video is fully playable. Use Bunny's responsive player for that case.
  // The explicit mp4Fallback flag also covers status-4 libraries where the
  // optional MP4 fallback feature is disabled.
  const iframeUrl = bunnyStreamIframeUrl(vid);
  if (meta.status === 8 || meta.mp4Fallback === false) {
    return NextResponse.json(
      { url: iframeUrl, playbackType: "iframe" as const },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } },
    );
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const sig = createVideoPlaybackToken(slug, vid, expiresAt);
  if (!sig) {
    return NextResponse.json({ error: "Playback signing unavailable" }, { status: 503 });
  }

  const qs = new URLSearchParams({
    vid,
    play: "1",
    exp: String(expiresAt),
    sig,
  });

  return NextResponse.json(
    {
      url: `/api/albums/${encodeURIComponent(slug)}/video-download?${qs.toString()}`,
      playbackType: "video" as const,
      fallbackUrl: iframeUrl,
      expiresAt,
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
