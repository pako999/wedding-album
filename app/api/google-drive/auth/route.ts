import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildAuthUrl, createDriveState, driveConfigured } from "@/lib/google-drive";
import { checkAlbumOwnership } from "@/lib/album-ownership";

export const runtime = "nodejs";

/**
 * GET /api/google-drive/auth?slug=<albumSlug>
 * Starts OAuth for an authenticated album owner/admin. `state` is HMAC-signed,
 * short-lived and bound to the Clerk user so the callback cannot be swapped to
 * a different album.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim() ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) {
    return NextResponse.redirect(new URL(`/dashboard/${encodeURIComponent(slug)}?tab=gallery&drive=error`, appUrl));
  }

  if (!driveConfigured()) {
    return NextResponse.redirect(new URL(`/dashboard/${encodeURIComponent(slug)}?tab=gallery&drive=notconfigured`, appUrl));
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album) {
    return NextResponse.redirect(new URL(`/dashboard/${encodeURIComponent(slug)}?tab=gallery&drive=error`, appUrl));
  }

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok || owner.userId !== userId) {
    return NextResponse.redirect(new URL(`/dashboard/${encodeURIComponent(slug)}?tab=gallery&drive=error`, appUrl));
  }

  const redirectUri = `${appUrl}/api/google-drive/callback`;
  const state = createDriveState(slug, userId);
  return NextResponse.redirect(buildAuthUrl(redirectUri, state));
}
