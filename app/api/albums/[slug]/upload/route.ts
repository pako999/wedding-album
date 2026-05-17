import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_IMAGES = [
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/heic", "image/heif", "image/gif",
];
const ALLOWED_VIDEOS = [
  "video/mp4", "video/quicktime", "video/mov", "video/mpeg",
  "video/webm", "video/ogg", "video/avi", "video/3gpp",
];
const ALLOWED_TYPES = [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS];

const MAX_IMAGE_SIZE = 50 * 1024 * 1024;   //  50 MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;  // 500 MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Look up album once
  let album: typeof albums.$inferSelect | null = null;
  try {
    album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }) ?? null;
  } catch { /* DB might not be ready */ }

  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Photo limit reached" }, { status: 403 });
  }

  // ── Vercel Blob client-upload handshake ─────────────────────────────────────
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const { uploaderName } = JSON.parse(clientPayload ?? "{}");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_VIDEO_SIZE,
          // Embed metadata so onUploadCompleted can save the record
          tokenPayload: JSON.stringify({
            albumId: album!.id,
            albumSlug: slug,
            uploaderName: uploaderName ?? "Gost",
            moderationEnabled: album!.moderationEnabled,
            notifyEmail: album!.notifyEmail,
            coupleName: album!.coupleName,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called by Vercel Blob infrastructure after upload is committed.
        // This runs reliably in production; clients also call /save-upload as backup.
        try {
          const {
            albumId, uploaderName, moderationEnabled, notifyEmail, coupleName,
          } = JSON.parse(tokenPayload ?? "{}");

          const isVideo = blob.contentType.startsWith("video/");
          const status = moderationEnabled ? "pending" : "published";

          const existing = await db.query.photos.findFirst({
            where: eq(photos.blobUrl, blob.url),
          });
          if (existing) return; // already saved by client

          await db.insert(photos).values({
            albumId,
            uploaderName,
            blobUrl: blob.url,
            mimeType: blob.contentType,
            originalFilename: blob.pathname.split("/").pop() ?? undefined,
            status,
          });

          const field = status === "published" ? albums.photoCount : albums.pendingCount;
          await db.update(albums)
            .set({ [field.name]: sql`${field} + 1`, updatedAt: new Date() })
            .where(eq(albums.id, albumId));

          if (notifyEmail && !isVideo) {
            const { sendNewPhotoNotification } = await import("@/lib/email/notifications");
            sendNewPhotoNotification({
              to: notifyEmail, coupleName, uploaderName, albumSlug: slug, photoCount: 0,
            }).catch(console.error);
          }
        } catch (err) {
          console.error("[upload/onUploadCompleted]", err);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
