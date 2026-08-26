import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, photoLikes } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAlbumFlags } from "@/lib/album-flags";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  const rl = await checkRateLimit("like", 60, 60_000);
  if (!rl.ok) return rl.response;

  const { slug, photoId } = await params;
  const payload = await req.json().catch(() => null) as {
    uploaderName?: unknown;
    action?: unknown;
  } | null;
  if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const uploaderName = typeof payload.uploaderName === "string" ? payload.uploaderName.trim() : "";
  const action = payload.action;
  if (!uploaderName || uploaderName.length > 80) {
    return NextResponse.json({ error: "uploaderName required (max 80 chars)" }, { status: 400 });
  }
  if (action !== "like" && action !== "unlike") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await hasAlbumRequestAccess(req, slug, album))) {
    return NextResponse.json({ error: "Album access required" }, { status: 403 });
  }

  const flags = await getAlbumFlags(album.id);
  if (flags.disableLikes) {
    return NextResponse.json({ error: "likes_disabled" }, { status: 403 });
  }

  const photo = await db.query.photos
    .findFirst({
      where: and(
        eq(photos.id, photoId),
        eq(photos.albumId, album.id),
        eq(photos.status, "published"),
      ),
    })
    .catch(() => null);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "unlike") {
    await db
      .delete(photoLikes)
      .where(and(eq(photoLikes.photoId, photoId), eq(photoLikes.uploaderName, uploaderName)))
      .catch(() => null);
  } else {
    await db
      .insert(photoLikes)
      .values({ photoId, albumId: album.id, uploaderName })
      .onConflictDoNothing()
      .catch(() => null);
  }

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(photoLikes)
    .where(eq(photoLikes.photoId, photoId));

  return NextResponse.json({ liked: action === "like", count: Number(total) });
}
