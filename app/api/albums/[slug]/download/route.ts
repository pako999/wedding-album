import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min for large albums

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB

const STORAGE_ZONE = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const STORAGE_API_KEY = () => process.env.BUNNY_STORAGE_API_KEY ?? "";

/**
 * Converts a stored blobUrl back to a Bunny Storage direct URL.
 * Fetching from storage.bunnycdn.com with the API key always works,
 * even if the CDN Pull Zone is misconfigured.
 *
 * blobUrl forms:
 *   • CDN URL  → "https://frfr1.b-cdn.net/albums/slug/file.jpg"
 *   • Proxy URL → "/api/img?key=albums%2Fslug%2Ffile.jpg"  (shouldn't be stored, but handle it)
 */
function storageUrlFromBlobUrl(blobUrl: string): string {
  let key: string | null = null;

  if (blobUrl.includes(".b-cdn.net")) {
    try {
      const u = new URL(blobUrl);
      key = u.pathname.replace(/^\//, "");
    } catch { /* fall through */ }
  } else if (blobUrl.includes("/api/img")) {
    try {
      const u = new URL(blobUrl, "http://localhost");
      key = u.searchParams.get("key");
    } catch { /* fall through */ }
  } else if (blobUrl.startsWith("albums/")) {
    key = blobUrl.split("?")[0];
  }

  if (key) {
    return `https://storage.bunnycdn.com/${STORAGE_ZONE()}/${key}`;
  }
  // Unknown URL format — try as-is (may work if it's a public URL)
  return blobUrl.split("?")[0];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  const { slug } = await params;

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  if (!album) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only owner can download ZIP
  if (!userId || userId !== album.ownerClerkId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all published photos/videos
  const albumPhotos = await db.query.photos.findMany({
    where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
    orderBy: (p, { asc }) => [asc(p.uploadedAt)],
  });

  const zip = new JSZip();
  const photosFolder = zip.folder("photos") ?? zip;
  const videosFolder = zip.folder("videos") ?? zip;

  let imgIdx = 1;
  let vidIdx = 1;

  for (const photo of albumPhotos) {
    const isVideo = photo.mimeType?.startsWith("video/") ?? false;

    if (isVideo) {
      // Skip Bunny Stream videos — they require a separate API
      if (photo.cfStreamVideoId) {
        continue;
      }

      // Resolve to direct Bunny Storage URL (bypasses broken CDN Pull Zone)
      const rawUrl = storageUrlFromBlobUrl(photo.blobUrl);
      const storageHeaders: Record<string, string> = rawUrl.includes("storage.bunnycdn.com")
        ? { AccessKey: STORAGE_API_KEY() }
        : {};

      // HEAD check: skip videos larger than 200 MB
      try {
        const head = await fetch(rawUrl, { method: "HEAD", headers: storageHeaders });
        const contentLength = head.headers.get("content-length");
        if (contentLength && Number(contentLength) > MAX_VIDEO_BYTES) {
          console.warn(`[download] Skipping large video (${contentLength} bytes): ${rawUrl}`);
          continue;
        }
      } catch {
        // If HEAD fails, attempt the download anyway
      }

      try {
        const res = await fetch(rawUrl, { headers: storageHeaders });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        const ext = photo.mimeType?.split("/")[1] ?? "mp4";
        const name = photo.originalFilename ?? `video-${String(vidIdx).padStart(3, "0")}.${ext}`;
        videosFolder.file(name, buf);
        vidIdx++;
      } catch {
        // Skip failed downloads
      }
    } else {
      // Resolve to direct Bunny Storage URL (bypasses broken CDN Pull Zone)
      const rawUrl = storageUrlFromBlobUrl(photo.blobUrl);
      const storageHeaders: Record<string, string> = rawUrl.includes("storage.bunnycdn.com")
        ? { AccessKey: STORAGE_API_KEY() }
        : {};

      try {
        const res = await fetch(rawUrl, { headers: storageHeaders });
        if (!res.ok) continue;
        const buf = await res.arrayBuffer();
        const ext = photo.mimeType?.split("/")[1] ?? "jpg";
        const name = photo.originalFilename ?? `foto-${String(imgIdx).padStart(3, "0")}.${ext}`;
        photosFolder.file(name, buf);
        imgIdx++;
      } catch {
        // Skip failed downloads
      }
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 1 }, // fast, not max — photos are already compressed
  });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="guestcam-${slug}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
