import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildAuthUrl, driveConfigured } from "@/lib/google-drive";

export const runtime = "nodejs";

/**
 * GET /api/google-drive/auth?slug=<albumSlug>
 *
 * Starts the Google Drive OAuth flow for an album owner. Redirects the
 * browser to Google's consent screen; the album slug travels in `state`.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) {
    return NextResponse.redirect(new URL(`/dashboard/${slug}?tab=gallery&drive=error`, appUrl));
  }

  if (!driveConfigured()) {
    return NextResponse.redirect(new URL(`/dashboard/${slug}?tab=gallery&drive=notconfigured`, appUrl));
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.redirect(new URL(`/dashboard/${slug}?tab=gallery&drive=error`, appUrl));
  }

  const redirectUri = `${appUrl}/api/google-drive/callback`;
  return NextResponse.redirect(buildAuthUrl(redirectUri, slug));
}
