import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendNewPhotoNotification } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Find album
  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const uploaderName = (formData.get("uploaderName") as string) || "Gost";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
  }

  // Check photo limit
  if (album.photoCount >= album.maxPhotos) {
    return NextResponse.json({ error: "Album photo limit reached" }, { status: 403 });
  }

  // Upload to Vercel Blob
  const ext = file.name.split(".").pop() ?? "jpg";
  const blobName = `albums/${album.id}/${crypto.randomUUID()}.${ext}`;

  const blob = await put(blobName, file, {
    access: "public",
    contentType: file.type,
  });

  // Determine photo status based on moderation setting
  const status = album.moderationEnabled ? "pending" : "published";

  // Insert photo record
  const [photo] = await db
    .insert(photos)
    .values({
      albumId: album.id,
      uploaderName,
      blobUrl: blob.url,
      sizeBytes: file.size,
      mimeType: file.type,
      originalFilename: file.name,
      status,
    })
    .returning();

  // Update album counts
  if (status === "published") {
    await db
      .update(albums)
      .set({ photoCount: sql`${albums.photoCount} + 1`, updatedAt: new Date() })
      .where(eq(albums.id, album.id));
  } else {
    await db
      .update(albums)
      .set({ pendingCount: sql`${albums.pendingCount} + 1`, updatedAt: new Date() })
      .where(eq(albums.id, album.id));
  }

  // Send email notification to owner (fire and forget)
  if (album.notifyEmail) {
    sendNewPhotoNotification({
      to: album.notifyEmail,
      coupleName: album.coupleName,
      uploaderName,
      albumSlug: album.slug,
      photoCount: album.photoCount + 1,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true, photoId: photo.id, status });
}
