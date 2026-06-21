import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliateCommissions, affiliates } from "@/lib/db/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { sendAffiliateCommissionApprovedEmail } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/affiliate-lock
 *
 * Daily job that moves affiliate commissions from `pending` to `approved`
 * once their lock period has elapsed. Approved commissions move from the
 * affiliate's pending balance into their available (payable) balance.
 *
 * Authenticated via the standard Vercel cron Bearer token (CRON_SECRET).
 * Schedule this in vercel.json with `0 8 * * *` (08:00 UTC daily).
 */
export async function GET(req: NextRequest) {
  // Fail closed: in any environment where CRON_SECRET is missing, refuse
  // to run. Otherwise `Bearer undefined` would match and an unauth caller
  // could flip pending commissions to approved.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron secret not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await db.query.affiliateCommissions.findMany({
    where: and(
      eq(affiliateCommissions.status, "pending"),
      lte(affiliateCommissions.lockUntil, now),
    ),
  });

  let approved = 0;
  let emailsSent = 0;
  const errors: string[] = [];

  for (const commission of due) {
    try {
      // Atomic transition: only one concurrent invocation wins. If the
      // returned row is empty, another process (or a retry) already
      // approved this commission — skip silently to avoid double-credit.
      const transitioned = await db.update(affiliateCommissions).set({
        status: "approved",
        approvedAt: now,
      }).where(and(
        eq(affiliateCommissions.id, commission.id),
        eq(affiliateCommissions.status, "pending"),
      )).returning();

      if (transitioned.length === 0) continue;

      // Move money pending → available. Safe to do after the atomic
      // status transition above: only the winning transaction reaches here.
      await db.update(affiliates).set({
        pendingBalanceCents: sql`GREATEST(0, ${affiliates.pendingBalanceCents} - ${commission.commissionAmountCents})`,
        availableBalanceCents: sql`${affiliates.availableBalanceCents} + ${commission.commissionAmountCents}`,
        updatedAt: now,
      }).where(eq(affiliates.id, commission.affiliateId));

      approved++;

      // Notify the affiliate — best-effort, never block the cron.
      const affiliate = await db.query.affiliates.findFirst({
        where: eq(affiliates.id, commission.affiliateId),
      });
      if (affiliate) {
        await sendAffiliateCommissionApprovedEmail({
          to: affiliate.email,
          name: affiliate.name,
          locale: affiliate.preferredLocale,
          amountCents: commission.commissionAmountCents,
        });
        emailsSent++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${commission.id}: ${msg}`);
    }
  }

  return NextResponse.json({
    found: due.length,
    approved,
    emailsSent,
    errors,
  });
}
