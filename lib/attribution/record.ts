import { SITE_URL } from "@/lib/urls";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { userAttribution } from "@/lib/db/schema";
import {
  SIGNUP_ATTR_COOKIE,
  parseAttr,
  deriveChannel,
} from "@/lib/attribution/signup";
import { AFFILIATE_COOKIE } from "@/lib/affiliate/attribution";
import { GUEST_REF_COOKIE } from "@/lib/referral/attribution";

/** Our own bare host, so an internal referrer collapses to "direct". */
const APP_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL)
      .hostname.replace(/^www\./, "");
  } catch {
    return "camlove.me";
  }
})();

/**
 * Stamp the signed-in user's acquisition source, ONCE, from the cookies
 * their browser is carrying. First-touch wins: the insert is
 * onConflictDoNothing, so repeat dashboard visits never overwrite the
 * original attribution.
 *
 * Call this only for genuinely new signups (the caller gates on Clerk
 * account freshness) — otherwise an existing user's later visit would get
 * stamped "direct" from cookies they happen to carry now, which is wrong.
 *
 * Always best-effort: a failure here must never break the dashboard.
 */
export async function recordSignupAttribution(clerkId: string): Promise<void> {
  try {
    const jar = await cookies();
    const attr = parseAttr(jar.get(SIGNUP_ATTR_COOKIE)?.value);
    const affiliateRef = jar.get(AFFILIATE_COOKIE)?.value ?? null;
    const referralCode = jar.get(GUEST_REF_COOKIE)?.value ?? null;

    const channel = deriveChannel(attr, {
      affiliateRef,
      referralCode,
      appHost: APP_HOST,
    });

    await db
      .insert(userAttribution)
      .values({
        clerkId,
        channel,
        utmSource: attr?.utmSource ?? null,
        utmMedium: attr?.utmMedium ?? null,
        utmCampaign: attr?.utmCampaign ?? null,
        utmTerm: attr?.utmTerm ?? null,
        utmContent: attr?.utmContent ?? null,
        gclid: attr?.gclid ?? null,
        fbclid: attr?.fbclid ?? null,
        affiliateRef,
        referralCode,
        referrerUrl: attr?.referrerUrl ?? null,
        landingPage: attr?.landingPage ?? null,
      })
      .onConflictDoNothing();
  } catch (err) {
    console.warn("[signup-attribution] record failed:", err);
  }
}
