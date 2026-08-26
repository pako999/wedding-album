import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyAlbumPassword } from "@/lib/album-password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The existing Guestcam Bunny Stream library is still on Bunny's legacy
 * player. Bunny explicitly keeps existing libraries on that player until the
 * library is migrated, so forcing player.mediadelivery.net breaks playback.
 * Normalize both stored URL variants back to the compatible iframe endpoint.
 */
function bunnyCompatiblePlayerUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    if (url.hostname === "player.mediadelivery.net") {
      url.hostname = "iframe.mediadelivery.net";
    }

    if (url.hostname !== "iframe.mediadelivery.net" || !url.pathname.includes("/embed/")) {
      return null;
    }

    url.searchParams.set("autoplay", "false");
    url.searchParams.set("preload", "true");
    url.searchParams.set("playsinline", "true");

    // disableIosPlayer belongs to Bunny Player 2 and must not be sent to the
    // legacy player used by this library.
    url.searchParams.delete("disableIosPlayer");

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

  const url = bunnyCompatiblePlayerUrl(photo.blobUrl);
  if (!url) {
    return NextResponse.json({ error: "Bunny Player URL unavailable" }, { status: 502 });
  }

  return NextResponse.json(
    { url },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}
