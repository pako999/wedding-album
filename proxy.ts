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
  isSpanishGuestcamSatelliteHost,
  normalizedHostname,
} from "@/lib/site-domains";
import {
  ALBUM_PASSWORD_COOKIE_MAX_AGE,
  albumPasswordCookieName,
  sealAlbumPassword,
  unsealAlbumPassword,
} from "@/lib/album-password-cookie";

const PUBLIC_ROOTS = new Set([
  "", "blog", "contact", "privacy", "terms", "gdpr", "cookies", "refund",
  "admin", "dashboard", "api", "sign-in", "sign-up", "dev", "wall",
  "sl", "hr", "sr", "de", "en", "es",
  "robots.txt", "sitemap.xml", "favicon.ico", "manifest.json",
  "opengraph-image", "_next",
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

function requestHostCandidates(req: NextRequest): string[] {
  const forwarded = (req.headers.get("x-forwarded-host") ?? "")
    .split(",")
    .map((value) => normalizedHostname(value))
    .filter(Boolean);
  const direct = [req.headers.get("host") ?? "", req.nextUrl.hostname]
    .map((value) => normalizedHostname(value))
    .filter(Boolean);
  return [...new Set([...forwarded, ...direct])];
}

function requestHostname(req: NextRequest): string {
  return requestHostCandidates(req)[0] ?? "";
}

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
  async (_auth, req) => {
  const hostCandidates = requestHostCandidates(req);
  const hostname = requestHostname(req);
  const pathname = req.nextUrl.pathname;
  const spanishRequest = hostCandidates.some((host) => isSpanishGuestcamHost(host));
  const effectivePathname = spanishRequest && pathname === "/" ? "/es" : pathname;

  // ── Normalize malformed paths with backslashes ─────────────────────────────
  if (pathname.includes("\\") || pathname.includes("%5C") || pathname.includes("%5c")) {
    const cleanPath = pathname.replace(/(?:\\|%5C|%5c)+/gi, "").replace(/\/+$/, "") || "/";
    const target = req.nextUrl.clone();
    target.pathname = cleanPath;
    return NextResponse.redirect(target, 308);
  }

  // ── Album password URL hygiene ──────────────────────────────────────────────
  // Existing protected-album forms navigate once to /slug?pw=secret. Capture
  // that value, encrypt it into an HttpOnly cookie and immediately redirect to
  // the clean URL. The raw password is never restored into a URL afterwards.
  const albumSlug = isAlbumGuestPath(pathname)
    ? decodeURIComponent(pathname.split("/").filter(Boolean)[0] ?? "")
    : null;

  if (albumSlug) {
    const visiblePassword = req.nextUrl.searchParams.get("pw");
    if (visiblePassword !== null) {
      const sealed = await sealAlbumPassword(albumSlug, visiblePassword);
      // If encryption isn't configured, preserve the old behavior instead of
      // locking users out. Production should always have CLERK_SECRET_KEY or
      // the dedicated ALBUM_ACCESS_SECRET.
      if (sealed) {
        const target = req.nextUrl.clone();
        target.searchParams.delete("pw");
        const response = NextResponse.redirect(target, 303);
        response.cookies.set(albumPasswordCookieName(albumSlug), sealed, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: ALBUM_PASSWORD_COOKIE_MAX_AGE,
        });
        response.headers.set("Referrer-Policy", "no-referrer");
        return response;
      }
    }
  }

  let internalAlbumPassword: string | null = null;
  if (albumSlug) {
    const sealed = req.cookies.get(albumPasswordCookieName(albumSlug))?.value;
    if (sealed) internalAlbumPassword = await unsealAlbumPassword(albumSlug, sealed);
  }

  // ── Custom domain routing ──────────────────────────────────────────────────
  if (!spanishRequest && !isOwnDomain(hostname) && !isInternalApi(req)) {
    const bareHost = normalizedHostname(hostname);

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
    if (!process.env.WEDFLOW_API_KEY || key !== process.env.WEDFLOW_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Dashboard authentication intentionally lives in app/dashboard/layout.tsx.

  // ── Expose trusted request metadata for Server Components ─────────────────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", effectivePathname);

  // Never trust a browser-supplied value for this internal header. Only the
  // password decrypted from Guestcam's HttpOnly cookie may populate it.
  requestHeaders.delete("x-album-access-password");
  if (albumSlug && internalAlbumPassword) {
    requestHeaders.set("x-album-access-password", internalAlbumPassword);
  }

  let res: NextResponse;
  if (spanishRequest && pathname === "/") {
    const target = req.nextUrl.clone();
    target.pathname = "/es";
    res = NextResponse.rewrite(target, { request: { headers: requestHeaders } });
  } else {
    res = NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── First-touch marketing attribution capture ─────────────────────────────
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

  // ── Affiliate ref param capture ────────────────────────────────────────────
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

  // ── Guest referral capture ─────────────────────────────────────────────────
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

  // ── Block crawlers from album guest pages via HTTP header ────────────────
  if (isAlbumGuestPath(pathname)) {
    res.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, noai, noimageai",
    );
    res.headers.set("Referrer-Policy", "no-referrer");
  }

  return res;
  },
  (req) => {
    const hostCandidates = requestHostCandidates(req);
    const satelliteHost = hostCandidates.find((host) => isSpanishGuestcamSatelliteHost(host));
    if (satelliteHost) {
      return {
        isSatellite: true,
        domain: "guestcam.es",
        signInUrl: `${PRIMARY_GUESTCAM_ORIGIN}/sign-in`,
        signUpUrl: `${PRIMARY_GUESTCAM_ORIGIN}/sign-up`,
        satelliteAutoSync: true,
        authorizedParties: [PRIMARY_GUESTCAM_ORIGIN, SPANISH_GUESTCAM_ORIGIN],
      };
    }
    return {
      authorizedParties: [PRIMARY_GUESTCAM_ORIGIN, SPANISH_GUESTCAM_ORIGIN],
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
