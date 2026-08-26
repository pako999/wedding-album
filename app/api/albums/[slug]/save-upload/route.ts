import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, moments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendNewPhotoNotification } from "@/lib/email/notifications";
import { bunnyStreamThumbnailUrl, bunnyStreamIframeUrl } from "@/lib/storage/bunny";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";
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
 * Accept only storage URLs that are both managed by Guestcam AND scoped to
 * the current album id. Provider hostname alone is not sufficient: otherwise
 * a valid URL from album A could be attached to album B.
 */
function blobUrlBelongsToAlbum(u: string, albumId: string): boolean {
  const expectedKeyPrefix = `albums/${albumId}/`;

  if (u.startsWith("/api/bunny-s3-file/")) {
    try {
      const parsed = new URL(u, "https://guestcam.internal");
      const decodedPath = decodeURIComponent(parsed.pathname);
      const expectedPath = `/api/bunny-s3-file/${expectedKeyPrefix}`;
      return (
        parsed.origin === "https://guestcam.internal" &&
        decodedPath.startsWith(expectedPath) &&
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
  const managedHost =
    h.endsWith(".b-cdn.net") ||
    h.endsWith(".public.blob.vercel-storage.com") ||
    (r2Host !== null && h === r2Host);
  if (!managedHost) return false;

  const key = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
  return (
    key.startsWith(expectedKeyPrefix) &&
    !key.includes("..") &&
    !key.includes("\\") &&
    !key.includes("//")
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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
  if (!mimeType || (!ALLOWED_IMAGE_TYPES.has(mimeType) && !ALLOWED_VIDEO_TYPES.has(mimeType))) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploaderName = (typeof body.uploaderName === "string" ? body.uploaderName : "").trim();
  if (!uploaderName) return NextResponse.json({ error: "uploaderName required" }, { status: 400 });
  if (uploaderName.length > MAX_UPLOADER_NAME) {
    return NextResponse.json({ error: "uploaderName too long" }, { status: 400 });
  }
  if (typeof originalFilename === "string" && originalFilename.length > MAX_FILENAME) {
    return NextResponse.json({ error: "originalFilename too long" }, { status: 400 });
  }

  const isVideo = mimeType.startsWith("video/");
  if (typeof sizeBytes === "number") {
    const cap = isVideo ? 500 * 1024 * 1024 : 250 * 1024 * 1024;
    if (!Number.isFinite(sizeBytes) || sizeBytes < 0 || sizeBytes > cap) {
      return NextResponse.json(
        { error: `File too large (max ${Math.floor(cap / 1024 / 1024)} MB per ${isVideo ? "video" : "photo"})` },
        { status: 413 },
      );
    }
  }

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Open/link-only albums pass automatically. Protected albums use the same
  // HttpOnly access cookie as the gallery; the legacy header remains accepted
  // by hasAlbumRequestAccess only for backwards compatibility.
  if (!(await hasAlbumRequestAccess(req, slug, album))) {
    return NextResponse.json({ error: "Wrong album password" }, { status: 403 });
  }

  if (blobUrl && !blobUrlBelongsToAlbum(blobUrl, album.id)) {
    return NextResponse.json({ error: "Media URL does not belong to this album" }, { status: 409 });
  }

  const flags = await getAlbumFlags(album.id);
  if (flags.albumPermission === "view_only") {
    return NextResponse.json({ error: "uploads_disabled" }, { status: 403 });
  }
  if (isVideo && !flags.allowVideos) {
    return NextResponse.json({ error: "videos_not_allowed" }, { status: 403 });
  }
  if (!isVideo && !flags.allowPhotos) {
    return NextResponse.json({ error: "photos_not_allowed" }, { status: 403 });
  }

  // Idempotency and cross-album protection. If the same managed object/video
  // has already been saved to THIS album, retry is safe. If it belongs to a
  // different album, never disclose/reuse its photo id.
  if (blobUrl) {
    const existing = await db.query.photos.findFirst({ where: eq(photos.blobUrl, blobUrl) }).catch(() => null);
    if (existing) {
      if (existing.albumId !== album.id) {
        return NextResponse.json({ error: "Media already belongs to another album" }, { status: 409 });
      }
      return NextResponse.json({ success: true, photoId: existing.id, alreadySaved: true });
    }
  }
  if (cfStreamVideoId) {
    const existing = await db.query.photos.findFirst({ where: eq(photos.cfStreamVideoId, cfStreamVideoId) }).catch(() => null);
    if (existing) {
      if (existing.albumId !== album.id) {
        return NextResponse.json({ error: "Video already belongs to another album" }, { status: 409 });
      }
      return NextResponse.json({ success: true, photoId: existing.id, alreadySaved: true });
    }
  }
  if (originalFilename && typeof sizeBytes === "number") {
    const dup = await db.query.photos.findFirst({
      where: and(
        eq(photos.albumId, album.id),
        eq(photos.originalFilename, originalFilename),
        eq(photos.sizeBytes, sizeBytes),
      ),
    }).catch(() => null);
    if (dup) return NextResponse.json({ success: true, photoId: dup.id, alreadySaved: true });
  }

  if (isVideo && album.plan === "free") {
    const rows = await db.select({ count: sql<number>`count(*)` }).from(photos)
      .where(and(eq(photos.albumId, album.id), sql`${photos.mimeType} LIKE 'video/%'`));
    if (Number(rows[0]?.count ?? 0) >= 1) {
      return NextResponse.json({ error: "Free plan allows only 1 video" }, { status: 403 });
    }
  }

  let validMomentId: string | null = null;
  if (momentId) {
    const moment = await db.query.moments.findFirst({
      where: and(eq(moments.id, momentId), eq(moments.albumId, album.id)),
    }).catch(() => null);
    if (moment) validMomentId = moment.id;
  }

  const status = album.moderationEnabled ? "pending" : "published";

  // Reserve a quota slot atomically BEFORE inserting metadata. This closes the
  // check-then-write race when hundreds of guests finalize uploads at once.
  const counterSet = status === "published"
    ? { photoCount: sql`${albums.photoCount} + 1`, updatedAt: new Date() }
    : { pendingCount: sql`${albums.pendingCount} + 1`, updatedAt: new Date() };

  const reserved = await db.update(albums)
    .set(counterSet)
    .where(and(
      eq(albums.id, album.id),
      sql`${albums.photoCount} + ${albums.pendingCount} < ${albums.maxPhotos}`,
    ))
    .returning({ photoCount: albums.photoCount, pendingCount: albums.pendingCount });

  if (reserved.length === 0) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  try {
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

    if (album.notifyEmail && !isVideo) {
      sendNewPhotoNotification({
        to: album.notifyEmail,
        coupleName: album.coupleName,
        uploaderName,
        albumSlug: slug,
        photoCount: reserved[0]?.photoCount ?? album.photoCount + 1,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, photoId: photo.id, status });
  } catch (err) {
    // Release the reservation if metadata insertion fails. GREATEST prevents a
    // second failure path from ever taking counters negative.
    const rollback = status === "published"
      ? { photoCount: sql`GREATEST(${albums.photoCount} - 1, 0)`, updatedAt: new Date() }
      : { pendingCount: sql`GREATEST(${albums.pendingCount} - 1, 0)`, updatedAt: new Date() };
    await db.update(albums).set(rollback).where(eq(albums.id, album.id)).catch(() => {});
    console.error("[save-upload] metadata insert failed", err);
    return NextResponse.json({ error: "Failed to save upload" }, { status: 503 });
  }
}
