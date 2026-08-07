import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { and, eq, like } from "drizzle-orm";
import { getPayment, isPaidStatus, mollieConfigured } from "@/lib/mollie";
import { applyPlanToAlbum } from "@/lib/paddle-reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/reconcile-all
 *
 * One-click repair for the "paid but still FREE" bug: finds every album
 * that carries a Mollie payment id (tr_…) but is still on the free plan,
 * re-checks the payment with Mollie, and applies the plan if it's paid.
 *
 * Safe to run any time — applyPlanToAlbum is idempotent (already-upgraded
 * albums are skipped), and only PAID payments trigger an upgrade.
 */
export async function POST(_req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mollieConfigured()) {
    return NextResponse.json({ error: "Mollie not configured" }, { status: 503 });
  }

  // Candidates: free plan + a Mollie payment ref attached.
  const stuck = await db
    .select({
      slug: albums.slug,
      ownerEmail: albums.ownerEmail,
      stripeSessionId: albums.stripeSessionId,
    })
    .from(albums)
    .where(and(eq(albums.plan, "free"), like(albums.stripeSessionId, "tr_%")));

  const fixed: Array<{ slug: string; email: string | null; plan: string }> = [];
  const skipped: Array<{ slug: string; reason: string }> = [];
  let errors = 0;

  for (const a of stuck) {
    const paymentId = a.stripeSessionId!;
    try {
      const payment = await getPayment(paymentId);
      if (!isPaidStatus(payment.status)) {
        skipped.push({ slug: a.slug, reason: `status ${payment.status}` });
        continue;
      }
      const planId = payment.metadata?.planId;
      if (!planId) {
        skipped.push({ slug: a.slug, reason: "no planId in metadata" });
        continue;
      }
      const result = await applyPlanToAlbum(a.slug, planId, paymentId);
      if (result?.status === "applied") {
        fixed.push({ slug: a.slug, email: a.ownerEmail, plan: result.plan });
      } else {
        skipped.push({ slug: a.slug, reason: result?.status ?? "no-op" });
      }
    } catch (err) {
      errors++;
      console.error(`[reconcile-all] ${a.slug} failed:`, err);
      skipped.push({ slug: a.slug, reason: "mollie/db error" });
    }
  }

  return NextResponse.json({
    ok: true,
    examined: stuck.length,
    fixedCount: fixed.length,
    fixed,
    skipped,
    errors,
  });
}
