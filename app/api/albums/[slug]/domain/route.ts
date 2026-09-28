import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDomainStatus, removeProjectDomain } from "@/lib/vercel-domains";
import { checkAlbumOwnership } from "@/lib/album-ownership";

// Retired offering: no plan can register or replace an album domain.
// Preserve authenticated legacy inspection/removal and existing album URLs.
// No database migration, domain removal or DNS change runs on deployment.
async function loadOwnedAlbum(slug: string) {
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

export async function POST() {
  return NextResponse.json(
    { error: "Custom domain registration is no longer available.", code: "CUSTOM_DOMAINS_RETIRED" },
    { status: 410 }
  );
}

// Legacy support only; ownership is still required.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await loadOwnedAlbum(slug);
  if (error) return error;
  if (!album.customDomain) {
    return NextResponse.json({ domain: null, status: null });
  }
  let status = null;
  try {
    status = await getDomainStatus(album.customDomain);
  } catch {
    // Best effort: keep the existing domain visible to its owner.
  }
  return NextResponse.json({ domain: album.customDomain, status });
}

// Keep the owner's ability to remove a legacy domain without an upgrade.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await loadOwnedAlbum(slug);
  if (error) return error;
  if (album.customDomain) {
    try {
      await removeProjectDomain(album.customDomain);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Napaka pri odstranjevanju domene." },
        { status: 502 }
      );
    }
  }
  await db.update(albums)
    .set({ customDomain: null, updatedAt: new Date() })
    .where(eq(albums.id, album.id));
  return NextResponse.json({ ok: true });
}
