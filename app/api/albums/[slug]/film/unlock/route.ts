import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { albums, filmGenerations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// The demo dashboard account that may unlock Film Studio for a single film.
const DEMO_FILM_SLUG = "marko-40-udt5";

/**
 * POST /api/albums/[slug]/film/unlock
 *
 * Demo-only: unlocks Film Studio so the owner can render exactly ONE
 * montage. After that montage is submitted the generate route locks it
 * again — and this route refuses once a film already exists, so the
 * demo can never produce a second video.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (slug !== DEMO_FILM_SLUG) {
    return NextResponse.json({ error: "not_demo" }, { status: 403 });
  }

  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || album.ownerClerkId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // One film only — refuse if a montage already exists for this album.
  const existing = await db
    .select({ id: filmGenerations.id })
    .from(filmGenerations)
    .where(eq(filmGenerations.albumId, album.id))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "already_used" }, { status: 409 });
  }

  await db.update(albums).set({ filmTier: "premium" }).where(eq(albums.id, album.id));
  return NextResponse.json({ ok: true });
}
