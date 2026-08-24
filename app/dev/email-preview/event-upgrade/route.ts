import { NextResponse } from "next/server";
import { eventUpgradeReminderEmailHtml } from "@/lib/email/event-upgrade-reminder";

export async function GET() {
  const html = eventUpgradeReminderEmailHtml({
    coupleName: "Špela & Andrej",
    eventDate: "2026-08-31",
    albumSlug: "spela-andrej-demo",
    daysUntil: 7,
    locale: "sl",
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
