import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[clerkId]/upgrade  body: { plan }
 *
 * Manual admin override: bulk-promote every album owned by the given
 * Clerk user to the requested plan. Mirrors the per-album PATCH endpoint
 * but operates on a whole account at once, which is how the Uporabniki
 * page wants to act on users.
 *
 * Pseudo-plans:
 *   influencer / sponsor → effective premium, stamped with comp: tag so
 *   revenue stats can exclude them.
 */
type AdminPlan = "free" | "basic" | "plus" | "premium" | "influencer" | "sponsor";

const PLAN_CONFIG: Record<AdminPlan, {
  effectivePlan: "free" | "basic" | "plus" | "premium";
  maxPhotos: number;
  daysAccess: number | null;
  compTag?: "comp:influencer" | "comp:sponsor";
}> = {
  free:       { effectivePlan: "free",    maxPhotos: 20,      daysAccess: 30  },
  basic:      { effectivePlan: "basic",   maxPhotos: 1000,    daysAccess: 90  },
  plus:       { effectivePlan: "plus",    maxPhotos: 999_999, daysAccess: 365 },
  premium:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365 },
  influencer: { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:influencer" },
  sponsor:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:sponsor" },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clerkId } = await params;
  const body = await req.json().catch(() => ({}));
  const newPlan = body.plan as AdminPlan | undefined;
  if (!newPlan || !PLAN_CONFIG[newPlan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const config = PLAN_CONFIG[newPlan];
  const expiresAt = config.daysAccess
    ? new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000)
    : null;
  const filmTierUpdate = config.effectivePlan === "premium" ? { filmTier: "premium" as const } : {};
  const sessionIdUpdate = config.compTag ? { stripeSessionId: config.compTag } : {};

  const r = await db
    .update(albums)
    .set({
      plan: config.effectivePlan,
      maxPhotos: config.maxPhotos,
      expiresAt: expiresAt ?? undefined,
      ...filmTierUpdate,
      ...sessionIdUpdate,
    })
    .where(and(eq(albums.ownerClerkId, clerkId)))
    .returning({ id: albums.id, slug: albums.slug });

  return NextResponse.json({ updated: r.length, slugs: r.map((x) => x.slug) });
}
