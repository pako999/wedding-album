import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, uploadReminders, guestEmails } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendUploadReminder } from "@/lib/email/notifications";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DELAYS = [0, 60, 1440, 4320];
const VALID_LOCALES = new Set(["sl", "hr", "sr", "de", "en", "es"]);

interface RemindBody {
  email?: string;
  delayMinutes?: number;
  marketingConsent?: boolean;
  locale?: string;
}

/**
 * POST /api/albums/[slug]/remind
 *
 * Guest action (no Clerk auth): a guest enters their email and gets a
 * reminder to upload photos to the album later.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: RemindBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Allow only specific delay values — clamp anything else to 0 (send now).
  const delayMinutes = ALLOWED_DELAYS.includes(body.delayMinutes as number)
    ? (body.delayMinutes as number)
    : 0;

  const album = await db.query.albums
    .findFirst({ where: eq(albums.slug, slug) })
    .catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const sendAt = new Date(Date.now() + delayMinutes * 60000);

  if (delayMinutes === 0) {
    await sendUploadReminder({
      to: email,
      coupleName: album.coupleName,
      albumSlug: album.slug,
    });
    await db.insert(uploadReminders).values({
      albumId: album.id,
      email,
      sendAt,
      sent: true,
    });
  } else {
    await db.insert(uploadReminders).values({
      albumId: album.id,
      email,
      sendAt,
      sent: false,
    });
  }

  // Capture the email with the guest's consent choice. Feeds the D3
  // transactional and D21 pitch email sequences in P1. Best-effort; if
  // the row already exists we upsert consent (they can opt in later
  // by re-entering their email — spec doesn't cover opt-in-only-once).
  const marketingConsent = body.marketingConsent === true;
  const locale = typeof body.locale === "string" && VALID_LOCALES.has(body.locale) ? body.locale : null;
  try {
    await db
      .insert(guestEmails)
      .values({
        albumId: album.id,
        email,
        marketingConsent,
        consentTimestamp: marketingConsent ? new Date() : null,
        locale,
      })
      .onConflictDoUpdate({
        target: [guestEmails.albumId, guestEmails.email],
        set: marketingConsent
          ? { marketingConsent: true, consentTimestamp: new Date(), locale }
          : { locale }, // never downgrade consent silently — only upgrade
      });
  } catch (err) {
    console.warn("[remind] guest_emails upsert failed:", err);
  }

  return NextResponse.json({ ok: true, marketingConsent });
}
