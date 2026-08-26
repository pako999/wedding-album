import { NextResponse } from "next/server";
import { welcomeEmailHtml } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";

/** Local-only email template preview. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const html = welcomeEmailHtml({
    ownerName: "Ana",
    coupleName: "Ana & Marko",
    weddingDate: "2026-06-14",
    albumSlug: "ana-marko-13ka",
  });
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Cache-Control": "no-store",
    },
  });
}
