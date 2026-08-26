import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, moments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { galleryLimitForPlan } from "@/lib/gallery-limits";

const MAX_NAME_LEN = 60;

/** Resolve the album for this slug and verify the caller owns it
 *  (Clerk id OR verified-email match). */
async function getOwnedAlbum(slug: string) {
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return { error: NextResponse.json({ error: owner.error }, { status: owner.status }) };
  }
  if (!album) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { album };
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await getOwnedAlbum(slug);
  if (error) return error;

  const rows = await db.query.moments.findMany({
    where: eq(moments.albumId, album.id),
    orderBy: (m, { asc }) => [asc(m.sortOrder), asc(m.createdAt)],
  });

  return NextResponse.json({
    moments: rows,
    limit: galleryLimitForPlan(album.plan),
    plan: album.plan,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await getOwnedAlbum(slug);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LEN) : "";
  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  // A package belongs to one event and includes a fixed number of named
  // galleries inside that event. Enforce this on the server so the limit
  // cannot be bypassed by calling the endpoint directly.
  const limit = galleryLimitForPlan(album.plan);
  const [{ count, max }] = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
      max: sql<number>`COALESCE(MAX(${moments.sortOrder}), -1)`,
    })
    .from(moments)
    .where(eq(moments.albumId, album.id));

  if (Number(count ?? 0) >= limit) {
    return NextResponse.json(
      {
        error: `Gallery limit reached for ${album.plan} plan`,
        code: "gallery_limit_reached",
        plan: album.plan,
        limit,
      },
      { status: 409 },
    );
  }

  const [moment] = await db
    .insert(moments)
    .values({ albumId: album.id, name, sortOrder: (max ?? -1) + 1 })
    .returning();

  return NextResponse.json({ moment, limit });
}

// ─── Rename / Reorder ──────────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await getOwnedAlbum(slug);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await db.query.moments.findFirst({
    where: and(eq(moments.id, id), eq(moments.albumId, album.id)),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: { name?: string; sortOrder?: number } = {};
  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LEN) : "";
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    patch.name = name;
  }
  if (body.sortOrder !== undefined) {
    const so = Number(body.sortOrder);
    if (!Number.isFinite(so)) return NextResponse.json({ error: "Invalid sortOrder" }, { status: 400 });
    patch.sortOrder = Math.trunc(so);
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.update(moments).set(patch).where(eq(moments.id, id));

  return NextResponse.json({ ok: true });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await getOwnedAlbum(slug);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await db.query.moments.findFirst({
    where: and(eq(moments.id, id), eq(moments.albumId, album.id)),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Photos keep existing — moment_id is set to null via the schema FK.
  await db.delete(moments).where(eq(moments.id, id));

  return NextResponse.json({ ok: true });
}
