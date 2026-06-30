import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { sendAffiliateWelcomeEmail } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

const LOCK_DAYS  = Number(process.env.AFFILIATE_COMMISSION_LOCK_DAYS ?? 14);
const MIN_PAYOUT = Number(process.env.AFFILIATE_MIN_PAYOUT ?? 20);

/**
 * POST /api/admin/affiliates/[id]/resend-welcome
 *
 * Manually re-sends the partner welcome email (which contains the
 * referral code + tracking link). Useful when the first delivery
 * landed in spam or the partner can't find it. Only works on
 * already-approved (active) affiliates.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const row = await db.query.affiliates.findFirst({ where: eq(affiliates.id, id) });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.status !== "active") {
    return NextResponse.json({ error: "Partner ni potrjen" }, { status: 400 });
  }

  try {
    await sendAffiliateWelcomeEmail({
      to: row.email,
      name: row.name,
      locale: row.preferredLocale,
      referralCode: row.referralCode,
      commissionRate: row.commissionRate,
      lockDays: LOCK_DAYS,
      minPayoutEur: MIN_PAYOUT,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin affiliate resend-welcome] failed:", err);
    return NextResponse.json({ error: "Pošiljanje ni uspelo" }, { status: 500 });
  }
}
