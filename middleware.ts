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
  PRIMARY_GUESTCAM_ORIGIN,
  SPANISH_GUESTCAM_ORIGIN,
  isSpanishGuestcamHost,
  normalizedHostname,
} from "@/lib/site-domains";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

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
  const bare = normalizedHostname(hostname);
  return (
    bare === APP_HOSTNAME ||
    bare === `www.${APP_HOSTNAME}` ||
    isSpanishGuestcamHost(bare) ||
    bare.endsWith(".vercel.app") ||
    bare.endsWith(".localhost") ||
    bare === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(bare)
  );
}

export default clerkMiddleware(
  async (auth, req) => {
    const hostname = req.headers.get("host") ?? "";
    const pathname = req.nextUrl.pathname;
    const spanishRequest = isSpanishGuestcamHost(hostname);
    const effectivePathname = spanishRequest && pathname === "/" ? "/es" : pathname;

    // Normalize malformed paths with backslashes.
    if (pathname.includes("\\") || pathname.includes("%5C") || pathname.includes("%5c")) {
      const cleanPath = pathname.replace(/(?:\\|%5C|%5c)+/gi, "").replace(/\/+$/, "") || "/";
      const target = req.nextUrl.clone();
      target.pathname = cleanPath;
      return NextResponse.redirect(target, 308);
    }

    // Premium custom album domains. Official Guestcam domains, including
    // guestcam.es, never enter this resolver.
    if (!isOwnDomain(hostname) && !isInternalApi(req)) {
      const bareHost = normalizedHostname(hostname);
      if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
        const url = req.nextUrl.clone();
        url.pathname = `/api/resolve-domain${pathname}`;
        url.searchParams.set("domain", bareHost);
        return NextResponse.rewrite(url);
      }
    }

    if (isInternalApi(req)) {
      const key = req.headers.get("x-api-key");
      if (key !== process.env.WEDFLOW_API_KEY) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    }

    if (isProtectedRoute(req)) {
      await auth.protect();
    }

    // Make the internally-rewritten Spanish root look like /es to Server
    // Components so locale detection, Clerk localization and page copy are ES.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", effectivePathname);

    let res: NextResponse;
    if (spanishRequest && pathname === "/") {
      const target = req.nextUrl.clone();
      target.pathname = "/es";
      res = NextResponse.rewrite(target, { request: { headers: requestHeaders } });
    } else {
      res = NextResponse.next({ request: { headers: requestHeaders } });
    }

    // First-touch marketing attribution capture.
    if (!pathname.startsWith("/api/") && !req.cookies.get(SIGNUP_ATTR_COOKIE)) {
      const attr = collectAttribution(
        req.nextUrl.searchParams,
        req.headers.get("referer"),
        effectivePathname,
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

    // Affiliate referral capture.
    const refParam = req.nextUrl.searchParams.get("ref");
    const tpParam = req.nextUrl.searchParams.get("tp");
    const onTrackerEndpoint = pathname.startsWith("/api/affiliate/track");
    const isAffiliatePattern = refParam && /^[A-Z0-9]{4,16}$/.test(refParam);
    const isGuestPattern = refParam && /^[A-Z0-9]+(?:-[A-Z0-9]+){1,3}$/.test(refParam);

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

    // Guest referral capture.
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
          maxAge: 90 * 24 * 60 * 60,
          path: "/",
          httpOnly: false,
          secure,
          sameSite: "lax",
        });
        if (tpParam && /^[a-z_]{4,30}$/.test(tpParam)) {
          res.cookies.set("gc_gtp", tpParam, {
            maxAge: 90 * 24 * 60 * 60,
            path: "/",
            httpOnly: false,
            secure,
            sameSite: "lax",
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

    if (isAlbumGuestPath(pathname)) {
      res.headers.set(
        "X-Robots-Tag",
        "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai",
      );
    }

    return res;
  },
  (req) => {
    const hostname = normalizedHostname(req.headers.get("host") ?? req.nextUrl.hostname);
    if (isSpanishGuestcamHost(hostname)) {
      return {
        isSatellite: true,
        domain: hostname,
        signInUrl: `${PRIMARY_GUESTCAM_ORIGIN}/sign-in`,
        signUpUrl: `${PRIMARY_GUESTCAM_ORIGIN}/sign-up`,
        satelliteAutoSync: true,
        authorizedParties: [PRIMARY_GUESTCAM_ORIGIN, SPANISH_GUESTCAM_ORIGIN, "https://guestcam.es"],
      };
    }

    return {
      authorizedParties: [PRIMARY_GUESTCAM_ORIGIN, SPANISH_GUESTCAM_ORIGIN, "https://guestcam.es"],
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
