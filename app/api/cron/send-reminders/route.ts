/**
 * GET /api/cron/send-reminders
 *
 * Vercel Cron Job — runs every 15 minutes.
 * Finds upload reminders whose sendAt has passed and that haven't been sent,
 * emails each guest a reminder to upload their photos, then marks them sent.
 *
 * Protected with CRON_SECRET env var (set in Vercel dashboard).
 * Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on cron calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, uploadReminders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendUploadReminder } from "@/lib/email/notifications";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Verify cron secret — fail closed if CRON_SECRET is not configured.
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all due reminders that haven't been sent yet
  const dueReminders = await db
    .select()
    .from(uploadReminders)
    .where(
      sql`${uploadReminders.sent} = false AND ${uploadReminders.sendAt} <= ${now}`,
    );

  if (dueReminders.length === 0) {
    return NextResponse.json({ message: "No due reminders", sent: 0 });
  }

  let sent = 0;
  let errors = 0;

  for (const reminder of dueReminders) {
    try {
      const album = await db.query.albums.findFirst({
        where: eq(albums.id, reminder.albumId),
      });
      if (!album) {
        // Album gone — mark sent so we don't keep retrying a dead row.
        await db
          .update(uploadReminders)
          .set({ sent: true })
          .where(eq(uploadReminders.id, reminder.id));
        continue;
      }

      await sendUploadReminder({
        to: reminder.email,
        coupleName: album.coupleName,
        albumSlug: album.slug,
      });

      await db
        .update(uploadReminders)
        .set({ sent: true })
        .where(eq(uploadReminders.id, reminder.id));

      sent++;
    } catch (err) {
      console.error(`[send-reminders] Failed to send reminder ${reminder.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({
    message: `Processed ${dueReminders.length} due reminder(s)`,
    sent,
    errors,
  });
}
