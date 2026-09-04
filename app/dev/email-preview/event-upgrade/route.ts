import { NextResponse } from "next/server";
import { eventUpgradeReminderEmailHtml } from "@/lib/email/event-upgrade-reminder";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const html = eventUpgradeReminderEmailHtml({
    coupleName: "Špela & Andrej",
    eventDate: "2026-08-31",
    albumSlug: "spela-andrej-demo",
    daysUntil: 10,
    locale: "sl",
    discountCode: "GC30-POROKA26",
    discountPercent: 30,
    discountExpiresAt: new Date("2026-09-30T00:00:00Z"),
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Cache-Control": "no-store",
    },
  });
}
