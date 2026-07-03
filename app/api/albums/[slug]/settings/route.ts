import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ALBUM_THEMES } from "@/lib/album-themes";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { hashAlbumPassword, isHashed } from "@/lib/album-password";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return NextResponse.json({ error: owner.error }, { status: owner.status });
  }
  if (!album) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { coupleName, location, notifyEmail, password, moderationEnabled, isPublished, coverImageUrl, eventType, theme } = body;

  const ALLOWED_EVENT_TYPES = [
    "wedding",
    "birthday",
    "anniversary",
    "party",
    "baptism",
    "graduation",
    "baby_shower",
    "business",
    "other",
  ];
  const validEventType =
    typeof eventType === "string" && ALLOWED_EVENT_TYPES.includes(eventType)
      ? eventType
      : album.eventType;

  const validTheme =
    typeof theme === "string" && ALBUM_THEMES.some((t) => t.id === theme)
      ? theme
      : album.theme;

  // Password handling: hash any new plaintext value with scrypt; empty
  // string means "clear"; undefined means "leave unchanged". If the
  // owner submits the exact hash already stored (round-trip from form
  // state), don't double-hash it — treat as no-op.
  let nextPassword: string | null | undefined;
  if (password === undefined) {
    nextPassword = undefined;
  } else if (!password) {
    nextPassword = null;
  } else if (typeof password === "string" && isHashed(password) && password === album.password) {
    nextPassword = undefined;
  } else {
    nextPassword = await hashAlbumPassword(String(password));
  }

  await db
    .update(albums)
    .set({
      coupleName: coupleName ?? album.coupleName,
      location: location !== undefined ? (location || null) : album.location,
      notifyEmail: notifyEmail !== undefined ? (notifyEmail || null) : album.notifyEmail,
      password: nextPassword !== undefined ? nextPassword : album.password,
      moderationEnabled: moderationEnabled !== undefined ? moderationEnabled : album.moderationEnabled,
      isPublished: isPublished !== undefined ? isPublished : album.isPublished,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl || null) : album.coverImageUrl,
      eventType: validEventType,
      theme: validTheme,
      updatedAt: new Date(),
    })
    .where(eq(albums.id, album.id));

  return NextResponse.json({ ok: true });
}
