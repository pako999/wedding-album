import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import {
  createBunnyS3PresignedRead,
  isBunnyS3Configured,
} from "@/lib/storage/bunny-s3";

export const runtime = "nodejs";

const DISPLAY_WIDTHS = new Set([
  320, 400, 480, 600, 640, 800, 960, 1200, 1280, 1600, 1800, 2000, 2048, 2400,
]);
const DISPLAY_QUALITIES = new Set([30, 78, 80, 82, 90]);

function allowedNumber(value: string | null, allowed: Set<number>): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return allowed.has(parsed) ? parsed : null;
}

function normalizedPublicCdn(): string {
  let cdn = (process.env.BUNNY_S3_CDN_URL ?? "").trim().replace(/\/+$/, "");
  if (cdn && !/^https?:\/\//i.test(cdn)) cdn = `https://${cdn}`;
  return cdn;
}

function validKey(key: string): boolean {
  return (
    key.startsWith("albums/") &&
    !key.includes("..") &&
    !key.includes("\\") &&
    !key.includes("//") &&
    key.length <= 1024
  );
}

/** New S3 keys are always albums/{albumId}/{random-file}. */
function albumIdFromKey(key: string): string | null {
  const parts = key.split("/");
  return parts.length >= 3 && parts[0] === "albums" && parts[1]
    ? parts[1]
    : null;
}

/**
 * Stable read URL for objects stored in the NEW Bunny S3 zone.
 *
 * Open, published link-only albums keep the fast public CDN redirect.
 * Password-protected albums are authorized through either owner auth or the
 * same HttpOnly album access cookie used by the guest gallery. Protected and
 * unpublished reads receive a short-lived signed S3 URL rather than a public
 * pull-zone redirect.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params;
  const key = Array.isArray(segments) ? segments.join("/") : "";

  if (!validKey(key)) {
    return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  }

  const albumId = albumIdFromKey(key);
  if (!albumId) {
    return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.id, albumId) })
    .catch(() => null);
  if (!album) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!album.isPublished) {
    const owner = await checkAlbumOwnership(album);
    if (!owner.ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } else if (album.password) {
    // A signed-in owner must always be able to manage/download their own
    // protected media from the dashboard without entering the guest password.
    const owner = await checkAlbumOwnership(album);
    if (!owner.ok) {
      const allowed = await hasAlbumRequestAccess(req, album.slug, album);
      if (!allowed) {
        return NextResponse.json({ error: "Album access required" }, { status: 403 });
      }
    }
  }

  if (!isBunnyS3Configured()) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const s3Cdn = normalizedPublicCdn();

  try {
    // For open published albums, retain the fast cacheable pull-zone redirect.
    if (s3Cdn && album.isPublished && !album.password) {
      const target = new URL(`${s3Cdn}/${key}`);
      const width = allowedNumber(req.nextUrl.searchParams.get("width"), DISPLAY_WIDTHS);
      const quality = allowedNumber(req.nextUrl.searchParams.get("quality"), DISPLAY_QUALITIES);
      if (width !== null) target.searchParams.set("width", String(width));
      if (quality !== null) target.searchParams.set("quality", String(quality));
      const response = NextResponse.redirect(target, 307);
      response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
      return response;
    }

    // Protected/unpublished media gets a short-lived private S3 URL instead.
    const signed = await createBunnyS3PresignedRead(key, 300);
    const response = NextResponse.redirect(signed, 307);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (err) {
    console.error("[bunny-s3-file]", err);
    return NextResponse.json({ error: "Storage read unavailable" }, { status: 503 });
  }
}
