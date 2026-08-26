import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  exchangeCode,
  createFolder,
  uploadResponseToDrive,
  extForMime,
  verifyDriveState,
} from "@/lib/google-drive";
import { createBunnyS3PresignedRead } from "@/lib/storage/bunny-s3";
import {
  getBunnyStreamVideo,
  pickBestMp4Url,
  signBunnyStreamUrl,
} from "@/lib/storage/bunny";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";
export const maxDuration = 300;

const STREAM_RES_ORDER = ["1080p", "720p", "480p", "360p", "240p"];

function s3KeyFromInternalUrl(blobUrl: string): string | null {
  if (!blobUrl.startsWith("/api/bunny-s3-file/")) return null;
  try {
    const parsed = new URL(blobUrl, "https://guestcam.internal");
    const prefix = "/api/bunny-s3-file/";
    const raw = parsed.pathname.slice(prefix.length);
    const key = raw.split("/").map((segment) => decodeURIComponent(segment)).join("/");
    if (!key.startsWith("albums/") || key.includes("..") || key.includes("\\") || key.includes("//")) {
      return null;
    }
    return key;
  } catch {
    return null;
  }
}

async function fetchPhotoSource(blobUrl: string): Promise<Response> {
  const s3Key = s3KeyFromInternalUrl(blobUrl);
  const sourceUrl = s3Key
    ? await createBunnyS3PresignedRead(s3Key, 15 * 60)
    : blobUrl;

  if (!/^https:\/\//i.test(sourceUrl)) {
    throw new Error("Unsupported relative media URL");
  }

  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok || !response.body) {
    throw new Error(`Fetch media failed: ${response.status}`);
  }
  return response;
}

/**
 * Bunny metadata can occasionally list an MP4 resolution whose file has not
 * actually materialised on the CDN. Try every advertised resolution before
 * declaring the export failed, highest quality first.
 */
async function fetchBunnyVideoSource(videoId: string): Promise<Response> {
  const meta = await getBunnyStreamVideo(videoId);
  if (!meta || meta.status !== 4) {
    throw new Error("Bunny video is not ready");
  }

  const first = pickBestMp4Url(videoId, meta.availableResolutions);
  if (!first) throw new Error("Bunny MP4 fallback is unavailable");

  const available = new Set(
    meta.availableResolutions.split(",").map((r) => r.trim()).filter(Boolean),
  );
  const baseUrl = first.url.replace(/\/play_[^/]+\.mp4(?:\?.*)?$/i, "");
  const candidates = STREAM_RES_ORDER.filter((res) => available.has(res));

  let lastStatus = 0;
  for (const resolution of candidates) {
    const unsigned = `${baseUrl}/play_${resolution}.mp4`;
    const signed = await signBunnyStreamUrl(unsigned, 15 * 60);
    const response = await fetch(signed, { cache: "no-store" });
    lastStatus = response.status;
    if (response.ok && response.body) return response;
    // Drain/cancel before trying another candidate so sockets are released.
    await response.body?.cancel().catch(() => {});
  }

  throw new Error(`Bunny MP4 fetch failed (${lastStatus || "no candidate"})`);
}

/**
 * GET /api/google-drive/callback
 * Verifies signed OAuth state, creates a Drive folder and streams each
 * published original directly from its storage provider into Google Drive.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const rawState = params.get("state") ?? "";
  const state = verifyDriveState(rawState);
  const code = params.get("code");
  const oauthError = params.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!state) {
    return NextResponse.json({ error: "Invalid or expired OAuth state" }, { status: 400 });
  }

  const slug = state.slug;
  const back = (result: string, extra = "") =>
    NextResponse.redirect(
      new URL(`/dashboard/${encodeURIComponent(slug)}?tab=gallery&drive=${result}${extra}`, appUrl),
    );

  if (oauthError || !code) return back("denied");

  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId || userId !== state.userId) return back("error");

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album) return back("error");

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok || owner.userId !== userId) return back("error");

  try {
    const redirectUri = `${appUrl}/api/google-drive/callback`;
    const token = await exchangeCode(code, redirectUri);

    const albumPhotos = await db.query.photos.findMany({
      where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
      orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
    });
    if (albumPhotos.length === 0) return back("empty");

    const folderName = `Guestcam – ${album.coupleName || slug}`;
    const folderId = await createFolder(token, folderName);

    // Stream sequentially. This is intentionally slower than buffering four
    // complete originals at once, but keeps serverless memory bounded for
    // 250 MB photos / 500 MB videos and makes large exports reliable.
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < albumPhotos.length; i++) {
      const p = albumPhotos[i];
      try {
        const streamVideo = Boolean(p.cfStreamVideoId);
        const source = streamVideo
          ? await fetchBunnyVideoSource(p.cfStreamVideoId!)
          : await fetchPhotoSource(p.blobUrl);

        const mimeType = streamVideo ? "video/mp4" : (p.mimeType ?? "image/jpeg");
        const ext = streamVideo ? "mp4" : extForMime(mimeType);
        const idx = String(i + 1).padStart(3, "0");
        const originalBase = p.originalFilename
          ? p.originalFilename.replace(/\.[^.]+$/, "")
          : "guestcam";
        const name = `${idx}_${originalBase}.${ext}`;

        await uploadResponseToDrive(token, folderId, name, source, mimeType);
        uploaded++;
      } catch (err) {
        failed++;
        console.error(`[google-drive] media ${p.id} export failed:`, err);
      }
    }

    if (uploaded === 0) return back("error");
    return back(failed > 0 ? "partial" : "ok", `&n=${uploaded}`);
  } catch (err) {
    console.error("[google-drive/callback] error:", err);
    return back("error");
  }
}
