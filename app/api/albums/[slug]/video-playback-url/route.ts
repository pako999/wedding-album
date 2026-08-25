import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyAlbumPassword } from "@/lib/album-password";
import { createVideoPlaybackToken } from "@/lib/video-playback-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const vid = req.nextUrl.searchParams.get("vid") ?? "";
  const pw = req.nextUrl.searchParams.get("pw") ?? "";

  if (!vid) {
    return NextResponse.json({ error: "Missing vid" }, { status: 400 });
  }

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (album.password && !(await verifyAlbumPassword(pw, album.password))) {
    return NextResponse.json({ error: "Password required" }, { status: 403 });
  }

  const photo = await db.query.photos.findFirst({
    where: and(
      eq(photos.albumId, album.id),
      eq(photos.cfStreamVideoId, vid),
      eq(photos.status, "published"),
    ),
  });

  if (!photo) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const sig = createVideoPlaybackToken(slug, vid, exp);
  if (!sig) {
    return NextResponse.json({ error: "Playback signing unavailable" }, { status: 503 });
  }

  const qs = new URLSearchParams({
    vid,
    play: "1",
    exp: String(exp),
    sig,
  });

  return NextResponse.json(
    { url: `/api/albums/${encodeURIComponent(slug)}/video-download?${qs.toString()}` },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
