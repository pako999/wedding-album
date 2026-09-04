import { SITE_URL } from "@/lib/urls";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { userAttribution } from "@/lib/db/schema";
import {
  SIGNUP_ATTR_COOKIE,
  buildSignupSourceSnapshot,
  parseAttr,
  type SignupSourceSnapshot,
} from "@/lib/attribution/signup";
import { AFFILIATE_COOKIE } from "@/lib/affiliate/attribution";
import { GUEST_REF_COOKIE } from "@/lib/referral/attribution";

/** Our own bare host, so an internal referrer collapses to "direct". */
const APP_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? SITE_URL)
      .hostname.replace(/^www\./, "");
  } catch {
    return "guestcam.si";
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
export async function recordSignupAttribution(
  clerkId: string,
  clerkSource: SignupSourceSnapshot | null = null,
): Promise<SignupSourceSnapshot | null> {
  try {
    const jar = await cookies();
    const attr = parseAttr(jar.get(SIGNUP_ATTR_COOKIE)?.value);
    const affiliateRef = jar.get(AFFILIATE_COOKIE)?.value ?? null;
    const referralCode = jar.get(GUEST_REF_COOKIE)?.value ?? null;

    const cookieSource = buildSignupSourceSnapshot(attr, {
      affiliateRef,
      referralCode,
      appHost: APP_HOST,
      siteHost: APP_HOST,
    });
    // Country-domain sign-ups carry their source through Clerk metadata,
    // because .rs/.es cookies are intentionally inaccessible on .si.
    const source = clerkSource ?? cookieSource;

    await db
      .insert(userAttribution)
      .values({
        clerkId,
        channel: source.channel,
        utmSource: source.utmSource ?? attr?.utmSource ?? null,
        utmMedium: attr?.utmMedium ?? null,
        utmCampaign: source.utmCampaign ?? attr?.utmCampaign ?? null,
        utmTerm: attr?.utmTerm ?? null,
        utmContent: attr?.utmContent ?? null,
        gclid: attr?.gclid ?? null,
        fbclid: attr?.fbclid ?? null,
        affiliateRef: source.affiliateRef ?? affiliateRef,
        referralCode: source.referralCode ?? referralCode,
        referrerUrl: source.referrerHost
          ? `https://${source.referrerHost}`
          : attr?.referrerUrl ?? null,
        landingPage: source.landingPage ?? attr?.landingPage ?? null,
      })
      .onConflictDoNothing();
    return source;
  } catch (err) {
    console.warn("[signup-attribution] record failed:", err);
    return null;
  }
}
