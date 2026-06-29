import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, userPlanOverrides } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/users/[clerkId]/upgrade  body: { plan }
 *
 * Manual admin override that BOTH:
 *   1. Bulk-promotes every existing album owned by the Clerk user to the
 *      requested plan (matches the per-album PATCH endpoint).
 *   2. Records a user-level override in `user_plan_overrides` so the next
 *      gallery the user creates lands on the chosen plan automatically —
 *      this is what makes it useful for users who have NOT yet created
 *      a gallery (zero rows in `albums` to update).
 *
 * Plan === "free" wipes the override (cancels a pending upgrade).
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
  filmTier: "free" | "pro" | "premium";
}> = {
  free:       { effectivePlan: "free",    maxPhotos: 20,      daysAccess: 30,  filmTier: "free"    },
  basic:      { effectivePlan: "basic",   maxPhotos: 1000,    daysAccess: 90,  filmTier: "free"    },
  plus:       { effectivePlan: "plus",    maxPhotos: 999_999, daysAccess: 365, filmTier: "free"    },
  premium:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, filmTier: "premium" },
  influencer: { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:influencer", filmTier: "premium" },
  sponsor:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:sponsor",    filmTier: "premium" },
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
  const sessionIdUpdate = config.compTag ? { stripeSessionId: config.compTag } : {};

  // 1) Bulk-update any existing albums.
  const r = await db
    .update(albums)
    .set({
      plan: config.effectivePlan,
      maxPhotos: config.maxPhotos,
      filmTier: config.filmTier,
      expiresAt: expiresAt ?? undefined,
      ...sessionIdUpdate,
    })
    .where(eq(albums.ownerClerkId, clerkId))
    .returning({ slug: albums.slug });

  // 2) Maintain the user-level override.
  if (newPlan === "free") {
    // Free = wipe the pending override.
    await db.delete(userPlanOverrides).where(eq(userPlanOverrides.clerkId, clerkId));
  } else {
    await db
      .insert(userPlanOverrides)
      .values({
        clerkId,
        plan: config.effectivePlan,
        maxPhotos: config.maxPhotos,
        filmTier: config.filmTier,
        daysAccess: config.daysAccess,
        compTag: config.compTag ?? null,
      })
      .onConflictDoUpdate({
        target: userPlanOverrides.clerkId,
        set: {
          plan: config.effectivePlan,
          maxPhotos: config.maxPhotos,
          filmTier: config.filmTier,
          daysAccess: config.daysAccess,
          compTag: config.compTag ?? null,
        },
      });
  }

  return NextResponse.json({
    updated: r.length,
    slugs: r.map((x) => x.slug),
    overrideSaved: newPlan !== "free",
  });
}
