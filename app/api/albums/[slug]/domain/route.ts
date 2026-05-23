import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  addProjectDomain,
  getDomainStatus,
  removeProjectDomain,
} from "@/lib/vercel-domains";
import { checkAlbumOwnership } from "@/lib/album-ownership";

// Premium-only custom domain management for an album.
// Owner check: Clerk id OR verified-email match (see checkAlbumOwnership)
// + album.plan === "premium".

// Bare hostname: lowercase letters/digits/hyphens per label, at least one dot.
const HOSTNAME_RE =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function normalizeDomain(input: string): string {
  let d = input.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, ""); // strip scheme
  d = d.split("/")[0]; // strip path
  d = d.split("?")[0]; // strip query
  d = d.split("#")[0]; // strip fragment
  d = d.split(":")[0]; // strip port
  d = d.replace(/\.$/, ""); // strip trailing dot
  return d;
}

async function loadOwnedPremiumAlbum(slug: string) {
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) {
    return { error: NextResponse.json({ error: owner.error }, { status: owner.status }) };
  }
  if (!album) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (album.plan !== "premium") {
    return {
      error: NextResponse.json(
        { error: "Lastna domena je na voljo samo v paketu Premium." },
        { status: 403 }
      ),
    };
  }

  return { album };
}

// ─── POST — register a custom domain ──────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await loadOwnedPremiumAlbum(slug);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const raw = typeof body?.domain === "string" ? body.domain : "";
  const domain = normalizeDomain(raw);

  if (!domain || !HOSTNAME_RE.test(domain)) {
    return NextResponse.json(
      { error: "Neveljavno ime domene." },
      { status: 400 }
    );
  }

  try {
    await addProjectDomain(domain);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Napaka pri registraciji domene." },
      { status: 502 }
    );
  }

  await db
    .update(albums)
    .set({ customDomain: domain, updatedAt: new Date() })
    .where(eq(albums.id, album.id));

  let status = null;
  try {
    status = await getDomainStatus(domain);
  } catch {
    // Domain saved; status will be available on next GET/refresh.
  }

  return NextResponse.json({ ok: true, domain, status });
}

// ─── GET — current domain + verification status ───────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await loadOwnedPremiumAlbum(slug);
  if (error) return error;

  if (!album.customDomain) {
    return NextResponse.json({ domain: null, status: null });
  }

  let status = null;
  try {
    status = await getDomainStatus(album.customDomain);
  } catch {
    // Best-effort — return the domain even if Vercel status lookup fails.
  }

  return NextResponse.json({ domain: album.customDomain, status });
}

// ─── DELETE — remove the custom domain ────────────────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { album, error } = await loadOwnedPremiumAlbum(slug);
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

  await db
    .update(albums)
    .set({ customDomain: null, updatedAt: new Date() })
    .where(eq(albums.id, album.id));

  return NextResponse.json({ ok: true });
}
