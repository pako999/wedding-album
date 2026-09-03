import { NextRequest, NextResponse } from "next/server";
import { and, eq, lt, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { albums, photos } from "@/lib/db/schema";
import {
  localCoupons,
  localQrSources,
  localRewardCampaigns,
  localRewardProducts,
} from "@/lib/db/local-rewards-schema";
import {
  couponExpiry,
  createLocalCouponCode,
  isCampaignLive,
} from "@/lib/local-rewards/core";

export const runtime = "nodejs";

const bodySchema = z.object({
  sourceCode: z.string().trim().min(5).max(32),
  photoId: z.string().trim().min(8).max(100),
  claimToken: z.string().trim().min(16).max(80),
  locale: z.enum(["sl", "hr", "sr", "en", "de", "es"]).optional(),
});

const MAX_PHOTO_AGE_MS = 30 * 60 * 1000;

function publicCoupon(
  coupon: typeof localCoupons.$inferSelect,
  venueName: string,
  products: string[],
) {
  return {
    id: coupon.id,
    code: coupon.code,
    status: coupon.status,
    rewardTitle: coupon.rewardTitle,
    rewardDescription: coupon.rewardDescription,
    rewardTerms: coupon.rewardTerms,
    venueName,
    locale: coupon.locale ?? "en",
    issuedAt: coupon.issuedAt,
    expiresAt: coupon.expiresAt,
    redeemedAt: coupon.redeemedAt,
    products,
    redeemUrl: `/dashboard/local/redeem/${encodeURIComponent(coupon.code)}`,
  };
}

async function releaseReservation(campaignId: string) {
  await db
    .update(localRewardCampaigns)
    .set({
      issuedCount: sql`GREATEST(${localRewardCampaigns.issuedCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(localRewardCampaigns.id, campaignId))
    .catch(() => {});
}

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (error) {
    return NextResponse.json(
      { error: "invalid_request", details: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }

  const sourceCode = parsed.sourceCode.toUpperCase();

  try {
    const rows = await db
      .select({ source: localQrSources, campaign: localRewardCampaigns, album: albums })
      .from(localQrSources)
      .innerJoin(localRewardCampaigns, eq(localQrSources.campaignId, localRewardCampaigns.id))
      .innerJoin(albums, eq(localRewardCampaigns.albumId, albums.id))
      .where(eq(localQrSources.code, sourceCode))
      .limit(1);

    const row = rows[0];
    if (!row || !row.source.isActive || !isCampaignLive(row.campaign)) {
      return NextResponse.json({ error: "campaign_unavailable" }, { status: 409 });
    }

    const photo = await db.query.photos.findFirst({
      where: and(eq(photos.id, parsed.photoId), eq(photos.albumId, row.campaign.albumId)),
    });
    if (!photo) {
      return NextResponse.json({ error: "upload_not_found" }, { status: 400 });
    }

    const uploadedAt = photo.uploadedAt instanceof Date ? photo.uploadedAt : new Date(photo.uploadedAt);
    if (!Number.isFinite(uploadedAt.getTime()) || Date.now() - uploadedAt.getTime() > MAX_PHOTO_AGE_MS) {
      return NextResponse.json({ error: "upload_too_old" }, { status: 409 });
    }

    const products = await db
      .select({ name: localRewardProducts.name })
      .from(localRewardProducts)
      .where(and(
        eq(localRewardProducts.campaignId, row.campaign.id),
        eq(localRewardProducts.isActive, true),
      ));
    const productNames = products.map((p) => p.name);

    // Idempotency: a multi-photo batch, retry, refresh or double tap must return
    // the same coupon rather than create a second reward.
    const [existing] = await db
      .select()
      .from(localCoupons)
      .where(or(
        eq(localCoupons.claimToken, parsed.claimToken),
        eq(localCoupons.photoId, photo.id),
      ))
      .limit(1);

    if (existing) {
      if (existing.campaignId !== row.campaign.id) {
        return NextResponse.json({ error: "claim_already_used" }, { status: 409 });
      }
      return NextResponse.json({
        success: true,
        alreadyIssued: true,
        coupon: publicCoupon(existing, row.campaign.venueName, productNames),
      });
    }

    // Reserve one slot atomically. This keeps maxCoupons meaningful when many
    // guests upload at the same moment from the same venue Wi-Fi.
    const reservationWhere = row.campaign.maxCoupons == null
      ? and(
          eq(localRewardCampaigns.id, row.campaign.id),
          eq(localRewardCampaigns.isActive, true),
        )
      : and(
          eq(localRewardCampaigns.id, row.campaign.id),
          eq(localRewardCampaigns.isActive, true),
          lt(localRewardCampaigns.issuedCount, row.campaign.maxCoupons),
        );

    const [reserved] = await db
      .update(localRewardCampaigns)
      .set({
        issuedCount: sql`${localRewardCampaigns.issuedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(reservationWhere)
      .returning({ id: localRewardCampaigns.id });

    if (!reserved) {
      return NextResponse.json({ error: "rewards_exhausted" }, { status: 409 });
    }

    const now = new Date();
    const expiresAt = couponExpiry(row.campaign.validDays, now);
    let inserted: typeof localCoupons.$inferSelect | undefined;

    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      const code = createLocalCouponCode();
      const created = await db
        .insert(localCoupons)
        .values({
          campaignId: row.campaign.id,
          albumId: row.campaign.albumId,
          sourceId: row.source.id,
          photoId: photo.id,
          claimToken: parsed.claimToken,
          code,
          status: "issued",
          guestName: photo.uploaderName ?? null,
          locale: parsed.locale ?? row.album.defaultLang ?? "en",
          rewardTitle: row.campaign.rewardTitle,
          rewardDescription: row.campaign.rewardDescription,
          rewardTerms: row.campaign.rewardTerms,
          issuedAt: now,
          expiresAt,
        })
        .onConflictDoNothing()
        .returning();

      inserted = created[0];
      if (inserted) break;

      // If another request won the same claim/photo race, return that coupon.
      const [raced] = await db
        .select()
        .from(localCoupons)
        .where(or(
          eq(localCoupons.claimToken, parsed.claimToken),
          eq(localCoupons.photoId, photo.id),
        ))
        .limit(1);
      if (raced) {
        await releaseReservation(row.campaign.id);
        return NextResponse.json({
          success: true,
          alreadyIssued: true,
          coupon: publicCoupon(raced, row.campaign.venueName, productNames),
        });
      }
      // Otherwise the improbable conflict was only the generated coupon code;
      // retry with a fresh code while keeping the reservation.
    }

    if (!inserted) {
      await releaseReservation(row.campaign.id);
      return NextResponse.json({ error: "coupon_generation_failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alreadyIssued: false,
      coupon: publicCoupon(inserted, row.campaign.venueName, productNames),
    });
  } catch (error) {
    console.error("[local/coupons/issue]", error);
    return NextResponse.json(
      { error: "local_rewards_not_ready", message: "Local Rewards database migration is not active yet." },
      { status: 503 },
    );
  }
}
