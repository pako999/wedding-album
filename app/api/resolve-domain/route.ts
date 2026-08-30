import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  isSerbianGuestcamHost,
  isSpanishGuestcamHost,
  normalizedHostname,
} from "@/lib/site-domains";

export const dynamic = "force-dynamic";

function requestHostname(req: NextRequest): string {
  // `host` is the actual request authority and remains the customer custom
  // domain across the internal middleware rewrite. Do not trust a caller-
  // supplied query parameter to select an unrelated customer's domain.
  return normalizedHostname(req.headers.get("host") ?? req.nextUrl.hostname);
}

function validHostname(value: string): boolean {
  if (!value || value.length > 253) return false;
  if (/[^a-z0-9.-]/i.test(value)) return false;
  if (value.startsWith(".") || value.endsWith(".") || value.includes("..")) return false;
  return value.split(".").every((label) =>
    label.length >= 1 && label.length <= 63 &&
    !label.startsWith("-") && !label.endsWith("-"),
  );
}

// Called internally by proxy.ts for customer custom-domain requests.
export async function GET(req: NextRequest) {
  const rawDomain = req.nextUrl.searchParams.get("domain") ?? "";
  const domain = normalizedHostname(rawDomain);
  const actualHost = requestHostname(req);

  if (!validHostname(domain)) {
    return NextResponse.json(
      { error: "Invalid domain" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Prevent /api/resolve-domain?domain=customer.example being used from a
  // Guestcam/Vercel host as a public domain-enumeration/rewrite primitive.
  // The legitimate middleware rewrite arrives on the custom domain itself.
  if (actualHost !== domain) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  // guestcam.es is an official Guestcam locale domain, never a customer album
  // custom domain. Keep this as a final safety net if proxy routing changes.
  if (isSpanishGuestcamHost(domain)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("domain");
    url.pathname = "/es";
    return NextResponse.rewrite(url, { headers: { "Cache-Control": "no-store" } });
  }

  // Final safety net: guestcam.rs is an official Serbian marketing host and
  // must never fall through to the customer custom-domain lookup.
  if (isSerbianGuestcamHost(domain)) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("domain");
    url.pathname = "/sr";
    return NextResponse.rewrite(url, { headers: { "Cache-Control": "no-store" } });
  }

  const album = await db.query.albums.findFirst({
    columns: { slug: true },
    where: eq(albums.customDomain, domain),
  });

  if (!album) {
    // Never expose infrastructure/debug request headers in a public response.
    return new NextResponse("Album not found for this domain.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const url = req.nextUrl.clone();
  url.searchParams.delete("domain");
  url.pathname = `/${album.slug}`;
  return NextResponse.rewrite(url, { headers: { "Cache-Control": "no-store" } });
}
