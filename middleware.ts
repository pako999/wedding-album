import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require the owner to be signed in
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// API routes protected by internal API key (WedFlow→Album integration)
const isInternalApi = createRouteMatcher([
  "/api/integrations(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Internal API: validate WEDFLOW_API_KEY header
  if (isInternalApi(req)) {
    const key = req.headers.get("x-api-key");
    if (key !== process.env.WEDFLOW_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Dashboard: require Clerk auth
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
