import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendNewPhotoNotification } from "@/lib/email/notifications";
import { bunnyStreamThumbnailUrl, bunnyStreamIframeUrl } from "@/lib/storage/bunny";
import { verifyAlbumPassword } from "@/lib/album-password";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Accepted upload MIME types — mirrors /upload-url. A record whose type
// isn't a real image/video has no place in a gallery.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/mov",
  "video/webm", "video/mpeg", "video/3gpp", "video/avi",
]);

// Bound free-text fields a guest controls so a record can't carry a
// megabyte of attacker-supplied text into the DB / owner notifications.
const MAX_UPLOADER_NAME = 80;
const MAX_FILENAME = 255;

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
  // Pixel dimensions measured client-side (images only)
  width?: number;
  height?: number;
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

  // Rate limit — this endpoint writes a DB row + can fire an owner email
  // per call. Cap it so a script can't flood a gallery or the owner's
  // inbox. 60/min per IP covers a real batch upload.
  const rl = await checkRateLimit("save-upload", 60, 60_000);
  if (!rl.ok) return rl.response;

  const body: SaveBody = await req.json();
  const { blobUrl, cfStreamVideoId, mimeType, originalFilename, sizeBytes, momentId } = body;
  // Optional pixel dimensions, measured client-side on the uploaded file.
  // Clamped; anything implausible is dropped rather than stored.
  const asDim = (v: unknown) => {
    const n = typeof v === "number" ? Math.round(v) : NaN;
    return Number.isFinite(n) && n > 0 && n <= 20000 ? n : null;
  };
  const width = asDim(body.width);
  const height = asDim(body.height);

  if (!blobUrl && !cfStreamVideoId) {
    return NextResponse.json({ error: "blobUrl or cfStreamVideoId required" }, { status: 400 });
  }
  if (blobUrl && !isAllowedBlobUrl(blobUrl)) {
    return NextResponse.json({ error: "Invalid blobUrl" }, { status: 400 });
  }
  if (!mimeType) {
    return NextResponse.json({ error: "mimeType required" }, { status: 400 });
  }
  // MIME must be a real, whitelisted image/video type.
  if (!ALLOWED_IMAGE_TYPES.has(mimeType) && !ALLOWED_VIDEO_TYPES.has(mimeType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  // Bound guest-controlled free text. uploaderName is required.
  const uploaderName = (typeof body.uploaderName === "string" ? body.uploaderName : "").trim();
  if (!uploaderName) {
    return NextResponse.json({ error: "uploaderName required" }, { status: 400 });
  }
  if (uploaderName.length > MAX_UPLOADER_NAME) {
    return NextResponse.json({ error: "uploaderName too long" }, { status: 400 });
  }
  if (typeof originalFilename === "string" && originalFilename.length > MAX_FILENAME) {
    return NextResponse.json({ error: "originalFilename too long" }, { status: 400 });
  }

  // Belt-and-suspenders: even if the upload-url pre-check was bypassed,
  // reject oversized files before we record them. Caps match upload-url.
  if (typeof sizeBytes === "number") {
    const isVideo = mimeType.startsWith("video/");
    const cap = isVideo ? 500 * 1024 * 1024 : 60 * 1024 * 1024;
    if (sizeBytes > cap) {
      const mb = Math.floor(cap / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large (max ${mb} MB per ${isVideo ? "video" : "photo"})` },
        { status: 413 },
      );
    }
  }

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Password gate — ONLY when the album actually has a password set.
  // Open link/QR albums (the default) accept uploads with no password,
  // matching /upload-url and /bunny-upload.
  if (album.password) {
    const provided = req.headers.get("x-album-password") ?? "";
    const ok = await verifyAlbumPassword(provided, album.password);
    if (!ok) {
      return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
    }
  }

  // Enforce the plan's photo cap here too — /upload-url checks it, but
  // this endpoint is a separate request and must not be bypassable.
  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
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
    width: width && height ? width : null,
    height: width && height ? height : null,
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
