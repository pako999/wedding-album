import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendNewPhotoNotification } from "@/lib/email/notifications";
import { bunnyStreamThumbnailUrl, bunnyStreamIframeUrl } from "@/lib/storage/bunny";
import { verifyAlbumPassword } from "@/lib/album-password";
import { getAlbumFlags } from "@/lib/album-flags";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
]);
const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4", "video/quicktime", "video/mov",
  "video/webm", "video/mpeg", "video/3gpp", "video/avi",
]);

const MAX_UPLOADER_NAME = 80;
const MAX_FILENAME = 255;
const VENUE_SAVES_PER_MINUTE = 2_000;

interface SaveBody {
  blobUrl?: string;
  cfStreamVideoId?: string;
  mimeType: string;
  originalFilename?: string;
  sizeBytes?: number;
  uploaderName: string;
  momentId?: string;
  width?: number;
  height?: number;
}

function configuredR2Host(): string | null {
  const raw = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" ? parsed.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Only accept media URLs that point at one of our configured storage providers.
 *
 * New Bunny S3 uploads are stored as an internal app URL
 * (/api/bunny-s3-file/albums/...) which redirects to the new S3 pull zone.
 * Legacy Bunny CDN, Vercel Blob and configured R2 URLs remain supported.
 */
function isAllowedBlobUrl(u: string): boolean {
  if (u.startsWith("/api/bunny-s3-file/")) {
    try {
      const parsed = new URL(u, "https://guestcam.internal");
      const decodedPath = decodeURIComponent(parsed.pathname);
      return (
        parsed.origin === "https://guestcam.internal" &&
        decodedPath.startsWith("/api/bunny-s3-file/albums/") &&
        !decodedPath.includes("..") &&
        !decodedPath.includes("\\") &&
        !decodedPath.includes("//")
      );
    } catch {
      return false;
    }
  }

  let parsed: URL;
  try { parsed = new URL(u); } catch { return false; }
  if (parsed.protocol !== "https:") return false;
  const h = parsed.hostname.toLowerCase();
  const r2Host = configuredR2Host();
  return (
    h.endsWith(".b-cdn.net") ||
    h.endsWith(".public.blob.vercel-storage.com") ||
    (r2Host !== null && h === r2Host)
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // A venue can put hundreds of phones behind one NAT/public IP. The old
  // 60/min per-IP cap caused successful direct uploads to fail at the final
  // metadata-save step. This route only writes small JSON/DB records.
  const rl = await checkRateLimit("save-upload-venue", VENUE_SAVES_PER_MINUTE, 60_000);
  if (!rl.ok) return rl.response;

  let body: SaveBody;
  try {
    body = await req.json() as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { blobUrl, cfStreamVideoId, mimeType, originalFilename, sizeBytes, momentId } = body;
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
  if (!ALLOWED_IMAGE_TYPES.has(mimeType) && !ALLOWED_VIDEO_TYPES.has(mimeType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

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

  if (typeof sizeBytes === "number") {
    const isVideo = mimeType.startsWith("video/");
    // Safety ceiling only. Original phone photos are intentionally not
    // recompressed; 20 MB, 30 MB, 50 MB, etc. remain their original size.
    const cap = isVideo ? 500 * 1024 * 1024 : 250 * 1024 * 1024;
    if (!Number.isFinite(sizeBytes) || sizeBytes < 0 || sizeBytes > cap) {
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

  {
    const flags = await getAlbumFlags(album.id);
    if (flags.albumPermission === "view_only") {
      return NextResponse.json({ error: "uploads_disabled" }, { status: 403 });
    }
    const isVideoUpload = mimeType.startsWith("video/");
    if (isVideoUpload && !flags.allowVideos) {
      return NextResponse.json({ error: "videos_not_allowed" }, { status: 403 });
    }
    if (!isVideoUpload && !flags.allowPhotos) {
      return NextResponse.json({ error: "photos_not_allowed" }, { status: 403 });
    }
  }

  if (album.password) {
    const provided = req.headers.get("x-album-password") ?? "";
    const ok = await verifyAlbumPassword(provided, album.password);
    if (!ok) {
      return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
    }
  }

  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

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

  let validMomentId: string | null = null;
  if (momentId) {
    const moment = await db.query.moments.findFirst({
      where: and(eq(moments.id, momentId), eq(moments.albumId, album.id)),
    }).catch(() => null);
    if (moment) validMomentId = moment.id;
  }

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

  if (status === "published") {
    await db.update(albums)
      .set({ photoCount: sql`${albums.photoCount} + 1`, updatedAt: new Date() })
      .where(eq(albums.id, album.id));
  } else {
    await db.update(albums)
      .set({ pendingCount: sql`${albums.pendingCount} + 1`, updatedAt: new Date() })
      .where(eq(albums.id, album.id));
  }

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
