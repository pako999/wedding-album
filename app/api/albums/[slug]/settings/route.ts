import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });

  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { coupleName, location, notifyEmail, password, moderationEnabled, isPublished, coverImageUrl } = body;

  await db
    .update(albums)
    .set({
      coupleName: coupleName ?? album.coupleName,
      location: location !== undefined ? (location || null) : album.location,
      notifyEmail: notifyEmail !== undefined ? (notifyEmail || null) : album.notifyEmail,
      password: password !== undefined ? (password || null) : album.password,
      moderationEnabled: moderationEnabled !== undefined ? moderationEnabled : album.moderationEnabled,
      isPublished: isPublished !== undefined ? isPublished : album.isPublished,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl || null) : album.coverImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(albums.id, album.id));

  return NextResponse.json({ ok: true });
}
