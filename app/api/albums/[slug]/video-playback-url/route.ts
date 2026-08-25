import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyAlbumPassword } from "@/lib/album-password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bunnyPlayer2Url(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    if (url.hostname === "iframe.mediadelivery.net") {
      url.hostname = "player.mediadelivery.net";
    }

    if (url.hostname !== "player.mediadelivery.net" || !url.pathname.includes("/embed/")) {
      return null;
    }

    // Bunny Stream Player 2 officially supports these iOS-specific options.
    // Keep autoplay disabled so Safari starts playback only after a user tap,
    // force inline playback, and disable the native iOS player handoff so the
    // same Bunny Player 2 implementation is used on iPhone as on desktop.
    url.searchParams.set("autoplay", "false");
    url.searchParams.set("preload", "true");
    url.searchParams.set("playsinline", "true");
    url.searchParams.set("disableIosPlayer", "true");

    return url.toString();
  } catch {
    return null;
  }
}

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

  const url = bunnyPlayer2Url(photo.blobUrl);
  if (!url) {
    return NextResponse.json({ error: "Bunny Player URL unavailable" }, { status: 502 });
  }

  return NextResponse.json(
    { url },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
