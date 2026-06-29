/**
 * GET /api/cron/onboarding-nudge
 *
 * Vercel Cron — runs daily at 09:00 UTC.
 * Finds Clerk users who registered >= 7 days ago, have NOT created any
 * album, and have NOT already been nudged. Sends one multilingual
 * "want help creating your first gallery?" email and records the send
 * so we never send a second one.
 *
 * Protected with CRON_SECRET env var. Vercel automatically sends
 * `Authorization: Bearer <CRON_SECRET>` on cron calls.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, onboardingReminders } from "@/lib/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { sendOnboardingNudgeEmail } from "@/lib/email/notifications";

export const runtime = "nodejs";
export const maxDuration = 60;

type Lang = "sl" | "hr" | "sr" | "de" | "en" | "es";
const SUPPORTED_LANGS: Lang[] = ["sl", "hr", "sr", "de", "en", "es"];

/** Extract a preferred email language from Clerk profile, falling back to SL. */
function pickLang(meta: unknown): Lang {
  if (meta && typeof meta === "object") {
    const raw = (meta as Record<string, unknown>).lang;
    if (typeof raw === "string" && (SUPPORTED_LANGS as string[]).includes(raw)) {
      return raw as Lang;
    }
  }
  return "sl";
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  if (authHeader !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Owners that already have at least one album — skip them.
  const ownerRows = await db.selectDistinct({ clerkId: albums.ownerClerkId }).from(albums);
  const owners = new Set(ownerRows.map((r) => r.clerkId));

  // Users we've already nudged — skip them.
  const sentRows = await db.select({ clerkId: onboardingReminders.clerkId }).from(onboardingReminders);
  const alreadyNudged = new Set(sentRows.map((r) => r.clerkId));

  const client = await clerkClient();
  let sent = 0;
  let skipped = 0;
  let errors = 0;
  let offset = 0;
  const PAGE = 100;
  const HARD_CAP = 5000; // safety

  outer: while (offset < HARD_CAP) {
    const { data } = await client.users.getUserList({ limit: PAGE, offset });
    if (data.length === 0) break;

    for (const u of data) {
      if (!u.createdAt || u.createdAt > cutoff) { skipped++; continue; }
      if (owners.has(u.id))            { skipped++; continue; }
      if (alreadyNudged.has(u.id))     { skipped++; continue; }

      const email = u.emailAddresses?.[0]?.emailAddress;
      if (!email) { skipped++; continue; }

      try {
        const lang = pickLang(u.publicMetadata);
        await sendOnboardingNudgeEmail({ to: email, firstName: u.firstName, lang });
        await db
          .insert(onboardingReminders)
          .values({ clerkId: u.id, email })
          .onConflictDoNothing();
        sent++;
      } catch (err) {
        console.error(`[onboarding-nudge] send failed for ${u.id}:`, err);
        errors++;
      }

      // Be polite: stop after 50 sends per run so a backlog doesn't burst.
      if (sent >= 50) break outer;
    }

    if (data.length < PAGE) break;
    offset += PAGE;
  }

  return NextResponse.json({ sent, skipped, errors });
}
