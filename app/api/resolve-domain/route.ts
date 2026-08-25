import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isSpanishGuestcamHost, normalizedHostname } from "@/lib/site-domains";

// This route is called by proxy when a request comes in from a custom domain.
// It looks up which album slug maps to that domain and rewrites to /[slug].

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawDomain = searchParams.get("domain");

  if (!rawDomain) {
    return NextResponse.json({ error: "No domain" }, { status: 400 });
  }

  const domain = normalizedHostname(rawDomain);

  // guestcam.es is an official Guestcam locale domain, never a customer album
  // custom domain. Keep this guard here as a final safety net even if an
  // upstream proxy/header mismatch accidentally sends it through this resolver.
  if (isSpanishGuestcamHost(domain)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("domain");
    url.pathname = "/es";
    return NextResponse.rewrite(url);
  }

  const album = await db.query.albums.findFirst({
    where: eq(albums.customDomain, domain),
  });

  if (!album) {
    return new NextResponse("Album not found for this domain.", {
      status: 404,
      headers: {
        "x-debug-domain": domain,
        "x-debug-host": req.headers.get("host") ?? "",
        "x-debug-forwarded-host": req.headers.get("x-forwarded-host") ?? "",
        "x-debug-url-host": req.nextUrl.hostname,
      },
    });
  }

  // Rewrite internally to the slug page, keeping query params
  const url = req.nextUrl.clone();
  // Remove our internal params
  url.searchParams.delete("domain");
  // Set the path to /{slug}
  url.pathname = `/${album.slug}`;

  return NextResponse.rewrite(url);
}
