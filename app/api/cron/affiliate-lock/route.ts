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
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
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
      await db.transaction(async (tx) => {
        // Lock the row to prevent double-processing if cron overlaps.
        const fresh = await tx.query.affiliateCommissions.findFirst({
          where: eq(affiliateCommissions.id, commission.id),
        });
        if (!fresh || fresh.status !== "pending") return;

        await tx.update(affiliateCommissions).set({
          status: "approved",
          approvedAt: now,
        }).where(eq(affiliateCommissions.id, commission.id));

        // Move money: pending → available.
        await tx.update(affiliates).set({
          pendingBalanceCents: sql`GREATEST(0, ${affiliates.pendingBalanceCents} - ${commission.commissionAmountCents})`,
          availableBalanceCents: sql`${affiliates.availableBalanceCents} + ${commission.commissionAmountCents}`,
          updatedAt: now,
        }).where(eq(affiliates.id, commission.affiliateId));
      });
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
