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
import { LEAD_COPY } from "@/lib/i18n/lead-translations";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clamp = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
type LeadLang = keyof typeof LEAD_COPY;
const LEAD_LANGS = new Set<LeadLang>(["sl", "hr", "sr", "de", "en", "es"]);

function normalizeLeadLang(value: unknown, fallback: string): LeadLang {
  const requested = clamp(value, 5) as LeadLang;
  if (LEAD_LANGS.has(requested)) return requested;
  const albumLang = clamp(fallback, 5) as LeadLang;
  return LEAD_LANGS.has(albumLang) ? albumLang : "en";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Public endpoint: keep abuse bounded without making a venue NAT a
  // bottleneck. The namespace is per album, so one event cannot exhaust
  // another event's budget.
  const rate = await checkRateLimit(`event-lead:${slug}`, 600, 10 * 60 * 1000);
  if (!rate.ok) return rate.response;

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) }).catch(() => null);
  if (!album || !album.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const flags = await getAlbumFlags(album.id);
  if (!flags.guestDataCapture) {
    return NextResponse.json({ error: "not_enabled" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  const firstName = clamp(body.firstName, 80);
  const lastName = clamp(body.lastName, 80);
  const email = clamp(body.email, 160).toLowerCase();
  const locale = normalizeLeadLang(body.locale, album.defaultLang);

  // Consent is the ORGANISER's marketing opt-in and is always optional —
  // GDPR Art. 7(4): consent conditioned on receiving a service is not
  // freely given. The upload itself must never depend on this being true.
  const marketingConsent = body.marketingConsent === true;

  // Never trust consent wording supplied by the browser. Persist the exact
  // server-owned text that corresponds to the locale and organiser shown to
  // the guest, so an altered request cannot forge the evidence record.
  const consentText = marketingConsent
    ? LEAD_COPY[locale].consentLabel(album.coupleName)
    : null;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email_invalid" }, { status: 400 });
  }

  try {
    const consentTimestamp = marketingConsent ? new Date() : null;
    await db
      .insert(eventLeads)
      .values({
        albumId: album.id,
        firstName,
        lastName,
        email,
        marketingConsent,
        consentTimestamp,
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
          consentTimestamp,
          consentText,
          locale,
        },
      });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
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
    // Guests control these values. Prefix spreadsheet formula characters so
    // opening the export in Excel/Sheets cannot execute an injected formula.
    const spreadsheetSafe = (value: unknown) => {
      const raw = String(value ?? "");
      return /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
    };
    const esc = (v: unknown) => `"${spreadsheetSafe(v).replace(/"/g, '""')}"`;
    const header = [
      "first_name",
      "last_name",
      "email",
      "marketing_consent",
      "consent_timestamp",
      "consent_text",
      "locale",
      "created_at",
    ];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.firstName,
          r.lastName,
          r.email,
          r.marketingConsent ? "yes" : "no",
          r.consentTimestamp?.toISOString() ?? "",
          r.consentText ?? "",
          r.locale ?? "",
          r.createdAt.toISOString(),
        ].map(esc).join(","),
      ),
    ].join("\r\n");
    return new NextResponse("﻿" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${slug}.csv"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  return NextResponse.json(
    {
      leads: rows.map((r) => ({
        id: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        marketingConsent: r.marketingConsent,
        consentTimestamp: r.consentTimestamp,
        consentText: r.consentText,
        locale: r.locale,
        createdAt: r.createdAt,
      })),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
