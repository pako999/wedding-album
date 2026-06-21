import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  resolveAffiliate,
  AFFILIATE_COOKIE,
  COOKIE_MAX_AGE,
} from "@/lib/affiliate/attribution";

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

  const h = await headers();
  const affiliate = await resolveAffiliate(code, {
    ipAddress:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      undefined,
    userAgent: h.get("user-agent") ?? undefined,
    referrerUrl: h.get("referer") ?? undefined,
    landingPage: safeTo,
  });

  const res = NextResponse.redirect(redirectUrl);
  if (affiliate) {
    res.cookies.set(AFFILIATE_COOKIE, code, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false, // first-party only; needs to be readable for analytics
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}
