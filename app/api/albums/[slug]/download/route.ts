import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min for large albums

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB

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

      // Strip optimization params to get the original file
      const rawUrl = photo.blobUrl.split("?")[0];

      // HEAD check: skip videos larger than 200 MB
      try {
        const head = await fetch(rawUrl, { method: "HEAD" });
        const contentLength = head.headers.get("content-length");
        if (contentLength && Number(contentLength) > MAX_VIDEO_BYTES) {
          console.warn(`[download] Skipping large video (${contentLength} bytes): ${rawUrl}`);
          continue;
        }
      } catch {
        // If HEAD fails, attempt the download anyway
      }

      try {
        const res = await fetch(rawUrl);
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
      // Strip optimization params to get the full-quality original
      const rawUrl = photo.blobUrl.split("?")[0];

      try {
        const res = await fetch(rawUrl);
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
