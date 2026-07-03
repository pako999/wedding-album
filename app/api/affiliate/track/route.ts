import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  resolveAffiliate,
  AFFILIATE_COOKIE,
  DEFAULT_COOKIE_DAYS,
} from "@/lib/affiliate/attribution";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/affiliate/track?ref=CODE&to=/pricing
 *
 * Public click-tracking endpoint. Sets the affiliate cookie and redirects
 * to the requested page. Affiliates share links like:
 *   https://guestcam.si/api/affiliate/track?ref=ABCD1234&to=/
 *
 * Or they can just append ?ref=CODE to any page URL — the middleware
 * captures the param and sets the cookie on the spot. This endpoint is
 * still useful for clean-looking links and for tracking the landing page.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("ref");
  const to = url.searchParams.get("to") ?? "/";

  // Make sure `to` is a same-origin relative path so we can't be used as
  // an open redirector.
  const safeTo = to.startsWith("/") && !to.startsWith("//") ? to : "/";
  const redirectUrl = new URL(safeTo, req.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  // Rate limit prevents a bad actor from inflating an affiliate's click
  // count with a script. 60 clicks per minute per IP is well above real
  // user browsing behaviour. On limit hit we still 302 to the target
  // page — we just skip logging the click. Better UX than a 429 for a
  // real user caught by a shared IP.
  const rl = await checkRateLimit(`track:${code}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.redirect(redirectUrl);
  }

  const h = await headers();
  const affiliate = await resolveAffiliate(code, {
    // Prefer Vercel's stripped-and-verified header so a spoofed
    // x-forwarded-for from the client can't game IP-based analytics.
    ipAddress:
      h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      undefined,
    userAgent: h.get("user-agent") ?? undefined,
    referrerUrl: h.get("referer") ?? undefined,
    landingPage: safeTo,
  });

  const res = NextResponse.redirect(redirectUrl);
  if (affiliate) {
    const days = affiliate.cookieDays || DEFAULT_COOKIE_DAYS;
    res.cookies.set(AFFILIATE_COOKIE, code, {
      maxAge: days * 24 * 60 * 60,
      httpOnly: false, // first-party only; needs to be readable for analytics
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}
