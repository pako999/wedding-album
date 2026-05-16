import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 min for large albums

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

  // Only owner can download ZIP (pro/premium)
  if (!userId || userId !== album.ownerClerkId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (album.plan === "free") {
    return NextResponse.json({ error: "ZIP download requires Pro plan" }, { status: 403 });
  }

  // Fetch all published photos
  const albumPhotos = await db.query.photos.findMany({
    where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
    orderBy: (p, { asc }) => [asc(p.uploadedAt)],
  });

  const zip = new JSZip();
  const folder = zip.folder(album.slug) ?? zip;

  // Download each photo from blob and add to ZIP
  let i = 1;
  for (const photo of albumPhotos) {
    try {
      const res = await fetch(photo.blobUrl);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const ext = photo.mimeType?.split("/")[1] ?? "jpg";
      const name = photo.originalFilename ?? `foto-${String(i).padStart(3, "0")}.${ext}`;
      folder.file(name, buf);
      i++;
    } catch {
      // Skip failed downloads
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
      "Content-Disposition": `attachment; filename="album-${slug}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
