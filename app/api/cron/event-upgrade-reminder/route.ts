import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { sendEventUpgradeReminderEmail } from "@/lib/email/event-upgrade-reminder";
import {
  claimEventUpgradeReminder,
  markEventUpgradeReminderSent,
  releaseEventUpgradeReminder,
} from "@/lib/event-upgrade-reminder-log";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEND_CAP = 50;

function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function daysUntil(eventDate: string): number {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const event = new Date(`${eventDate}T00:00:00Z`);
  return Math.round((event.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Daily conversion/service reminder for owners whose event is 1–7 days away
 * while the gallery is still on Free. One email maximum per album.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = isoDay(1);
  const inSevenDays = isoDay(7);

  const due = await db
    .select({
      id: albums.id,
      slug: albums.slug,
      ownerClerkId: albums.ownerClerkId,
      ownerEmail: albums.ownerEmail,
      coupleName: albums.coupleName,
      weddingDate: albums.weddingDate,
      defaultLang: albums.defaultLang,
    })
    .from(albums)
    .where(
      and(
        eq(albums.plan, "free"),
        eq(albums.isPublished, true),
        sql`${albums.weddingDate} >= ${tomorrow}`,
        sql`${albums.weddingDate} <= ${inSevenDays}`,
        or(isNull(albums.expiresAt), gt(albums.expiresAt, now)),
      ),
    )
    .limit(SEND_CAP);

  let sent = 0;
  let skipped = 0;
  let errors = 0;
  const clerk = await clerkClient();

  for (const album of due) {
    const remaining = daysUntil(album.weddingDate);
    if (remaining < 1 || remaining > 7) {
      skipped++;
      continue;
    }

    let email = album.ownerEmail?.trim() || null;
    if (!email) {
      try {
        const user = await clerk.users.getUser(album.ownerClerkId);
        email = user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress
          ?? user.emailAddresses?.[0]?.emailAddress
          ?? null;
      } catch (err) {
        console.warn(`[event-upgrade-reminder] Clerk lookup failed for ${album.ownerClerkId}:`, err);
      }
    }

    if (!email) {
      skipped++;
      continue;
    }

    let claimed = false;
    try {
      claimed = await claimEventUpgradeReminder(album.id, email);
      if (!claimed) {
        skipped++;
        continue;
      }

      await sendEventUpgradeReminderEmail({
        to: email,
        coupleName: album.coupleName,
        eventDate: album.weddingDate,
        albumSlug: album.slug,
        daysUntil: remaining,
        locale: album.defaultLang,
      });
      await markEventUpgradeReminderSent(album.id);
      sent++;
    } catch (err) {
      console.error(`[event-upgrade-reminder] failed for ${album.slug}:`, err);
      if (claimed) {
        await releaseEventUpgradeReminder(album.id).catch(() => {});
      }
      errors++;
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    errors,
    examined: due.length,
    window: { from: tomorrow, to: inSevenDays },
  });
}
