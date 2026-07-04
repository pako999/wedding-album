/**
 * GET /api/cron/guest-email-d21
 *
 * Vercel Cron — runs daily at 09:10 UTC.
 * Finds guest_emails rows captured >= 21 days ago that:
 *   • have marketing_consent = true (this is a marketing email, GDPR),
 *   • have not received the D21 email yet,
 *   • are not unsubscribed,
 *   • belong to an album that carries a referral_code (needed for the 15%
 *     auto-attribution flow).
 *
 * The referral_code links back to the source album — so when the guest
 * clicks through, the middleware sets gc_gref/gc_gtp cookies (P0 flow) and
 * their eventual paid checkout gets 15% off automatically, AND the couple
 * whose event they attended earns the K-factor credit.
 *
 * Protected with CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestEmails, albums } from "@/lib/db/schema";
import { and, eq, isNull, isNotNull, lt } from "drizzle-orm";
import { sendGuestEmailD21 } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEND_CAP = 100;
const DELAY_DAYS = 21;
const DISCOUNT_PCT = 15;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  if (authHeader !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cutoff = new Date(Date.now() - DELAY_DAYS * 24 * 60 * 60 * 1000);

  const due = await db
    .select({
      id: guestEmails.id,
      email: guestEmails.email,
      locale: guestEmails.locale,
      unsubscribeToken: guestEmails.unsubscribeToken,
      coupleName: albums.coupleName,
      referralCode: albums.referralCode,
    })
    .from(guestEmails)
    .innerJoin(albums, eq(albums.id, guestEmails.albumId))
    .where(
      and(
        eq(guestEmails.marketingConsent, true),
        isNull(guestEmails.d21SentAt),
        isNull(guestEmails.unsubscribedAt),
        isNotNull(albums.referralCode),
        lt(guestEmails.createdAt, cutoff),
      ),
    )
    .limit(SEND_CAP);

  let sent = 0, skipped = 0, errors = 0;

  for (const row of due) {
    if (!row.email || !row.unsubscribeToken || !row.referralCode) { skipped++; continue; }

    try {
      await sendGuestEmailD21({
        to: row.email,
        discountCode: row.referralCode,
        discountPct: DISCOUNT_PCT,
        fromCoupleName: row.coupleName,
        unsubscribeToken: row.unsubscribeToken,
        locale: row.locale,
      });
      await db
        .update(guestEmails)
        .set({ d21SentAt: new Date() })
        .where(eq(guestEmails.id, row.id));
      sent++;
    } catch (err) {
      console.error(`[cron:guest-email-d21] send failed for ${row.email}:`, err);
      errors++;
    }
  }

  return NextResponse.json({ sent, skipped, errors, examined: due.length });
}
