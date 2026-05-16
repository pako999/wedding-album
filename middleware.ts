import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isInternalApi = createRouteMatcher([
  "/api/integrations(.*)",
  "/api/webhooks(.*)",
]);

const APP_HOSTNAME = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : "photos.wedflow.app";

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") ?? "";
  const pathname = req.nextUrl.pathname;

  // ── Custom domain routing ──────────────────────────────────────────────────
  // If the request comes from a domain that is NOT our main app domain
  // (e.g. "foto.ana-marko.si"), look it up and proxy to /[slug] internally.
  if (
    hostname !== APP_HOSTNAME &&
    hostname !== `www.${APP_HOSTNAME}` &&
    !hostname.startsWith("localhost") &&
    !isInternalApi(req)
  ) {
    // Strip port for comparison (dev)
    const bareHost = hostname.split(":")[0];

    // Only rewrite root paths — skip assets, API
    if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
      // We can't query the DB here in middleware; instead we use a special
      // internal resolve route that maps domain → slug and rewrites.
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
