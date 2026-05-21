import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const PLAN_CONFIG: Record<string, { maxPhotos: number; daysAccess: number | null }> = {
  free:    { maxPhotos: 20,      daysAccess: 30  },
  basic:   { maxPhotos: 1000,    daysAccess: 90  },
  plus:    { maxPhotos: 999_999, daysAccess: 365 },
  premium: { maxPhotos: 999_999, daysAccess: 365 },
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const newPlan = body.plan as "free" | "basic" | "plus" | "premium" | undefined;
  if (!newPlan || !PLAN_CONFIG[newPlan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const config = PLAN_CONFIG[newPlan];
  const expiresAt = config.daysAccess ? new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000) : null;

  // Premium plan auto-unlocks Film Studio (mirrors the Stripe webhook).
  const filmTierUpdate = newPlan === "premium" ? { filmTier: "premium" as const } : {};

  const r = await db
    .update(albums)
    .set({
      plan: newPlan,
      maxPhotos: config.maxPhotos,
      expiresAt: expiresAt ?? undefined,
      ...filmTierUpdate,
    })
    .where(eq(albums.slug, slug))
    .returning();

  if (r.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ slug: r[0].slug, plan: r[0].plan });
}
