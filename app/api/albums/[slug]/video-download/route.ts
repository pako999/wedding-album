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
 * browser talks only to Guestcam; this route fetches Bunny server-side and
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

const MP4_RES_ORDER = ["1080p", "720p", "480p", "360p", "240p"];

function buildMp4Candidates(
  best: { url: string; res: string },
  availableResolutions: string,
): Array<{ url: string; res: string }> {
  const present = new Set(
    availableResolutions.split(",").map((s) => s.trim()).filter(Boolean),
  );
  const base = best.url.replace(/\/play_[^/]+\.mp4$/, "");
  const ordered = MP4_RES_ORDER.filter((res) => present.has(res));

  // Keep the picker result first even if Bunny returns an unexpected resolution
  // string, then try progressively smaller renditions on upstream 404s.
  const candidates = [
    best,
    ...ordered
      .filter((res) => res !== best.res)
      .map((res) => ({ url: `${base}/play_${res}.mp4`, res })),
  ];

  return candidates.filter(
    (candidate, index, all) => all.findIndex((item) => item.url === candidate.url) === index,
  );
}

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
    const requestedRange = req.headers.get("range");

    // Temporary low-noise diagnostics for the iOS playback path. This tells us
    // whether Safari reached the route and whether it sent the byte-range that
    // Apple's media stack normally requires. No album/user PII is logged.
    if (playbackMode) {
      console.info("[video-playback] request", {
        video: vid.slice(0, 8),
        range: requestedRange ?? "none",
        ua: (req.headers.get("user-agent") ?? "").slice(0, 160),
      });
    }

    const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
    if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (playbackMode) {
      if (!album.isPublished) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (!verifyVideoPlaybackToken(slug, vid, expiresAt, playbackToken)) {
        console.warn("[video-playback] rejected token", { video: vid.slice(0, 8) });
        return NextResponse.json({ error: "Invalid or expired playback token" }, { status: 403 });
      }
    } else {
      const owner = await checkAlbumOwnership(album);
      if (!owner.ok) return NextResponse.json({ error: owner.error }, { status: owner.status });
    }

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

    const candidates = buildMp4Candidates(best, meta.availableResolutions);
    const upstreamHeaders: Record<string, string> = {};
    if (requestedRange) upstreamHeaders.range = requestedRange;

    let upstream: Response | null = null;
    let selected = best;
    let lastStatus = 0;
    let lastBody = "";

    for (const candidate of candidates) {
      const fetchUrl = await signBunnyStreamUrl(candidate.url);
      let response: Response;

      try {
        response = await fetch(fetchUrl, {
          headers: upstreamHeaders,
          cache: "no-store",
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error(`[video-download] upstream fetch threw for ${candidate.url}:`, detail);
        return NextResponse.json(
          { error: `Bunny CDN fetch failed: ${detail.slice(0, 200)}`, url: candidate.url },
          { status: 502 },
        );
      }

      if (response.ok || response.status === 206) {
        upstream = response;
        selected = candidate;
        break;
      }

      lastStatus = response.status;
      lastBody = await response.text().catch(() => "");
      selected = candidate;

      if (response.status === 404) {
        const hasNext = candidate !== candidates[candidates.length - 1];
        if (hasNext) {
          console.warn(
            `[video-download] Bunny CDN 404 for ${candidate.res}; trying lower MP4 rendition`,
            { video: vid.slice(0, 8) },
          );
          continue;
        }
      }

      // Authentication, range, and upstream server errors are not resolution-specific.
      // Do not mask them by trying every rendition.
      break;
    }

    if (!upstream) {
      if (lastStatus === 404) {
        console.warn("[video-download] no generated Bunny MP4 rendition available", {
          video: vid.slice(0, 8),
          attemptedResolutions: candidates.map((candidate) => candidate.res),
        });
        return NextResponse.json(
          {
            error:
              "No generated MP4 rendition is currently available for this video. " +
              "Bunny MP4 Fallback may still be processing or may be disabled.",
            attemptedResolutions: candidates.map((candidate) => candidate.res),
          },
          { status: 404 },
        );
      }

      console.error(
        `[video-download] Bunny CDN ${lastStatus} for ${selected.url} — body:`,
        lastBody.slice(0, 200),
      );
      let hint =
        "Most common cause: MP4 Fallback is OFF in the Bunny Stream library settings.";
      try {
        const host = new URL(selected.url).hostname;
        if (!host.startsWith("vz-")) {
          hint =
            `BUNNY_STREAM_CDN_URL appears to be set to "${host}" — expected the Stream CDN hostname starting with vz-.`;
        } else if (lastStatus === 403) {
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
          error: `Bunny CDN returned ${lastStatus} for ${selected.res} MP4. ${hint}`,
          url: selected.url,
          upstreamBody: lastBody.slice(0, 200),
        },
        { status: 502 },
      );
    }

    if (playbackMode) {
      console.info("[video-playback] upstream", {
        video: vid.slice(0, 8),
        status: upstream.status,
        selectedResolution: selected.res,
        rangeRequested: requestedRange ?? "none",
        contentType: upstream.headers.get("content-type") ?? "none",
        contentRange: upstream.headers.get("content-range") ?? "none",
        contentLength: upstream.headers.get("content-length") ?? "none",
      });
    }

    if (!upstream.body) {
      return NextResponse.json(
        { error: "Bunny CDN returned a response with no body", url: selected.url },
        { status: 502 },
      );
    }

    const downloadName =
      (photo.originalFilename ?? `video-${vid}`).replace(/\.[^.]+$/, "") + ".mp4";

    const outHeaders = new Headers();

    // iOS Safari is strict about proxied media MIME types. Bunny can return
    // application/octet-stream for MP4 fallback files; macOS/Chrome will sniff
    // it, while iOS may refuse to initialise the decoder. Force the correct
    // media type for playback and do not send Content-Disposition at all.
    outHeaders.set(
      "Content-Type",
      playbackMode ? "video/mp4" : (upstream.headers.get("content-type") ?? "video/mp4"),
    );
    if (!playbackMode) {
      outHeaders.set(
        "Content-Disposition",
        `attachment; filename="${downloadName.replace(/[^\w.\-]+/g, "_")}"`,
      );
    }

    outHeaders.set("Accept-Ranges", "bytes");
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
