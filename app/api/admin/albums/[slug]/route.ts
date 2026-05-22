import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * Pseudo-plans the admin dropdown supports beyond the four real plans.
 * Both map to the underlying premium plan (full feature access including
 * Film Studio) but stamp the album's stripeSessionId with a "comp:..."
 * sentinel so the dashboard revenue / paid-customer stats don't count
 * them as Stripe-paying customers.
 *
 *   influencer  → free comp account given to a content creator
 *   sponsor     → free comp account given to a brand/wedding-venue partner
 */
type AdminPlan = "free" | "basic" | "plus" | "premium" | "influencer" | "sponsor";

const PLAN_CONFIG: Record<AdminPlan, {
  effectivePlan: "free" | "basic" | "plus" | "premium";
  maxPhotos: number;
  daysAccess: number | null;
  /** When set, the album's stripeSessionId is overwritten with this sentinel
   *  so the comp account doesn't pollute revenue stats. */
  compTag?: "comp:influencer" | "comp:sponsor";
}> = {
  free:       { effectivePlan: "free",    maxPhotos: 20,      daysAccess: 30  },
  basic:      { effectivePlan: "basic",   maxPhotos: 1000,    daysAccess: 90  },
  plus:       { effectivePlan: "plus",    maxPhotos: 999_999, daysAccess: 365 },
  premium:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365 },
  influencer: { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:influencer" },
  sponsor:    { effectivePlan: "premium", maxPhotos: 999_999, daysAccess: 365, compTag: "comp:sponsor" },
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const newPlan = body.plan as AdminPlan | undefined;
  if (!newPlan || !PLAN_CONFIG[newPlan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const config = PLAN_CONFIG[newPlan];
  const expiresAt = config.daysAccess
    ? new Date(Date.now() + config.daysAccess * 24 * 60 * 60 * 1000)
    : null;

  // Premium plan + comp-as-premium pseudo-plans auto-unlock Film Studio,
  // matching the Stripe webhook's behaviour for real premium purchases.
  const filmTierUpdate =
    config.effectivePlan === "premium" ? { filmTier: "premium" as const } : {};

  // Stamp the comp tag so revenue stats can exclude it. For real plans,
  // leave stripeSessionId alone (don't blow away a real cs_ id).
  const sessionIdUpdate = config.compTag
    ? { stripeSessionId: config.compTag }
    : {};

  const r = await db
    .update(albums)
    .set({
      plan: config.effectivePlan,
      maxPhotos: config.maxPhotos,
      expiresAt: expiresAt ?? undefined,
      ...filmTierUpdate,
      ...sessionIdUpdate,
    })
    .where(eq(albums.slug, slug))
    .returning();

  if (r.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    slug: r[0].slug,
    plan: r[0].plan,
    comp: config.compTag ?? null,
  });
}
