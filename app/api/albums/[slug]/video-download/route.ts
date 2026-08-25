/**
 * GET /api/albums/:slug/video-download?vid=<bunnyVideoId>
 *
 * Streams a Bunny Stream MP4 through Guestcam with Range support.
 *
 * Two authorization modes:
 *   • normal owner-authenticated mode for ZIP/download flows;
 *   • short-lived signed `play=1` mode for guest playback on iOS Safari.
 *
 * The signed playback mode exists because iPhone/iPad Safari can fail direct
 * Bunny media requests when Stream security/referrer rules are enabled. The
 * browser talks only to guestcam.si; this route fetches Bunny server-side and
 * forwards byte ranges required by Apple's native video player.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getBunnyStreamVideo,
  pickBestMp4Url,
  isBunnyStreamConfigured,
  signBunnyStreamUrl,
} from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { verifyVideoPlaybackToken } from "@/lib/video-playback-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    if (!isBunnyStreamConfigured()) {
      return NextResponse.json(
        { error: "BUNNY_STREAM_API_KEY / BUNNY_STREAM_LIBRARY_ID not configured" },
        { status: 503 },
      );
    }

    const { slug } = await params;
    const vid = req.nextUrl.searchParams.get("vid");
    if (!vid) return NextResponse.json({ error: "Missing vid" }, { status: 400 });

    const playbackMode = req.nextUrl.searchParams.get("play") === "1";
    const expiresAt = Number(req.nextUrl.searchParams.get("exp") ?? "0");
    const playbackToken = req.nextUrl.searchParams.get("sig") ?? "";

    const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (playbackMode) {
      // Guest playback is allowed only for an active published album and only
      // with the short-lived server-generated HMAC token embedded in a gallery
      // response that already passed the album's password gate.
      if (!album.isPublished) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (!verifyVideoPlaybackToken(slug, vid, expiresAt, playbackToken)) {
        return NextResponse.json({ error: "Invalid or expired playback token" }, { status: 403 });
      }
    } else {
      // Existing ZIP/download flow remains owner/admin only.
      const owner = await checkAlbumOwnership(album);
      if (!owner.ok) return NextResponse.json({ error: owner.error }, { status: owner.status });
    }

    // Confirm this video belongs to this album. Guest playback additionally
    // requires the row itself to be published.
    const photo = await db.query.photos.findFirst({
      where: playbackMode
        ? and(
            eq(photos.albumId, album.id),
            eq(photos.cfStreamVideoId, vid),
            eq(photos.status, "published"),
          )
        : and(eq(photos.albumId, album.id), eq(photos.cfStreamVideoId, vid)),
    });
    if (!photo) {
      return NextResponse.json({ error: "Video not in this album" }, { status: 404 });
    }

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
            "or Bunny Stream library has no MP4 fallback resolutions.",
          availableResolutions: meta.availableResolutions,
        },
        { status: 502 },
      );
    }

    const fetchUrl = await signBunnyStreamUrl(best.url);

    let upstream: Response;
    try {
      const upstreamHeaders: Record<string, string> = {};
      const range = req.headers.get("range");
      if (range) upstreamHeaders.range = range;
      upstream = await fetch(fetchUrl, {
        headers: upstreamHeaders,
        cache: "no-store",
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[video-download] upstream fetch threw for ${best.url}:`, detail);
      return NextResponse.json(
        { error: `Bunny CDN fetch failed: ${detail.slice(0, 200)}`, url: best.url },
        { status: 502 },
      );
    }

    if (!upstream.ok && upstream.status !== 206) {
      const body = await upstream.text().catch(() => "");
      console.error(
        `[video-download] Bunny CDN ${upstream.status} for ${best.url} — body:`,
        body.slice(0, 200),
      );
      let hint =
        "Most common cause: MP4 Fallback is OFF in the Bunny Stream library settings.";
      try {
        const host = new URL(best.url).hostname;
        if (!host.startsWith("vz-")) {
          hint =
            `BUNNY_STREAM_CDN_URL appears to be set to "${host}" — expected the Stream CDN hostname starting with vz-.`;
        } else if (upstream.status === 403) {
          if (!process.env.BUNNY_STREAM_SECURITY_KEY) {
            hint =
              "Token Authentication is ON in Bunny Stream but BUNNY_STREAM_SECURITY_KEY is not configured in Vercel.";
          } else {
            hint =
              "Bunny rejected the signed request. Re-check the Stream token key and any Referrer / IP / Geo restrictions.";
          }
        }
      } catch { /* keep default hint */ }
      return NextResponse.json(
        {
          error: `Bunny CDN returned ${upstream.status} for ${best.res} MP4. ${hint}`,
          url: best.url,
          upstreamBody: body.slice(0, 200),
        },
        { status: 502 },
      );
    }

    if (!upstream.body) {
      return NextResponse.json(
        { error: "Bunny CDN returned a response with no body", url: best.url },
        { status: 502 },
      );
    }

    const downloadName =
      (photo.originalFilename ?? `video-${vid}`).replace(/\.[^.]+$/, "") + ".mp4";

    const outHeaders = new Headers();
    outHeaders.set("Content-Type", upstream.headers.get("content-type") ?? "video/mp4");
    outHeaders.set(
      "Content-Disposition",
      `${playbackMode ? "inline" : "attachment"}; filename="${downloadName.replace(/[^\w.\-]+/g, "_")}"`,
    );
    outHeaders.set("Accept-Ranges", upstream.headers.get("accept-ranges") ?? "bytes");
    outHeaders.set("Cache-Control", "private, no-store, max-age=0");

    const len = upstream.headers.get("content-length");
    if (len) outHeaders.set("Content-Length", len);
    const cr = upstream.headers.get("content-range");
    if (cr) outHeaders.set("Content-Range", cr);

    return new Response(upstream.body, {
      status: upstream.status,
      headers: outHeaders,
    });
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("[video-download] unhandled error:", detail, err);
    return NextResponse.json(
      { error: `Video proxy crashed: ${detail.slice(0, 300)}` },
      { status: 500 },
    );
  }
}
