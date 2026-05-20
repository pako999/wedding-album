import { NextResponse } from "next/server";
import { welcomeEmailHtml } from "@/lib/email/notifications";

/**
 * Renders the welcome email so you can preview the design in a browser
 * without going through Resend. Visit /dev/email-preview/welcome locally
 * (or on the deployed site, once the noindex flag stays on).
 */
export async function GET() {
  const html = welcomeEmailHtml({
    ownerName: "Ana",
    coupleName: "Ana & Marko",
    weddingDate: "2026-06-14",
    albumSlug: "ana-marko-13ka",
  });
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
