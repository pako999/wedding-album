import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SIGNUP_ATTR_COOKIE,
  ATTR_COOKIE_MAX_AGE,
  collectAttribution,
  serializeAttr,
} from "@/lib/attribution/signup";
import {
  PRIMARY_ORIGIN,
  SPANISH_HOST,
  SPANISH_ORIGIN,
  hostnameOnly,
} from "@/lib/domains";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

/**
 * Single-segment paths that are PUBLIC marketing/content (not album guest
 * pages). Anything else with a one-segment path of the form /<slug> is
 * treated as an album guest view and gets a full X-Robots-Tag noindex
 * header so crawlers / AI scrapers / archive bots don't ingest it even
 * before the HTML <meta robots> tag is parsed.
 */
const PUBLIC_ROOTS = new Set([
  "", "blog", "contact", "privacy", "terms", "gdpr", "cookies", "refund",
  "admin", "dashboard", "api", "sign-in", "sign-up", "dev", "wall",
  "sl", "hr", "sr", "de", "en", "es",
  "robots.txt", "sitemap.xml", "favicon.ico", "manifest.json",
  "opengraph-image", "_next", "__clerk",
]);

function isAlbumGuestPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  return !PUBLIC_ROOTS.has(segments[0]);
}

// Internal endpoints gated by the x-api-key header. NOTE: the Paddle webhook
// (/api/webhooks/paddle) is intentionally NOT here — it authenticates via its
// own `Paddle-Signature` HMAC header, so gating it on x-api-key would block Paddle.
const isInternalApi = createRouteMatcher([
  "/api/integrations(.*)",
  "/api/webhooks/wedflow(.*)",
]);

function parseHostname(url: string | undefined): string {
  if (!url) return "guestcam.si";
  try {
    const raw = url.startsWith("http") ? url : `https://${url}`;
    return new URL(raw).hostname;
  } catch {
    return "guestcam.si";
  }
}

const APP_HOSTNAME = parseHostname(process.env.NEXT_PUBLIC_APP_URL);

function isOwnDomain(hostname: string) {
  const bare = hostnameOnly(hostname);
  return (
    bare === APP_HOSTNAME ||
    bare === `www.${APP_HOSTNAME}` ||
    bare === SPANISH_HOST ||
    bare.endsWith(".vercel.app") ||
    bare.endsWith(".localhost") ||
    bare === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(bare)
  );
}

export default clerkMiddleware(
  async (auth, req) => {
    const hostname = req.headers.get("host") ?? "";
    const bareHost = hostnameOnly(hostname);
    const pathname = req.nextUrl.pathname;
    const isSpanishDomain = bareHost === SPANISH_HOST;

    // Keep exactly one canonical host for the Spanish satellite. Clerk's
    // satellite domain is configured as guestcam.es (without www), so we
    // redirect a possible www alias before Clerk or SEO can see a duplicate.
    if (bareHost === `www.${SPANISH_HOST}`) {
      const target = req.nextUrl.clone();
      target.protocol = "https:";
      target.host = SPANISH_HOST;
      return NextResponse.redirect(target, 308);
    }

    // ── Normalize malformed paths with backslashes ───────────────────────────
    if (pathname.includes("\\") || pathname.includes("%5C") || pathname.includes("%5c")) {
      const cleanPath = pathname.replace(/(?:\\|%5C|%5c)+/gi, "").replace(/\/+$/, "") || "/";
      const target = req.nextUrl.clone();
      target.pathname = cleanPath;
      return NextResponse.redirect(target, 308);
    }

    // On guestcam.es the clean public homepage is `/`. Internally we render
    // the existing Spanish `/es` page so the browser stays on guestcam.es/
    // while all copy, Clerk localization and page content are Spanish.
    // `/es` itself redirects to `/` on the .es host to avoid duplicate URLs.
    if (isSpanishDomain && pathname === "/es") {
      const target = req.nextUrl.clone();
      target.pathname = "/";
      return NextResponse.redirect(target, 308);
    }

    const spanishHomepageRewrite = isSpanishDomain && pathname === "/";
    const effectivePathname = spanishHomepageRewrite ? "/es" : pathname;

    // ── Custom domain routing ────────────────────────────────────────────────
    // guestcam.es is an official Guestcam satellite, not an album custom
    // domain. Other unknown domains still resolve to premium album domains.
    if (!isOwnDomain(hostname) && !isInternalApi(req)) {
      if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
        const url = req.nextUrl.clone();
        url.pathname = `/api/resolve-domain${pathname}`;
        url.searchParams.set("domain", bareHost);
        return NextResponse.rewrite(url);
      }
    }

    // ── Internal API key check ───────────────────────────────────────────────
    if (isInternalApi(req)) {
      const key = req.headers.get("x-api-key");
      if (key !== process.env.WEDFLOW_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    }

    // ── Dashboard requires Clerk auth ────────────────────────────────────────
    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    // ── Expose pathname + locale for Server Components ──────────────────────
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", effectivePathname);

    // guestcam.es is Spanish even though the visible root has no /es prefix.
    // The lang query is also used on the primary Clerk sign-in/sign-up routes
    // when a user starts auth from the satellite domain.
    const requestedLang = req.nextUrl.searchParams.get("lang");
    if (isSpanishDomain || requestedLang === "es") {
      requestHeaders.set("x-site-locale", "es");
    }

    let res: NextResponse;
    if (spanishHomepageRewrite) {
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = "/es";
      res = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
    } else {
      res = NextResponse.next({ request: { headers: requestHeaders } });
    }

    // ── First-touch marketing attribution capture ──────────────────────────
    if (!pathname.startsWith("/api/") && !req.cookies.get(SIGNUP_ATTR_COOKIE)) {
      const attr = collectAttribution(
        req.nextUrl.searchParams,
        req.headers.get("referer"),
        pathname,
      );
      if (attr) {
        res.cookies.set(SIGNUP_ATTR_COOKIE, serializeAttr(attr), {
          maxAge: ATTR_COOKIE_MAX_AGE,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
    }

    // ── Affiliate ref param capture ────────────────────────────────────────
    const refParam = req.nextUrl.searchParams.get("ref");
    const tpParam  = req.nextUrl.searchParams.get("tp");
    const onTrackerEndpoint = pathname.startsWith("/api/affiliate/track");
    const isAffiliatePattern = refParam && /^[A-Z0-9]{4,16}$/.test(refParam);
    const isGuestPattern     = refParam && /^[A-Z0-9]+(?:-[A-Z0-9]+){1,3}$/.test(refParam);

    if (
      refParam &&
      isAffiliatePattern &&
      !pathname.startsWith("/api/") &&
      !onTrackerEndpoint
    ) {
      const cleanSearch = new URLSearchParams(req.nextUrl.search);
      cleanSearch.delete("ref");
      const to = pathname + (cleanSearch.toString() ? `?${cleanSearch.toString()}` : "");
      const trackerUrl = req.nextUrl.clone();
      trackerUrl.pathname = "/api/affiliate/track";
      trackerUrl.search = "";
      trackerUrl.searchParams.set("ref", refParam);
      trackerUrl.searchParams.set("to", to);
      const redirected = NextResponse.redirect(trackerUrl);
      for (const c of res.cookies.getAll()) redirected.cookies.set(c);
      return redirected;
    }

    // Guest referral capture (P0 of the viral engine).
    if (
      refParam &&
      isGuestPattern &&
      !pathname.startsWith("/api/") &&
      !onTrackerEndpoint
    ) {
      const existing = req.cookies.get("gc_gref")?.value;
      if (!existing) {
        const secure = process.env.NODE_ENV === "production";
        res.cookies.set("gc_gref", refParam, {
          maxAge: 90 * 24 * 60 * 60, path: "/", httpOnly: false, secure, sameSite: "lax",
        });
        if (tpParam && /^[a-z_]{4,30}$/.test(tpParam)) {
          res.cookies.set("gc_gtp", tpParam, {
            maxAge: 90 * 24 * 60 * 60, path: "/", httpOnly: false, secure, sameSite: "lax",
          });
        }
      }
      const cleanSearch = new URLSearchParams(req.nextUrl.search);
      cleanSearch.delete("ref");
      cleanSearch.delete("tp");
      const cleanUrl = req.nextUrl.clone();
      cleanUrl.search = cleanSearch.toString() ? `?${cleanSearch.toString()}` : "";
      const redirected = NextResponse.redirect(cleanUrl);
      for (const c of res.cookies.getAll()) redirected.cookies.set(c);
      return redirected;
    }

    // ── Block crawlers from album guest pages via HTTP header ──────────────
    if (isAlbumGuestPath(pathname)) {
      res.headers.set(
        "X-Robots-Tag",
        "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai",
      );
    }

    return res;
  },
  (req) => {
    const host = hostnameOnly(req.headers.get("host"));
    const satellite = host === SPANISH_HOST;

    return {
      isSatellite: satellite,
      ...(satellite ? { domain: SPANISH_HOST } : {}),
      // Auth UI lives on the primary domain, as required by Clerk satellite
      // domains. `?lang=es` keeps the Clerk form localized in Spanish.
      signInUrl: satellite
        ? `${PRIMARY_ORIGIN}/sign-in?lang=es`
        : `${PRIMARY_ORIGIN}/sign-in`,
      signUpUrl: satellite
        ? `${PRIMARY_ORIGIN}/sign-up?lang=es`
        : `${PRIMARY_ORIGIN}/sign-up`,
      authorizedParties: [PRIMARY_ORIGIN, SPANISH_ORIGIN],
    };
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
