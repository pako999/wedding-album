import { NextResponse } from "next/server";
import { registrationWelcomeEmailHtml } from "@/lib/email/registration-welcome";

export async function GET() {
  const html = registrationWelcomeEmailHtml({ firstName: "Ana" });
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
