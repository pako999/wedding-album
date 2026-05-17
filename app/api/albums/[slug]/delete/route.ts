/**
 * DELETE /api/albums/:slug/delete
 *
 * Permanently deletes an album and all its photos (cascade).
 * Only the album owner can perform this action.
 * Requires { confirm: "<slug>" } in the request body as a second safety check.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (!album) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete album — photos cascade via FK
  await db.delete(albums).where(eq(albums.slug, slug));

  return NextResponse.json({ deleted: true });
}
