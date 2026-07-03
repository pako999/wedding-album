import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

/**
 * Single-segment paths that are PUBLIC marketing/content (not album guest
 * pages). Anything else with a one-segment path of the form /<slug> is
 * treated as an album guest view and gets a full X-Robots-Tag noindex
 * header so crawlers / AI scrapers / archive bots don't ingest it even
 * before the HTML <meta robots> tag is parsed.
 *
 * We include both top-level reserved roots and the locale prefixes; any
 * deeper path (more than one segment) is by definition not a /<slug>
 * album URL because albums live at the root.
 */
const PUBLIC_ROOTS = new Set([
  "", "blog", "contact", "privacy", "terms", "gdpr", "cookies", "refund",
  "admin", "dashboard", "api", "sign-in", "sign-up", "dev",
  "sl", "hr", "sr", "de", "en", "es",
  "robots.txt", "sitemap.xml", "favicon.ico", "manifest.json",
  "opengraph-image", "_next",
]);

function isAlbumGuestPath(pathname: string): boolean {
  // Strip leading slash, ignore anything with more than one segment.
  // Album slugs are flat /<slug>, dashboards are /dashboard/<slug>,
  // localized homepages are /<lang>, etc.
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
  const bare = hostname.split(":")[0];
  return (
    bare === APP_HOSTNAME ||
    bare === `www.${APP_HOSTNAME}` ||
    bare.endsWith(".vercel.app") ||   // all preview URLs
    bare.endsWith(".localhost") ||
    bare === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(bare) // bare IPv4 (LAN dev access) — never a custom domain
  );
}

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") ?? "";
  const pathname = req.nextUrl.pathname;

  // ── Normalize malformed paths with backslashes ─────────────────────────────
  // Scrapers, email clients, and link unfurlers occasionally mangle URLs by
  // appending a trailing backslash (e.g. /hr/contact\ → /hr/contact%5C).
  // Next.js's runtime then tries to require a route module that doesn't
  // exist and logs MODULE_NOT_FOUND. Redirect to the cleaned path so the
  // backlink juice survives and the logs stay clean.
  if (pathname.includes("\\") || pathname.includes("%5C") || pathname.includes("%5c")) {
    const cleanPath = pathname.replace(/(?:\\|%5C|%5c)+/gi, "").replace(/\/+$/, "") || "/";
    const target = req.nextUrl.clone();
    target.pathname = cleanPath;
    return NextResponse.redirect(target, 308);
  }

  // ── Custom domain routing ──────────────────────────────────────────────────
  // Only fire for requests that come from a *custom* domain (premium feature)
  if (!isOwnDomain(hostname) && !isInternalApi(req)) {
    const bareHost = hostname.split(":")[0];

    if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
      const url = req.nextUrl.clone();
      url.pathname = `/api/resolve-domain${pathname}`;
      url.searchParams.set("domain", bareHost);
      return NextResponse.rewrite(url);
    }
  }

  // ── Internal API key check ─────────────────────────────────────────────────
  if (isInternalApi(req)) {
    const key = req.headers.get("x-api-key");
    if (key !== process.env.WEDFLOW_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Dashboard requires Clerk auth ──────────────────────────────────────────
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // ── Expose pathname for Server Components ─────────────────────────────────
  // Server Components read REQUEST headers via next/headers `headers()`.
  // Setting it on the response (as we did initially) doesn't reach them.
  // We have to fork the incoming request headers, inject x-pathname, and
  // pass the new set through via `request.headers`.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // ── Affiliate ref param capture ──────────────────────────────────────────
  // Any link with ?ref=CODE on any non-API page is forwarded to
  // /api/affiliate/track which validates the code against the active
  // affiliates table BEFORE setting the cookie. This avoids two failure
  // modes the cookie-only shortcut had:
  //   • Bogus codes (typos, tampering) would lock the cookie for 30 days
  //     and block the real affiliate's later link from attributing.
  //   • The middleware can't safely talk to Neon on every request.
  // The tracker endpoint redirects back to the original path with the
  // `?ref` stripped, so the user never sees the tracking URL.
  const refParam = req.nextUrl.searchParams.get("ref");
  const tpParam  = req.nextUrl.searchParams.get("tp");
  const onTrackerEndpoint = pathname.startsWith("/api/affiliate/track");
  // Affiliate codes: alnum only, 4-16 chars (e.g. "B0TJYH6J").
  // Guest referral codes have hyphens (e.g. "ANA-MARKO-4Z") — routed
  // differently so we don't ping the affiliate tracker with a code
  // that will never match.
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
    return NextResponse.redirect(trackerUrl);
  }

  // Guest referral capture (P0 of the viral engine). Different from the
  // affiliate flow: guest codes live on albums.referralCode and grant
  // a 15% first-purchase discount when the referred user signs up and
  // pays. First-touch wins — only set cookies if absent.
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
    // Strip ?ref & ?tp from the URL for cleanliness (avoids the code
    // showing up in analytics/pasted links after cookie is set).
    const cleanSearch = new URLSearchParams(req.nextUrl.search);
    cleanSearch.delete("ref");
    cleanSearch.delete("tp");
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.search = cleanSearch.toString() ? `?${cleanSearch.toString()}` : "";
    const redirected = NextResponse.redirect(cleanUrl);
    // Copy the cookies we just set onto the redirect response so the
    // browser stores them even when we're navigating away.
    for (const c of res.cookies.getAll()) redirected.cookies.set(c);
    return redirected;
  }

  // ── Block crawlers from album guest pages via HTTP header ────────────────
  // Album URLs (/<slug>) are private link-only galleries. The page also
  // emits a <meta name="robots" content="noindex,…"> tag, but
  // X-Robots-Tag is honoured by Google/Bing/Yandex BEFORE they parse the
  // HTML — so we double-belt it here. Notable bots in the noai/noimageai
  // set are specifically opted out of training-data crawls per the
  // emerging convention.
  if (isAlbumGuestPath(pathname)) {
    res.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai",
    );
  }

  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
