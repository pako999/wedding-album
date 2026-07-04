/**
 * GET /api/cron/guest-email-d3
 *
 * Vercel Cron — runs daily at 09:00 UTC.
 * Finds guest_emails rows captured >= 3 days ago that haven't received the
 * D3 nudge yet, aren't unsubscribed, and whose parent album still exists
 * with at least 1 photo. Sends a transactional "the gallery has N photos"
 * email — no marketing consent required, this is a continuation of the
 * "email me the album link" flow they explicitly opted into.
 *
 * Protected with CRON_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guestEmails, albums } from "@/lib/db/schema";
import { and, eq, isNull, lt } from "drizzle-orm";
import { sendGuestEmailD3 } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

const SEND_CAP = 100;    // per run, so a big backlog doesn't burst
const DELAY_DAYS = 3;

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
      albumSlug: albums.slug,
      coupleName: albums.coupleName,
      photoCount: albums.photoCount,
    })
    .from(guestEmails)
    .innerJoin(albums, eq(albums.id, guestEmails.albumId))
    .where(
      and(
        isNull(guestEmails.d3SentAt),
        isNull(guestEmails.unsubscribedAt),
        lt(guestEmails.createdAt, cutoff),
      ),
    )
    .limit(SEND_CAP);

  let sent = 0, skipped = 0, errors = 0;

  for (const row of due) {
    if (!row.email || !row.unsubscribeToken) { skipped++; continue; }
    if ((row.photoCount ?? 0) === 0)         { skipped++; continue; }

    try {
      await sendGuestEmailD3({
        to: row.email,
        albumSlug: row.albumSlug,
        coupleName: row.coupleName,
        photoCount: row.photoCount ?? 0,
        unsubscribeToken: row.unsubscribeToken,
        locale: row.locale,
      });
      await db
        .update(guestEmails)
        .set({ d3SentAt: new Date() })
        .where(eq(guestEmails.id, row.id));
      sent++;
    } catch (err) {
      console.error(`[cron:guest-email-d3] send failed for ${row.email}:`, err);
      errors++;
    }
  }

  return NextResponse.json({ sent, skipped, errors, examined: due.length });
}
