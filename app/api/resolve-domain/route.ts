import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// This route is called by middleware when a request comes in from a custom domain.
// It looks up which album slug maps to that domain and rewrites to /[slug].

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "No domain" }, { status: 400 });
  }

  const album = await db.query.albums.findFirst({
    where: eq(albums.customDomain, domain),
  });

  if (!album) {
    return new NextResponse("Album not found for this domain.", { status: 404 });
  }

  // Rewrite internally to the slug page, keeping query params
  const url = req.nextUrl.clone();
  // Remove our internal params
  url.searchParams.delete("domain");
  // Set the path to /{slug}
  url.pathname = `/${album.slug}`;

  return NextResponse.rewrite(url);
}
