import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendNewPhotoNotification } from "@/lib/email/notifications";

export const runtime = "nodejs";

interface SaveBody {
  blobUrl: string;
  mimeType: string;
  originalFilename?: string;
  sizeBytes?: number;
  uploaderName: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const body: SaveBody = await req.json();
  const { blobUrl, mimeType, originalFilename, sizeBytes, uploaderName } = body;

  if (!blobUrl || !mimeType) {
    return NextResponse.json({ error: "blobUrl and mimeType required" }, { status: 400 });
  }

  // Fetch album
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  // Idempotent — skip if already saved by onUploadCompleted webhook
  const existing = await db.query.photos.findFirst({ where: eq(photos.blobUrl, blobUrl) });
  if (existing) {
    return NextResponse.json({ success: true, photoId: existing.id, alreadySaved: true });
  }

  const isVideo = mimeType.startsWith("video/");
  const status = album.moderationEnabled ? "pending" : "published";

  const [photo] = await db.insert(photos).values({
    albumId: album.id,
    uploaderName,
    blobUrl,
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

  // Email notification (photos only, fire-and-forget)
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
