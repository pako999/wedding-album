import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ALBUM_THEMES } from "@/lib/album-themes";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { hashAlbumPassword, isHashed } from "@/lib/album-password";
import { setAlbumFlags } from "@/lib/album-flags";
import { isValidEventTime, setAlbumHeaderSettings } from "@/lib/album-header-settings";

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
  const { coupleName, weddingDate, eventTime, location, notifyEmail, password, moderationEnabled, isPublished, coverImageUrl, eventType, defaultLang, theme, guestDataCapture, allowPhotos, allowVideos, albumPermission, disableDownload, disableLikes, showTitle, showEventType, showEventDate } = body;

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

  const ALLOWED_LANGS = ["sl", "hr", "sr", "de", "en", "es"];
  const validDefaultLang =
    typeof defaultLang === "string" && ALLOWED_LANGS.includes(defaultLang)
      ? defaultLang
      : album.defaultLang;

  const validWeddingDate =
    typeof weddingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(weddingDate)
      ? weddingDate
      : album.weddingDate;

  let validEventTime: string | null | undefined;
  if (eventTime === null || eventTime === "") {
    validEventTime = null;
  } else if (eventTime === undefined) {
    validEventTime = undefined;
  } else if (typeof eventTime === "string" && isValidEventTime(eventTime)) {
    validEventTime = eventTime;
  } else {
    return NextResponse.json({ error: "Neveljaven čas začetka dogodka." }, { status: 400 });
  }

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
      weddingDate: validWeddingDate,
      location: location !== undefined ? (location || null) : album.location,
      notifyEmail: notifyEmail !== undefined ? (notifyEmail || null) : album.notifyEmail,
      password: nextPassword !== undefined ? nextPassword : album.password,
      moderationEnabled: moderationEnabled !== undefined ? moderationEnabled : album.moderationEnabled,
      isPublished: isPublished !== undefined ? isPublished : album.isPublished,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl || null) : album.coverImageUrl,
      eventType: validEventType,
      defaultLang: validDefaultLang,
      theme: validTheme,
      updatedAt: new Date(),
    })
    .where(eq(albums.id, album.id));

  // Feature flags live in their own table (see lib/album-flags.ts), so
  // this is a separate write and a failure here must not fail the whole
  // settings save.
  // All event flags in one guarded write. setAlbumFlags validates every
  // key and value, so unknown fields in the body are dropped.
  await setAlbumFlags(album.id, {
    ...(typeof guestDataCapture === "boolean" ? { guestDataCapture } : {}),
    ...(typeof allowPhotos === "boolean" ? { allowPhotos } : {}),
    ...(typeof allowVideos === "boolean" ? { allowVideos } : {}),
    ...(typeof disableDownload === "boolean" ? { disableDownload } : {}),
    ...(typeof disableLikes === "boolean" ? { disableLikes } : {}),
    ...(typeof albumPermission === "string" ? { albumPermission: albumPermission as never } : {}),
  });

  const headerSettingsRequested =
    typeof showTitle === "boolean" ||
    typeof showEventType === "boolean" ||
    typeof showEventDate === "boolean" ||
    validEventTime !== undefined;
  const headerSettingsSaved = await setAlbumHeaderSettings(album.id, {
    ...(typeof showTitle === "boolean" ? { showTitle } : {}),
    ...(typeof showEventType === "boolean" ? { showEventType } : {}),
    ...(typeof showEventDate === "boolean" ? { showEventDate } : {}),
    ...(validEventTime !== undefined ? { eventTime: validEventTime } : {}),
  });
  if (headerSettingsRequested && !headerSettingsSaved) {
    return NextResponse.json(
      { error: "Nastavitev prikaza galerije ni bilo mogoče shraniti." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
