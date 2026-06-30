import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { affiliates, affiliateClicks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const AFFILIATE_COOKIE = "gc_ref";
/** Fallback when an affiliate row has no cookieDays set. Real value comes
 *  from affiliate.cookieDays via resolveAffiliate(), letting us run
 *  special-deal partners on longer attribution windows. */
export const DEFAULT_COOKIE_DAYS = 60;
export const COOKIE_MAX_AGE = DEFAULT_COOKIE_DAYS * 24 * 60 * 60;

export interface ClickMeta {
  ipAddress?: string;
  userAgent?: string;
  referrerUrl?: string;
  landingPage?: string;
}

/**
 * Look up affiliate by code, log a click, and bump the click counter.
 * Returns the affiliate row if active, null otherwise.
 *
 * The click counter uses an atomic SQL UPDATE so concurrent clicks don't
 * race. The click insert is best-effort — we never block redirect on it.
 */
export async function resolveAffiliate(
  code: string,
  meta: ClickMeta,
) {
  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.referralCode, code),
  });
  if (!affiliate || affiliate.status !== "active") return null;

  await db.insert(affiliateClicks).values({
    affiliateId: affiliate.id,
    ipAddress: meta.ipAddress ?? null,
    userAgent: meta.userAgent ?? null,
    referrerUrl: meta.referrerUrl ?? null,
    landingPage: meta.landingPage ?? null,
  }).catch(() => {});

  await db
    .update(affiliates)
    .set({
      totalClicks: sql`${affiliates.totalClicks} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(affiliates.id, affiliate.id))
    .catch(() => {});

  return affiliate;
}

/** Read the affiliate referral code from the request cookies (server-side). */
export async function getAffiliateRefFromCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AFFILIATE_COOKIE)?.value ?? null;
}
