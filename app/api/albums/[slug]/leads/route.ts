/**
 * Event lead capture.
 *
 *   POST /api/albums/:slug/leads   public — a guest submits their details
 *   GET  /api/albums/:slug/leads   owner  — list, or ?format=csv to export
 *
 * Only accepts submissions when the album has the `guestDataCapture`
 * flag on, so an ordinary wedding gallery can never be turned into a
 * lead-capture form by POSTing at it.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { albums, eventLeads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { checkAlbumOwnership } from "@/lib/album-ownership";
import { getAlbumFlags } from "@/lib/album-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clamp = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const flags = await getAlbumFlags(album.id);
  if (!flags.guestDataCapture) {
    return NextResponse.json({ error: "not_enabled" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad body" }, { status: 400 });

  const firstName = clamp(body.firstName, 80);
  const lastName  = clamp(body.lastName, 80);
  const email     = clamp(body.email, 160).toLowerCase();
  const locale    = clamp(body.locale, 5) || null;
  // Consent is the ORGANISER's marketing opt-in and is always optional —
  // GDPR Art. 7(4): consent conditioned on receiving a service is not
  // freely given. The upload itself must never depend on this being true.
  const marketingConsent = body.marketingConsent === true;
  const consentText = marketingConsent ? clamp(body.consentText, 500) || null : null;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  try {
    await db
      .insert(eventLeads)
      .values({
        albumId: album.id,
        firstName,
        lastName,
        email,
        marketingConsent,
        consentTimestamp: marketingConsent ? new Date() : null,
        consentText,
        locale,
      })
      // Same guest uploading twice shouldn't error or silently drop a
      // consent change — keep the latest details.
      .onConflictDoUpdate({
        target: [eventLeads.albumId, eventLeads.email],
        set: {
          firstName,
          lastName,
          marketingConsent,
          consentTimestamp: marketingConsent ? new Date() : null,
          consentText,
          locale,
        },
      });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[leads] insert failed:", err);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = await checkAlbumOwnership(album);
  if (!owner.ok) return NextResponse.json({ error: owner.error }, { status: owner.status });

  let rows: (typeof eventLeads.$inferSelect)[] = [];
  try {
    rows = await db.query.eventLeads.findMany({
      where: eq(eventLeads.albumId, album.id),
      orderBy: [desc(eventLeads.createdAt)],
    });
  } catch (err) {
    console.warn("[leads] list failed (table missing?):", err);
    rows = [];
  }

  if (req.nextUrl.searchParams.get("format") === "csv") {
    // Excel is the realistic destination, so: BOM for UTF-8, and every
    // field quoted with "" escaping so names containing a comma or quote
    // can't shift the columns.
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["first_name", "last_name", "email", "marketing_consent", "consent_timestamp", "locale", "created_at"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [r.firstName, r.lastName, r.email, r.marketingConsent ? "yes" : "no",
         r.consentTimestamp?.toISOString() ?? "", r.locale ?? "", r.createdAt.toISOString()]
          .map(esc).join(","),
      ),
    ].join("\r\n");
    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${slug}.csv"`,
      },
    });
  }

  return NextResponse.json({
    leads: rows.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      marketingConsent: r.marketingConsent,
      createdAt: r.createdAt,
    })),
  });
}
