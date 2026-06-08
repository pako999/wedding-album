import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { clerkClient } from "@clerk/nextjs/server";

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

  // Try album email first, then fall back to Clerk account email
  let email = album.notifyEmail ?? album.ownerEmail ?? null;
  let clerkName: string | null = null;

  if (!email && album.ownerClerkId) {
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(album.ownerClerkId);
      email = user.emailAddresses?.[0]?.emailAddress ?? null;
      const first = user.firstName ?? "";
      const last = user.lastName ?? "";
      if (first || last) clerkName = `${first} ${last}`.trim();
    } catch { /* Clerk unavailable */ }
  }

  return NextResponse.json({
    email,
    clerkName,
    coupleName: album.coupleName,
    plan: album.plan,
  });
}
