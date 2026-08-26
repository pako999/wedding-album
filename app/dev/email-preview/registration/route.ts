import { NextResponse } from "next/server";
import { registrationWelcomeEmailHtml } from "@/lib/email/registration-welcome";

export const dynamic = "force-dynamic";

export async function GET() {
  // Email preview endpoints are developer tooling, not production content.
  // Vercel Preview also runs with NODE_ENV=production, which is intentional:
  // deployed URLs should never expose internal template previews publicly.
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const html = registrationWelcomeEmailHtml({ firstName: "Ana" });
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Cache-Control": "no-store",
    },
  });
}
