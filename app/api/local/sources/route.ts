import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { localQrSources, localRewardCampaigns } from "@/lib/db/local-rewards-schema";
import { createLocalSourceCode } from "@/lib/local-rewards/core";

export const runtime = "nodejs";

const schema = z.object({
  campaignId: z.string().min(1).max(100),
  label: z.string().trim().min(1).max(120),
  tableNumber: z.string().trim().max(40).optional().default(""),
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

  try {
    const [campaign] = await db
      .select({ id: localRewardCampaigns.id })
      .from(localRewardCampaigns)
      .where(and(
        eq(localRewardCampaigns.id, parsed.campaignId),
        eq(localRewardCampaigns.ownerClerkId, userId),
      ))
      .limit(1);
    if (!campaign) return NextResponse.json({ error: "campaign_not_found" }, { status: 404 });

    for (let attempt = 0; attempt < 3; attempt++) {
      const code = createLocalSourceCode();
      const inserted = await db
        .insert(localQrSources)
        .values({
          campaignId: campaign.id,
          code,
          label: parsed.label,
          tableNumber: parsed.tableNumber || null,
        })
        .onConflictDoNothing()
        .returning();
      if (inserted[0]) {
        return NextResponse.json({
          success: true,
          source: inserted[0],
          localUrl: `/local/${code}`,
          printUrl: `/dashboard/local/qr/${code}`,
        });
      }
    }

    return NextResponse.json({ error: "source_generation_failed" }, { status: 500 });
  } catch (error) {
    console.error("[local/sources]", error);
    return NextResponse.json({ error: "local_rewards_not_ready" }, { status: 503 });
  }
}
