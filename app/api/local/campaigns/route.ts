import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import {
  localRewardCampaigns,
  localRewardProducts,
  localQrSources,
} from "@/lib/db/local-rewards-schema";
import { createLocalSourceCode } from "@/lib/local-rewards/core";

export const runtime = "nodejs";

const createCampaignSchema = z.object({
  albumId: z.string().min(1),
  venueName: z.string().trim().min(2).max(120),
  campaignName: z.string().trim().min(2).max(120),
  headline: z.string().trim().max(180).optional().default(""),
  rewardType: z.enum(["percent", "fixed", "free_item", "custom"]),
  rewardValue: z.number().int().nonnegative().nullable().optional(),
  rewardCurrency: z.string().trim().length(3).default("EUR"),
  rewardTitle: z.string().trim().min(2).max(160),
  rewardDescription: z.string().trim().max(500).optional().default(""),
  rewardTerms: z.string().trim().max(1000).optional().default(""),
  validDays: z.number().int().min(0).max(365).default(30),
  maxCoupons: z.number().int().positive().max(1_000_000).nullable().optional(),
  products: z.array(z.string().trim().min(1).max(120)).max(100).default([]),
  sourceLabel: z.string().trim().min(1).max(120).default("Glavni QR"),
  tableNumber: z.string().trim().max(40).optional().default(""),
  socialBonusEnabled: z.boolean().default(false),
  socialBonusText: z.string().trim().max(500).optional().default(""),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let parsed: z.infer<typeof createCampaignSchema>;
  try {
    parsed = createCampaignSchema.parse(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: "invalid_request", details: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }

  const album = await db.query.albums.findFirst({
    where: and(eq(albums.id, parsed.albumId), eq(albums.ownerClerkId, userId)),
  });
  if (!album) return NextResponse.json({ error: "album_not_found" }, { status: 404 });

  if (parsed.rewardType === "percent" && (parsed.rewardValue == null || parsed.rewardValue > 100)) {
    return NextResponse.json({ error: "invalid_percent" }, { status: 400 });
  }

  try {
    const [campaign] = await db.insert(localRewardCampaigns).values({
      albumId: album.id,
      ownerClerkId: userId,
      venueName: parsed.venueName,
      campaignName: parsed.campaignName,
      headline: parsed.headline || null,
      rewardType: parsed.rewardType,
      rewardValue: parsed.rewardValue ?? null,
      rewardCurrency: parsed.rewardCurrency.toUpperCase(),
      rewardTitle: parsed.rewardTitle,
      rewardDescription: parsed.rewardDescription || null,
      rewardTerms: parsed.rewardTerms || null,
      validDays: parsed.validDays,
      maxCoupons: parsed.maxCoupons ?? null,
      socialBonusEnabled: parsed.socialBonusEnabled,
      socialBonusText: parsed.socialBonusEnabled ? (parsed.socialBonusText || null) : null,
    }).returning();

    if (parsed.products.length) {
      await db.insert(localRewardProducts).values(
        parsed.products.map((name, index) => ({
          campaignId: campaign.id,
          name,
          sortOrder: index,
        })),
      );
    }

    let sourceCode = createLocalSourceCode();
    let sourceId: string | null = null;
    // Unique collision is extremely unlikely; retry once without surfacing it to the user.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const [source] = await db.insert(localQrSources).values({
          campaignId: campaign.id,
          code: sourceCode,
          label: parsed.sourceLabel,
          tableNumber: parsed.tableNumber || null,
        }).returning();
        sourceId = source.id;
        break;
      } catch (error) {
        if (attempt === 1) throw error;
        sourceCode = createLocalSourceCode();
      }
    }

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      sourceId,
      sourceCode,
      localUrl: `/local/${sourceCode}`,
    });
  } catch (error) {
    console.error("[local/campaigns] create failed", error);
    return NextResponse.json(
      { error: "local_rewards_not_ready", message: "Local Rewards database migration is not active yet." },
      { status: 503 },
    );
  }
}
