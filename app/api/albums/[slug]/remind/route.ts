import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, uploadReminders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendUploadReminder } from "@/lib/email/notifications";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DELAYS = [0, 60, 1440, 4320];

interface RemindBody {
  email?: string;
  delayMinutes?: number;
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

  return NextResponse.json({ ok: true });
}
