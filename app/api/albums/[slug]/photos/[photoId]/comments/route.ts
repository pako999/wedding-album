import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, photos, photoComments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasAlbumRequestAccess } from "@/lib/album-request-access";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; photoId: string }> }
) {
  const rl = await checkRateLimit("comment", 10, 60_000);
  if (!rl.ok) return rl.response;

  const { slug, photoId } = await params;
  const payload = await req.json().catch(() => null) as {
    uploaderName?: unknown;
    body?: unknown;
    turnstileToken?: unknown;
  } | null;
  if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const uploaderName = typeof payload.uploaderName === "string" ? payload.uploaderName.trim() : "";
  const commentBody = typeof payload.body === "string" ? payload.body.trim() : "";
  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : undefined;

  if (!uploaderName || uploaderName.length > 80) {
    return NextResponse.json({ error: "uploaderName required (max 80 chars)" }, { status: 400 });
  }
  if (!commentBody || commentBody.length > 500) {
    return NextResponse.json({ error: "body required (max 500 chars)" }, { status: 400 });
  }

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await hasAlbumRequestAccess(req, slug, album))) {
    return NextResponse.json({ error: "Album access required" }, { status: 403 });
  }

  const photo = await db.query.photos
    .findFirst({
      where: and(
        eq(photos.id, photoId),
        eq(photos.albumId, album.id),
        eq(photos.status, "published"),
      ),
    })
    .catch(() => null);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const verification = await verifyTurnstileToken(turnstileToken);
  if (!verification.ok) {
    return NextResponse.json(
      { error: verification.error ?? "Verification failed" },
      { status: verification.status },
    );
  }

  const [comment] = await db
    .insert(photoComments)
    .values({
      photoId,
      albumId: album.id,
      uploaderName,
      body: commentBody,
    })
    .returning();

  return NextResponse.json({
    id: comment.id,
    uploaderName: comment.uploaderName,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
  });
}
