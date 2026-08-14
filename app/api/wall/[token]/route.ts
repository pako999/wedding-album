import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyAlbumPassword } from "@/lib/album-password";
import { withSchemaHealing } from "@/lib/db/bootstrap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cap how many recent photos the wall rotates through — a Premium album
// can accumulate thousands over its lifetime, and the wall only needs a
// rotating "recent moments" set, not the full history.
const WALL_PHOTO_LIMIT = 60;

/**
 * GET /api/wall/[token]?pw=<password>
 *
 * Public, unauthenticated endpoint polled every few seconds by the
 * TV-facing Photo Wall page (app/wall/[token]). Looked up by the
 * album's dedicated wallToken — a secret separate from `slug`, so this
 * link (displayed on a shared venue screen all night) can't be derived
 * from the main gallery link or vice versa. Same privacy model beyond
 * that as the guest gallery: unpublished albums 404, password-protected
 * albums require a matching ?pw= — the wall link the owner copies from
 * their dashboard already carries it, since there's no on-screen
 * keyboard to type one in on a TV.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const pw = req.nextUrl.searchParams.get("pw") ?? "";

  const album = await withSchemaHealing(() =>
    db.query.albums.findFirst({ where: eq(albums.wallToken, token) }),
  ).catch(() => null);

  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (album.password) {
    const ok = await verifyAlbumPassword(pw, album.password);
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const albumPhotos = await db.query.photos
    .findMany({
      where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
      orderBy: (p, { desc }) => [desc(p.uploadedAt)],
      limit: WALL_PHOTO_LIMIT,
    })
    .catch(() => []);

  // Photos only — videos don't belong in a passive auto-advancing wall.
  const imagePhotos = albumPhotos.filter((p) => !p.mimeType?.startsWith("video/"));

  return NextResponse.json(
    {
      coupleName: album.coupleName,
      photos: imagePhotos.map((p) => ({
        id: p.id,
        blobUrl: p.blobUrl,
        thumbnailUrl: p.thumbnailUrl,
        uploaderName: p.uploaderName,
        uploadedAt: p.uploadedAt,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
