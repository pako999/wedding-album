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
  // Any link with ?ref=CODE on any page sets the affiliate cookie. The
  // cookie expires after 30 days. We only set it if the visitor doesn't
  // already have one (first-touch attribution — first affiliate wins).
  // The actual click counter increment + click row insert happens when
  // they hit /api/affiliate/track explicitly; this is just the fallback
  // so a directly-shared ?ref= URL still attributes properly.
  const refParam = req.nextUrl.searchParams.get("ref");
  if (refParam && /^[A-Z0-9]{4,16}$/.test(refParam) && !req.cookies.get("gc_ref")) {
    res.cookies.set("gc_ref", refParam, {
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
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
