import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendNewPhotoNotification } from "@/lib/email/notifications";
import { bunnyStreamThumbnailUrl, bunnyStreamIframeUrl } from "@/lib/storage/bunny";

export const runtime = "nodejs";

interface SaveBody {
  // R2 / Vercel Blob upload
  blobUrl?: string;
  // Cloudflare Stream upload
  cfStreamVideoId?: string;
  // Common
  mimeType: string;
  originalFilename?: string;
  sizeBytes?: number;
  uploaderName: string;
  // Optional sub-gallery / moment the photo is uploaded into
  momentId?: string;
}

/**
 * Only accept blob URLs that point at our own storage providers.
 * Prevents a caller from injecting an arbitrary external URL as a "photo".
 */
function isAllowedBlobUrl(u: string): boolean {
  let parsed: URL;
  try { parsed = new URL(u); } catch { return false; }
  if (parsed.protocol !== "https:") return false;
  const h = parsed.hostname.toLowerCase();
  return h.endsWith(".b-cdn.net") || h.endsWith(".public.blob.vercel-storage.com");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body: SaveBody = await req.json();
  const { blobUrl, cfStreamVideoId, mimeType, originalFilename, sizeBytes, uploaderName, momentId } = body;

  if (!blobUrl && !cfStreamVideoId) {
    return NextResponse.json({ error: "blobUrl or cfStreamVideoId required" }, { status: 400 });
  }
  if (blobUrl && !isAllowedBlobUrl(blobUrl)) {
    return NextResponse.json({ error: "Invalid blobUrl" }, { status: 400 });
  }
  if (!mimeType) {
    return NextResponse.json({ error: "mimeType required" }, { status: 400 });
  }

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Skip duplicates — an identical file (same name + size) is already in this album.
  // Safety net in case the upload-url pre-check was bypassed or a batch raced.
  if (originalFilename && typeof sizeBytes === "number") {
    const dup = await db.query.photos.findFirst({
      where: and(
        eq(photos.albumId, album.id),
        eq(photos.originalFilename, originalFilename),
        eq(photos.sizeBytes, sizeBytes),
      ),
    }).catch(() => null);
    if (dup) {
      return NextResponse.json({ success: true, photoId: dup.id, alreadySaved: true });
    }
  }

  // Idempotency — deduplicate by blobUrl or cfStreamVideoId
  if (blobUrl) {
    const existing = await db.query.photos.findFirst({
      where: eq(photos.blobUrl, blobUrl),
    }).catch(() => null);
    if (existing) {
      return NextResponse.json({ success: true, photoId: existing.id, alreadySaved: true });
    }
  }
  if (cfStreamVideoId) {
    const existing = await db.query.photos.findFirst({
      where: eq(photos.cfStreamVideoId, cfStreamVideoId),
    }).catch(() => null);
    if (existing) {
      return NextResponse.json({ success: true, photoId: existing.id, alreadySaved: true });
    }
  }

  const isVideo = mimeType.startsWith("video/");
  const status = album.moderationEnabled ? "pending" : "published";

  // Validate the moment belongs to this album — ignore it otherwise.
  let validMomentId: string | null = null;
  if (momentId) {
    const moment = await db.query.moments.findFirst({
      where: and(eq(moments.id, momentId), eq(moments.albumId, album.id)),
    }).catch(() => null);
    if (moment) validMomentId = moment.id;
  }

  // Build the stored URL values (iframe URL saved in blobUrl for stream videos)
  const storedBlobUrl = blobUrl
    ?? (cfStreamVideoId ? bunnyStreamIframeUrl(cfStreamVideoId) : "");
  const storedThumbnailUrl = cfStreamVideoId
    ? (bunnyStreamThumbnailUrl(cfStreamVideoId) ?? undefined)
    : undefined;

  const [photo] = await db.insert(photos).values({
    albumId: album.id,
    momentId: validMomentId,
    uploaderName,
    blobUrl: storedBlobUrl,
    thumbnailUrl: storedThumbnailUrl,
    cfStreamVideoId: cfStreamVideoId ?? null,
    mimeType,
    sizeBytes,
    originalFilename,
    status,
  }).returning();

  // Update counters
  if (status === "published") {
    await db.update(albums)
      .set({ photoCount: sql`${albums.photoCount} + 1`, updatedAt: new Date() })
      .where(eq(albums.id, album.id));
  } else {
    await db.update(albums)
      .set({ pendingCount: sql`${albums.pendingCount} + 1`, updatedAt: new Date() })
      .where(eq(albums.id, album.id));
  }

  // Email notification for photos only
  if (album.notifyEmail && !isVideo) {
    sendNewPhotoNotification({
      to: album.notifyEmail,
      coupleName: album.coupleName,
      uploaderName,
      albumSlug: slug,
      photoCount: album.photoCount + 1,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true, photoId: photo.id, status });
}
