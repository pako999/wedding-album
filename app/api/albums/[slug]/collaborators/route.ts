import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { addCollaborator, listCollaborators, removeCollaborator } from "@/lib/wall-collaborators";

export const runtime = "nodejs";

/** Managing WHO collaborates is owner-only — a collaborator must not be
 *  able to invite further collaborators or remove the owner's list. */
async function requireOwnedAlbum(slug: string) {
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album) return { error: NextResponse.json({ error: "Album not found" }, { status: 404 }) };
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) return { error: NextResponse.json({ error: owner.error }, { status: owner.status }) };
  return { album, userId: owner.userId };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;
  const rows = await listCollaborators(res.album.id);
  return NextResponse.json({
    collaborators: rows.map((r) => ({ id: r.id, email: r.email, createdAt: r.createdAt })),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;
  const body = await req.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  // Light shape check only — the invite is inert until someone signs in
  // with this address VERIFIED, so a typo grants nothing to anyone.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if ((await listCollaborators(res.album.id)).length >= 10) {
    return NextResponse.json({ error: "too_many" }, { status: 400 });
  }
  const ok = await addCollaborator(res.album.id, email, res.userId ?? null);
  if (!ok) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  return NextResponse.json({ collaborators: (await listCollaborators(res.album.id)).map((r) => ({ id: r.id, email: r.email, createdAt: r.createdAt })) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await requireOwnedAlbum(slug);
  if (res.error) return res.error;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await removeCollaborator(res.album.id, id);
  return NextResponse.json({ ok: true });
}
