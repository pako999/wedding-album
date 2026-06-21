import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { affiliates, affiliateCommissions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { sendAffiliateWelcomeEmail } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

const LOCK_DAYS = Number(process.env.AFFILIATE_COMMISSION_LOCK_DAYS ?? 14);
const MIN_PAYOUT = Number(process.env.AFFILIATE_MIN_PAYOUT ?? 20);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.id, id),
  });
  if (!affiliate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const commissions = await db
    .select()
    .from(affiliateCommissions)
    .where(eq(affiliateCommissions.affiliateId, id))
    .orderBy(desc(affiliateCommissions.createdAt))
    .limit(50);

  return NextResponse.json({ affiliate, commissions });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    status?: "pending" | "active" | "suspended" | "rejected";
    commissionRate?: number;
    notes?: string;
  };

  const current = await db.query.affiliates.findFirst({
    where: eq(affiliates.id, id),
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) updates.status = body.status;
  if (typeof body.commissionRate === "number") {
    if (body.commissionRate < 1 || body.commissionRate > 100) {
      return NextResponse.json({ error: "Commission rate must be 1–100" }, { status: 400 });
    }
    updates.commissionRate = Math.round(body.commissionRate);
  }
  if (body.notes !== undefined) updates.notes = body.notes;

  // Transitioning to active for the first time → send welcome email + set approvedAt.
  const becomesActive = body.status === "active" && current.status !== "active";
  if (becomesActive) updates.approvedAt = new Date();

  const [row] = await db.update(affiliates)
    .set(updates)
    .where(eq(affiliates.id, id))
    .returning();

  if (becomesActive) {
    await sendAffiliateWelcomeEmail({
      to: row.email,
      name: row.name,
      locale: row.preferredLocale,
      referralCode: row.referralCode,
      commissionRate: row.commissionRate,
      lockDays: LOCK_DAYS,
      minPayoutEur: MIN_PAYOUT,
    }).catch((err) => console.error("[admin affiliate welcome email] failed:", err));
  }

  return NextResponse.json(row);
}
