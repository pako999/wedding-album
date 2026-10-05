/**
 * GET /api/img?key=albums/<album-id-or-slug>/filename.jpg
 *
 * Legacy Bunny Storage proxy. Historical Guestcam albums still depend on this
 * route, so it must stay compatible while enforcing the same access model as
 * the current S3 reader.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { createBunnyS3PresignedRead, isBunnyS3Configured } from "@/lib/storage/bunny-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function albumRefFromKey(key: string): string | null {
  const parts = key.split("/");
  return parts.length >= 3 && parts[0] === "albums" && parts[1]
    ? parts[1]
    : null;
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";

  if (
    !key.startsWith("albums/") ||
    key.includes("..") ||
    key.includes("\\") ||
    key.includes("//") ||
    key.length > 1024
  ) {
    return new NextResponse("Invalid key", { status: 400 });
  }

  const albumRef = albumRefFromKey(key);
  if (!albumRef) return new NextResponse("Invalid key", { status: 400 });

  // Historical objects used both album slug and album id as the second path
  // segment, so support both without weakening the authorization boundary.
  const album = await db.query.albums
    .findFirst({
      where: or(eq(albums.id, albumRef), eq(albums.slug, albumRef)),
    })
    .catch(() => null);
  if (!album) return new NextResponse("Not found", { status: 404 });

  let privateRead = false;
  if (!album.isPublished) {
    const owner = await checkAlbumOwnership(album);
    if (!owner.ok) return new NextResponse("Not found", { status: 404 });
    privateRead = true;
  } else if (album.password) {
    // Owners can manage/download their own protected album without separately
    // entering the guest password. Guests use the encrypted HttpOnly cookie.
    const owner = await checkAlbumOwnership(album);
    if (!owner.ok) {
      const allowed = await hasAlbumRequestAccess(req, album.slug, album);
      if (!allowed) return new NextResponse("Album access required", { status: 403 });
    }
    privateRead = true;
  }

  const storageZone = process.env.BUNNY_STORAGE_ZONE ?? "frank1";
  const apiKey = process.env.BUNNY_STORAGE_API_KEY ?? "";
  if (!apiKey) return new NextResponse("Storage not configured", { status: 503 });

  const storageUrl = `https://storage.bunnycdn.com/${storageZone}/${key}`;

  let res: Response;
  try {
    res = await fetch(storageUrl, { headers: { AccessKey: apiKey }, cache: "no-store" });
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!res.ok && res.status === 404 && isBunnyS3Configured()) {
    // Some historical DB rows still point at the legacy Bunny Storage URL even
    // though the original object now lives in the current Bunny S3 bucket.
    // ZIP/download requests must still return the untouched original, so on a
    // legacy 404 try the same object key in S3, then the album-id form used by
    // current uploads. No image optimization or conversion is applied here.
    const parts = key.split("/");
    const alternateKey =
      parts.length >= 3 && parts[1] !== album.id
        ? ["albums", album.id, ...parts.slice(2)].join("/")
        : null;
    const candidates = [...new Set([key, alternateKey].filter((value): value is string => !!value))];

    for (const candidateKey of candidates) {
      try {
        const signed = await createBunnyS3PresignedRead(candidateKey, 900);
        const fallback = await fetch(signed, { cache: "no-store" });
        if (fallback.ok && fallback.body) {
          res = fallback;
          console.info("[img] recovered legacy original from Bunny S3", {
            album: album.slug,
            keyMode: candidateKey === key ? "same-key" : "album-id-key",
          });
          break;
        }
      } catch (error) {
        console.warn("[img] Bunny S3 original fallback failed", {
          album: album.slug,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  if (!res.ok) return new NextResponse(null, { status: res.status });
  if (!res.body) return new NextResponse("Empty upstream body", { status: 502 });

  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";
  const contentLength = res.headers.get("Content-Length");
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": privateRead
      ? "private, no-store, max-age=0"
      : "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (privateRead) headers["Referrer-Policy"] = "no-referrer";
  if (contentLength) headers["Content-Length"] = contentLength;

  return new NextResponse(res.body, { headers });
}
