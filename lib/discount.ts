import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { BUSINESS_PRICE_EUR, PREMIUM_REGULAR_PRICE_EUR } from "@/lib/plan-pricing";

export const PLAN_PRICES: Record<string, number> = {
  basic:   39,
  plus:    49,
  premium: PREMIUM_REGULAR_PRICE_EUR,
  business: BUSINESS_PRICE_EUR,
};

export interface DiscountResult {
  valid: true;
  discountCodeId: string;
  percentOff: number;
  originalPrice: number;
  finalPrice: number;
  finalCents: number;
  /** Affiliate that owns this code (if any) — caller uses this to also
   *  attribute a commission on top of the customer discount. */
  affiliateId: string | null;
}

export interface DiscountError {
  valid: false;
  error: string;
}

export async function validateDiscount(
  code: string,
  planId: string,
  basePriceCents?: number,
): Promise<DiscountResult | DiscountError> {
  const originalPrice = basePriceCents === undefined ? PLAN_PRICES[planId] : basePriceCents / 100;
  if (originalPrice === undefined) {
    return { valid: false, error: "Neznan paket." };
  }

  const row = await db.query.discountCodes.findFirst({
    where: eq(discountCodes.code, code.toUpperCase().trim()),
  });

  if (!row) return { valid: false, error: "Koda ni veljavna." };
  if (!row.isActive) return { valid: false, error: "Koda je bila deaktivirana." };
  if (row.expiresAt && row.expiresAt < new Date()) return { valid: false, error: "Koda je potekla." };
  if (row.maxUses !== null && row.usedCount >= row.maxUses) return { valid: false, error: "Koda je bila že v celoti izkoriščena." };

  const finalCents = planId === 'premium' ? Math.round(originalPrice * 100 * (1 - row.percentOff / 100)) : Math.round(originalPrice * (1 - row.percentOff / 100)) * 100;
  const finalPrice = finalCents / 100;

  return {
    valid: true,
    discountCodeId: row.id,
    percentOff: row.percentOff,
    originalPrice,
    finalPrice,
    finalCents,
    affiliateId: row.affiliateId ?? null,
  };
}

export async function incrementDiscountUsage(discountCodeId: string) {
  await db
    .update(discountCodes)
    .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
    .where(
      and(
        eq(discountCodes.id, discountCodeId),
        or(isNull(discountCodes.maxUses), sql`${discountCodes.usedCount} < ${discountCodes.maxUses}`),
      ),
    );
}
