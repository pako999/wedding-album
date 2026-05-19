import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
// Internal endpoints gated by the x-api-key header. NOTE: the Stripe webhook
// (/api/webhooks/stripe) is intentionally NOT here — it authenticates via its
// own `stripe-signature` header, so gating it on x-api-key would block Stripe.
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
