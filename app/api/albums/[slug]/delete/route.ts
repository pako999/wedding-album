/**
 * DELETE /api/albums/:slug/delete
 *
 * Permanently deletes an album and all its photos (cascade).
 * Only the album owner can perform this action.
 * Requires { confirm: "<slug>" } in the request body as a second safety check.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Body must contain { confirm: "<slug>" }
  let body: { confirm?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.confirm !== slug) {
    return NextResponse.json(
      { error: "Confirmation text does not match album name" },
      { status: 400 },
    );
  }

  const album = await db.query.albums.findFirst({
    where: eq(albums.slug, slug),
  });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }

  // Delete album — photos cascade via FK
  await db.delete(albums).where(eq(albums.slug, slug));

  return NextResponse.json({ deleted: true });
}
