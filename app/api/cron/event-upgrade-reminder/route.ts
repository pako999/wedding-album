import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums, discountCodes } from "@/lib/db/schema";
import { sendEventUpgradeReminderEmail } from "@/lib/email/event-upgrade-reminder";
import {
  claimEventUpgradeReminder,
  markEventUpgradeReminderSent,
  releaseEventUpgradeReminder,
} from "@/lib/event-upgrade-reminder-log";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEND_CAP = 50;
const DAYS_BEFORE_EVENT = 14;
const DISCOUNT_PERCENT = 30;
const DISCOUNT_VALID_HOURS = 24;

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
 * Daily conversion reminder for owners whose event is exactly 14 days away
 * while the gallery is still on Free. The offer does not depend on whether
 * the owner has published the gallery yet. Each customer receives one unique,
 * single-use 30% code that expires 24 hours after it is issued.
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
  const targetDay = isoDay(DAYS_BEFORE_EVENT);

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
        eq(albums.weddingDate, targetDay),
      ),
    )
    .limit(SEND_CAP);

  let sent = 0;
  let skipped = 0;
  let errors = 0;
  const clerk = await clerkClient();
  const processedOwners = new Set<string>();

  for (const album of due) {
    const remaining = daysUntil(album.weddingDate);
    if (remaining !== DAYS_BEFORE_EVENT || processedOwners.has(album.ownerClerkId)) {
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
    processedOwners.add(album.ownerClerkId);

    let claimed = false;
    let discountCodeId: string | null = null;
    try {
      claimed = await claimEventUpgradeReminder(album.id, email);
      if (!claimed) {
        skipped++;
        continue;
      }

      const expiresAt = new Date(now.getTime() + DISCOUNT_VALID_HOURS * 3_600_000);
      let discountCode: string | null = null;
      for (let attempt = 0; attempt < 5 && !discountCode; attempt++) {
        const candidate = `GC30-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
        const [created] = await db
          .insert(discountCodes)
          .values({
            code: candidate,
            percentOff: DISCOUNT_PERCENT,
            maxUses: 1,
            expiresAt,
          })
          .onConflictDoNothing({ target: discountCodes.code })
          .returning({ id: discountCodes.id, code: discountCodes.code });
        if (created) {
          discountCodeId = created.id;
          discountCode = created.code;
        }
      }
      if (!discountCode) throw new Error("Could not allocate a unique discount code");

      await sendEventUpgradeReminderEmail({
        to: email,
        coupleName: album.coupleName,
        eventDate: album.weddingDate,
        albumSlug: album.slug,
        daysUntil: remaining,
        locale: album.defaultLang,
        discountCode,
        discountPercent: DISCOUNT_PERCENT,
        discountExpiresAt: expiresAt,
      });
      await markEventUpgradeReminderSent(album.id);
      sent++;
    } catch (err) {
      console.error(`[event-upgrade-reminder] failed for ${album.slug}:`, err);
      if (claimed) {
        await releaseEventUpgradeReminder(album.id).catch(() => {});
      }
      if (discountCodeId) {
        await db.delete(discountCodes).where(eq(discountCodes.id, discountCodeId)).catch(() => {});
      }
      errors++;
    }
  }

  return NextResponse.json({
    sent,
    skipped,
    errors,
    examined: due.length,
    targetDay,
    offer: {
      percentOff: DISCOUNT_PERCENT,
      maxUses: 1,
      validHours: DISCOUNT_VALID_HOURS,
    },
  });
}
