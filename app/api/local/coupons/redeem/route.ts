import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { localCoupons, localRewardCampaigns } from "@/lib/db/local-rewards-schema";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(8).max(24),
  note: z.string().trim().max(300).optional().default(""),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const code = parsed.code.toUpperCase();

  try {
    const rows = await db
      .select({ coupon: localCoupons, campaign: localRewardCampaigns })
      .from(localCoupons)
      .innerJoin(localRewardCampaigns, eq(localCoupons.campaignId, localRewardCampaigns.id))
      .where(and(
        eq(localCoupons.code, code),
        eq(localRewardCampaigns.ownerClerkId, userId),
      ))
      .limit(1);

    const row = rows[0];
    if (!row) return NextResponse.json({ error: "coupon_not_found" }, { status: 404 });

    if (row.coupon.status === "redeemed") {
      return NextResponse.json({
        success: true,
        alreadyRedeemed: true,
        redeemedAt: row.coupon.redeemedAt,
      });
    }
    if (row.coupon.status === "void" || row.coupon.status === "expired") {
      return NextResponse.json({ error: row.coupon.status }, { status: 409 });
    }

    if (row.coupon.expiresAt && row.coupon.expiresAt.getTime() < Date.now()) {
      await db
        .update(localCoupons)
        .set({ status: "expired" })
        .where(and(eq(localCoupons.id, row.coupon.id), eq(localCoupons.status, "issued")));
      return NextResponse.json({ error: "expired" }, { status: 409 });
    }

    const now = new Date();
    const [redeemed] = await db
      .update(localCoupons)
      .set({
        status: "redeemed",
        redeemedAt: now,
        redeemedBy: userId,
        redemptionNote: parsed.note || null,
      })
      .where(and(
        eq(localCoupons.id, row.coupon.id),
        eq(localCoupons.status, "issued"),
      ))
      .returning({ id: localCoupons.id, redeemedAt: localCoupons.redeemedAt });

    if (!redeemed) {
      const [latest] = await db
        .select({ status: localCoupons.status, redeemedAt: localCoupons.redeemedAt })
        .from(localCoupons)
        .where(eq(localCoupons.id, row.coupon.id))
        .limit(1);
      return NextResponse.json({
        success: latest?.status === "redeemed",
        alreadyRedeemed: latest?.status === "redeemed",
        status: latest?.status,
        redeemedAt: latest?.redeemedAt,
      }, { status: latest?.status === "redeemed" ? 200 : 409 });
    }

    await db
      .update(localRewardCampaigns)
      .set({
        redeemedCount: sql`${localRewardCampaigns.redeemedCount} + 1`,
        updatedAt: now,
      })
      .where(eq(localRewardCampaigns.id, row.campaign.id));

    return NextResponse.json({
      success: true,
      alreadyRedeemed: false,
      redeemedAt: redeemed.redeemedAt,
    });
  } catch (error) {
    console.error("[local/coupons/redeem]", error);
    return NextResponse.json({ error: "local_rewards_not_ready" }, { status: 503 });
  }
}
