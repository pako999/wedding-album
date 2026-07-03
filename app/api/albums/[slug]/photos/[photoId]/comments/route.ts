import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, photoComments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/albums/[slug]/photos/[photoId]/comments
 * Body: { uploaderName: string; body: string }
 * Returns: the new comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  // 10 comments per minute per IP — well above real user behaviour,
  // blocks a script from spraying spam.
  const rl = await checkRateLimit("comment", 10, 60_000);
  if (!rl.ok) return rl.response;

  const { slug, photoId } = await params;
  const payload = await req.json() as {
    uploaderName: string;
    body: string;
    turnstileToken?: string;
  };
  const { uploaderName, body, turnstileToken } = payload;

  if (!uploaderName?.trim()) {
    return NextResponse.json({ error: "uploaderName required" }, { status: 400 });
  }
  if (!body?.trim() || body.trim().length > 500) {
    return NextResponse.json({ error: "body required (max 500 chars)" }, { status: 400 });
  }

  // Cloudflare Turnstile verification (optional — only enforced when secret key is set)
  const cfSecret = process.env.CF_TURNSTILE_SECRET_KEY;
  if (cfSecret) {
    if (!turnstileToken) {
      return NextResponse.json({ error: "Verification required" }, { status: 403 });
    }
    try {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: cfSecret, response: turnstileToken }),
      });
      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return NextResponse.json({ error: "Bot verification failed" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Verification error" }, { status: 500 });
    }
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const photo = await db.query.photos
    .findFirst({ where: and(eq(photos.id, photoId), eq(photos.albumId, album.id)) })
    .catch(() => null);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [comment] = await db
    .insert(photoComments)
    .values({
      photoId,
      albumId: album.id,
      uploaderName: uploaderName.trim(),
      body: body.trim(),
    })
    .returning();

  return NextResponse.json({
    id: comment.id,
    uploaderName: comment.uploaderName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  });
}
