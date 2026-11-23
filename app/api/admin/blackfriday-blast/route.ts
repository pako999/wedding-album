import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { ensureMigrations } from "@/lib/db/bootstrap";
import { db } from "@/lib/db";
import { discountCodes, marketingContacts } from "@/lib/db/schema";
import { ensureMarketingContact } from "@/lib/marketing-contacts";
import { sendBlackFridayEmail } from "@/lib/email/blackfriday-campaign";
import {
  claimLifecycleEmail,
  markLifecycleEmailSent,
  releaseLifecycleEmail,
} from "@/lib/lifecycle-email-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST/GET /api/admin/blackfriday-blast
 *
 * One-time Black Friday promo blast to all registered (Clerk) users, each in
 * their own language. Admin-only. Safety rails:
 *
 *   GET  (any)                 → DRY RUN. Counts recipients, sends nothing,
 *                                writes nothing. Safe to open in a browser.
 *   POST ?test=email@x[&lang]  → sends ONE preview email to that address.
 *   POST ?confirm=SEND[&limit] → the real blast. Throttled, capped per call
 *                                (default 300), resumable: re-invoke until
 *                                `hasMore` is false. Idempotent per user via
 *                                the lifecycle-email claim log, so a re-run
 *                                never double-sends.
 *
 * It refuses to send if the BLACKFRIDAY code is missing, inactive or expired —
 * we never advertise a dead code. Unsubscribed contacts are always skipped.
 */

const CAMPAIGN_KIND = "blackfriday-2026";
const DEFAULT_LIMIT = 300;
const PAGE = 100;
const HARD_CAP = 20000; // safety ceiling on enumeration
const THROTTLE_MS = 120; // be polite to Resend / deliverability

const LANGS = new Set(["sl", "hr", "sr", "de", "en", "es"]);

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>;
type ClerkUser = Awaited<ReturnType<ClerkClient["users"]["getUser"]>>;

function primaryEmail(u: ClerkUser): string | null {
  return (
    u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
    u.emailAddresses[0]?.emailAddress ??
    null
  );
}

function userLang(u: ClerkUser): string {
  const meta = u.publicMetadata;
  const lang = meta && typeof meta.lang === "string" ? meta.lang : "";
  return LANGS.has(lang) ? lang : "sl";
}

/** Fetch the live BLACKFRIDAY code; returns null if it can't be advertised. */
async function activeOffer(): Promise<{ code: string; expiresAt: Date } | null> {
  const rows = await db
    .select({
      code: discountCodes.code,
      expiresAt: discountCodes.expiresAt,
      isActive: discountCodes.isActive,
    })
    .from(discountCodes)
    .where(eq(discountCodes.code, "BLACKFRIDAY"))
    .limit(1);
  const row = rows[0];
  if (!row || !row.isActive) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  // Expiry is advertised in the email; fall back to Cyber Monday if unset.
  return { code: row.code, expiresAt: row.expiresAt ?? new Date("2026-12-01T23:59:59Z") };
}

async function dryRun(): Promise<NextResponse> {
  const client = await clerkClient();
  let totalUsers = 0;
  let withEmail = 0;
  let offset = 0;
  while (offset < HARD_CAP) {
    const { data } = await client.users.getUserList({ limit: PAGE, offset });
    if (data.length === 0) break;
    for (const u of data) {
      totalUsers++;
      if (primaryEmail(u)) withEmail++;
    }
    if (data.length < PAGE) break;
    offset += PAGE;
  }

  const [sentRow] = await db
    .select({ c: count() })
    .from(marketingContacts)
    .where(isNotNull(marketingContacts.unsubscribedAt));
  const suppressed = sentRow?.c ?? 0;

  const offer = await activeOffer();

  return NextResponse.json({
    mode: "dry-run",
    offerLive: !!offer,
    offer,
    totalUsers,
    withEmail,
    suppressedContacts: suppressed,
    note:
      "No emails sent. POST ?test=you@example.com to preview, then POST ?confirm=SEND to blast (re-invoke until hasMore=false).",
  });
}

async function sendTest(email: string, lang: string): Promise<NextResponse> {
  const offer = await activeOffer();
  if (!offer) {
    return NextResponse.json(
      { ok: false, error: "BLACKFRIDAY code is missing, inactive or expired — nothing sent." },
      { status: 409 },
    );
  }
  const safeLang = LANGS.has(lang) ? lang : "sl";
  const contact = await ensureMarketingContact(email, null, safeLang);
  try {
    await sendBlackFridayEmail({
      to: email,
      firstName: null,
      locale: safeLang,
      code: offer.code,
      expiresAt: offer.expiresAt,
      unsubscribeToken: contact.unsubscribeToken,
      scopeId: `test-${email}-${Date.now()}`, // never collides with real claims
    });
    return NextResponse.json({ ok: true, mode: "test", to: email, lang: safeLang });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

async function blast(limit: number): Promise<NextResponse> {
  const offer = await activeOffer();
  if (!offer) {
    return NextResponse.json(
      { ok: false, error: "BLACKFRIDAY code is missing, inactive or expired — nothing sent." },
      { status: 409 },
    );
  }

  const client = await clerkClient();
  let sent = 0;
  let skippedNoEmail = 0;
  let skippedSuppressed = 0;
  let skippedAlready = 0;
  let errors = 0;
  let scanned = 0;
  let offset = 0;
  let hasMore = false;

  outer: while (offset < HARD_CAP) {
    const { data } = await client.users.getUserList({ limit: PAGE, offset });
    if (data.length === 0) break;

    for (const u of data) {
      scanned++;
      const email = primaryEmail(u);
      if (!email) { skippedNoEmail++; continue; }

      const lang = userLang(u);
      const contact = await ensureMarketingContact(email, u.id, lang);
      if (contact.unsubscribedAt) { skippedSuppressed++; continue; }

      // Idempotency: claim this (user, campaign). A prior successful run that
      // marked it sent returns false here, so re-running never double-sends.
      const claimed = await claimLifecycleEmail(u.id, CAMPAIGN_KIND, email);
      if (!claimed) { skippedAlready++; continue; }

      try {
        await sendBlackFridayEmail({
          to: email,
          firstName: u.firstName,
          locale: lang,
          code: offer.code,
          expiresAt: offer.expiresAt,
          unsubscribeToken: contact.unsubscribeToken,
          scopeId: u.id,
        });
        await markLifecycleEmailSent(u.id, CAMPAIGN_KIND);
        sent++;
      } catch (err) {
        console.error(`[blackfriday-blast] send failed for ${u.id}:`, err);
        // Release the claim so a later run retries this user.
        await releaseLifecycleEmail(u.id, CAMPAIGN_KIND);
        errors++;
      }

      if (sent >= limit) { hasMore = true; break outer; }
      await new Promise((r) => setTimeout(r, THROTTLE_MS));
    }

    if (data.length < PAGE) break;
    offset += PAGE;
  }

  return NextResponse.json({
    ok: true,
    mode: "send",
    sent,
    skippedNoEmail,
    skippedSuppressed,
    skippedAlready,
    errors,
    scanned,
    hasMore,
    note: hasMore
      ? "Per-call cap reached. Re-invoke POST ?confirm=SEND to continue."
      : "All eligible users processed.",
  });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    // Self-heal: this API function may run on an instance that never hit the
    // admin layout, so make sure marketing_contacts etc. exist before querying.
    await ensureMigrations();
    return await dryRun();
  } catch (err) {
    console.error("[blackfriday-blast] dry-run", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const test = url.searchParams.get("test");
  const confirm = url.searchParams.get("confirm");

  try {
    // Self-heal schema before any contact upsert / send.
    await ensureMigrations();
    if (test) {
      return await sendTest(test.trim().toLowerCase(), url.searchParams.get("lang") ?? "sl");
    }
    if (confirm === "SEND") {
      const limitParam = Number(url.searchParams.get("limit"));
      const limit = Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 2000)
        : DEFAULT_LIMIT;
      return await blast(limit);
    }
    // No explicit action → dry run, never an accidental send.
    return await dryRun();
  } catch (err) {
    console.error("[blackfriday-blast]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
