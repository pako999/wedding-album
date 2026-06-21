import { db } from "@/lib/db";
import { discountCodes } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const PLAN_PRICES: Record<string, number> = {
  basic:   39,
  plus:    49,
  premium: 79,
};

export interface DiscountResult {
  valid: true;
  discountCodeId: string;
  percentOff: number;
  originalPrice: number;
  finalPrice: number;
  finalCents: number;
}

export interface DiscountError {
  valid: false;
  error: string;
}

export async function validateDiscount(
  code: string,
  planId: string,
): Promise<DiscountResult | DiscountError> {
  const originalPrice = PLAN_PRICES[planId];
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

  const finalPrice = Math.round(originalPrice * (1 - row.percentOff / 100));
  const finalCents = finalPrice * 100;

  return {
    valid: true,
    discountCodeId: row.id,
    percentOff: row.percentOff,
    originalPrice,
    finalPrice,
    finalCents,
  };
}

export async function incrementDiscountUsage(discountCodeId: string) {
  await db
    .update(discountCodes)
    .set({ usedCount: sql`${discountCodes.usedCount} + 1` })
    .where(eq(discountCodes.id, discountCodeId));
}
