import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);

  if (!album) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    email: album.notifyEmail ?? album.ownerEmail ?? null,
    coupleName: album.coupleName,
    plan: album.plan,
  });
}
