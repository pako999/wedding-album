import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { localCoupons, localRewardCampaigns } from "@/lib/db/local-rewards-schema";
import { sendLocalRewardEmail } from "@/lib/email/local-reward";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(8).max(24),
  claimToken: z.string().trim().min(16).max(80),
  email: z.string().trim().email().max(254),
  marketingConsent: z.boolean().default(false),
  locale: z.enum(["sl", "hr", "sr", "en", "de", "es"]).optional(),
});

const CONSENT_COPY: Record<string, (venue: string) => string> = {
  sl: (v) => `Želim prejemati ponudbe in novosti lokala ${v}.`,
  hr: (v) => `Želim primati ponude i novosti lokala ${v}.`,
  sr: (v) => `Želim da primam ponude i novosti lokala ${v}.`,
  en: (v) => `I want to receive offers and news from ${v}.`,
  de: (v) => `Ich möchte Angebote und Neuigkeiten von ${v} erhalten.`,
  es: (v) => `Quiero recibir ofertas y novedades de ${v}.`,
};

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit("local-coupon-email", 20, 60_000);
  if (!rl.ok) return rl.response;

  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const code = parsed.code.toUpperCase();
  const email = parsed.email.toLowerCase();

  try {
    const rows = await db
      .select({ coupon: localCoupons, campaign: localRewardCampaigns })
      .from(localCoupons)
      .innerJoin(localRewardCampaigns, eq(localCoupons.campaignId, localRewardCampaigns.id))
      .where(and(
        eq(localCoupons.code, code),
        eq(localCoupons.claimToken, parsed.claimToken),
      ))
      .limit(1);
    const row = rows[0];
    if (!row) return NextResponse.json({ error: "coupon_not_found" }, { status: 404 });

    const locale = parsed.locale ?? row.coupon.locale ?? "en";
    const consentText = parsed.marketingConsent
      ? (CONSENT_COPY[locale] ?? CONSENT_COPY.en)(row.campaign.venueName)
      : null;

    await db
      .update(localCoupons)
      .set({
        guestEmail: email,
        venueMarketingConsent: parsed.marketingConsent,
        consentTimestamp: parsed.marketingConsent ? new Date() : null,
        consentText,
        locale,
      })
      .where(eq(localCoupons.id, row.coupon.id));

    await sendLocalRewardEmail({
      to: email,
      venueName: row.campaign.venueName,
      couponCode: row.coupon.code,
      rewardTitle: row.coupon.rewardTitle,
      rewardDescription: row.coupon.rewardDescription,
      rewardTerms: row.coupon.rewardTerms,
      expiresAt: row.coupon.expiresAt,
      locale,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[local/coupons/email]", error);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
