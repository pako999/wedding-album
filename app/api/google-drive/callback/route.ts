import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { exchangeCode, createFolder, uploadToDrive, extForMime } from "@/lib/google-drive";

export const runtime = "nodejs";
export const maxDuration = 60;

const UPLOAD_BATCH = 4;

/**
 * GET /api/google-drive/callback
 *
 * Google redirects here after consent. Exchanges the code for a token,
 * creates a folder in the owner's Drive and uploads every published
 * photo/video of the album. Redirects back to the dashboard with a
 * `drive=ok|partial|denied|error` result.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const slug = params.get("state");
  const code = params.get("code");
  const oauthError = params.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!slug) {
    return NextResponse.json({ error: "Missing state" }, { status: 400 });
  }
  const back = (result: string, extra = "") =>
    NextResponse.redirect(new URL(`/dashboard/${slug}?tab=gallery&drive=${result}${extra}`, appUrl));

  // User declined on Google's consent screen.
  if (oauthError || !code) return back("denied");

  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) return back("error");

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || album.ownerClerkId !== userId) return back("error");

  try {
    const redirectUri = `${appUrl}/api/google-drive/callback`;
    const token = await exchangeCode(code, redirectUri);

    const albumPhotos = await db.query.photos.findMany({
      where: and(eq(photos.albumId, album.id), eq(photos.status, "published")),
      orderBy: (p, { asc }) => [asc(p.sortOrder), asc(p.uploadedAt)],
    });
    if (albumPhotos.length === 0) return back("empty");

    const folderName = `Guestcam – ${album.coupleName || slug}`;
    const folderId = await createFolder(token, folderName);

    // Upload in small parallel batches to stay within the function timeout.
    let uploaded = 0;
    let failed = 0;
    for (let i = 0; i < albumPhotos.length; i += UPLOAD_BATCH) {
      const batch = albumPhotos.slice(i, i + UPLOAD_BATCH);
      const results = await Promise.allSettled(
        batch.map(async (p, j) => {
          const res = await fetch(p.blobUrl);
          if (!res.ok) throw new Error(`Fetch photo failed: ${res.status}`);
          const bytes = await res.arrayBuffer();
          const ext = extForMime(p.mimeType);
          const idx = String(i + j + 1).padStart(3, "0");
          const name = p.originalFilename
            ? `${idx}_${p.originalFilename}`
            : `${idx}_guestcam.${ext}`;
          await uploadToDrive(token, folderId, name, bytes, p.mimeType ?? "image/jpeg");
        }),
      );
      for (const r of results) {
        if (r.status === "fulfilled") uploaded++;
        else { failed++; console.error("[google-drive] upload error:", r.reason); }
      }
    }

    if (uploaded === 0) return back("error");
    return back(failed > 0 ? "partial" : "ok", `&n=${uploaded}`);
  } catch (err) {
    console.error("[google-drive/callback] error:", err);
    return back("error");
  }
}
