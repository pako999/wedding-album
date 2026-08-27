import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ALBUM_THEMES } from "@/lib/album-themes";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { hashAlbumPassword, isHashed } from "@/lib/album-password";
import { setAlbumFlags } from "@/lib/album-flags";
import { getAlbumHeaderSettings, setAlbumHeaderSettings } from "@/lib/album-header-settings";
import type { Lang } from "@/lib/i18n/translations";

const ALLOWED_LANGS: readonly Lang[] = ["sl", "hr", "sr", "en", "de", "es"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) return NextResponse.json({ error: owner.error }, { status: owner.status });
  if (!album) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const header = await getAlbumHeaderSettings(album.id);
  return NextResponse.json({
    defaultLang: ALLOWED_LANGS.includes(album.defaultLang as Lang) ? album.defaultLang : "sl",
    header,
  });
}

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
  const {
    coupleName,
    location,
    notifyEmail,
    password,
    moderationEnabled,
    isPublished,
    coverImageUrl,
    eventType,
    theme,
    defaultLang,
    guestDataCapture,
    allowPhotos,
    allowVideos,
    albumPermission,
    disableDownload,
    disableLikes,
    showEventName,
    showLocation,
  } = body;

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

  const validDefaultLang =
    typeof defaultLang === "string" && ALLOWED_LANGS.includes(defaultLang as Lang)
      ? (defaultLang as Lang)
      : album.defaultLang;

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
      defaultLang: validDefaultLang,
      updatedAt: new Date(),
    })
    .where(eq(albums.id, album.id));

  await setAlbumFlags(album.id, {
    ...(typeof guestDataCapture === "boolean" ? { guestDataCapture } : {}),
    ...(typeof allowPhotos === "boolean" ? { allowPhotos } : {}),
    ...(typeof allowVideos === "boolean" ? { allowVideos } : {}),
    ...(typeof disableDownload === "boolean" ? { disableDownload } : {}),
    ...(typeof disableLikes === "boolean" ? { disableLikes } : {}),
    ...(typeof albumPermission === "string" ? { albumPermission: albumPermission as never } : {}),
  });

  const headerWriteOk = await setAlbumHeaderSettings(album.id, {
    ...(typeof showEventName === "boolean" ? { showEventName } : {}),
    ...(typeof showLocation === "boolean" ? { showLocation } : {}),
  });
  if (!headerWriteOk && (typeof showEventName === "boolean" || typeof showLocation === "boolean")) {
    return NextResponse.json({ error: "Header settings could not be saved" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
