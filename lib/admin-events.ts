import { neon } from "@neondatabase/serverless";
import { clerkClient } from "@clerk/nextjs/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";

export interface AdminEvent {
  id: string;
  slug: string;
  ownerClerkId: string;
  ownerEmail: string | null;
  coupleName: string;
  eventType: string;
  weddingDate: string;
  eventTime: string | null;
  location: string | null;
  plan: string;
  photoCount: number;
  isPublished: boolean;
}

type EventTimeRow = {
  album_id: string;
  event_time: string | null;
};

const EVENT_TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

async function loadEventTimes(): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return result;

  try {
    const query = neon(databaseUrl);
    const rows = await query`
      SELECT album_id, event_time
      FROM album_header_settings
      WHERE event_time IS NOT NULL AND event_time <> ''
    ` as unknown as EventTimeRow[];

    for (const row of rows) {
      if (row.event_time && EVENT_TIME_RE.test(row.event_time)) {
        result.set(row.album_id, row.event_time);
      }
    }
  } catch (err) {
    // Legacy databases may not have the optional settings table yet. The
    // event dashboard remains useful with dates alone in that case.
    console.warn("[admin/events] Event time lookup failed:", err);
  }

  return result;
}

async function resolveLegacyOwnerEmails(events: AdminEvent[]): Promise<void> {
  const missingIds = [...new Set(
    events.filter((event) => !event.ownerEmail).map((event) => event.ownerClerkId),
  )];
  if (missingIds.length === 0) return;

  try {
    const client = await clerkClient();
    const emails = new Map<string, string>();

    for (let i = 0; i < missingIds.length; i += 100) {
      const { data } = await client.users.getUserList({
        userId: missingIds.slice(i, i + 100),
        limit: 100,
      });
      for (const user of data) {
        const email = user.emailAddresses.find(
          (candidate) => candidate.id === user.primaryEmailAddressId,
        )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;
        if (email) emails.set(user.id, email);
      }
    }

    for (const event of events) {
      if (!event.ownerEmail) event.ownerEmail = emails.get(event.ownerClerkId) ?? null;
    }
  } catch (err) {
    console.warn("[admin/events] Clerk email lookup failed:", err);
  }
}

/** One batched source for both the overview preview and the full event screen. */
export async function listAdminEvents(): Promise<AdminEvent[]> {
  const [rows, eventTimes] = await Promise.all([
    db
      .select({
        id: albums.id,
        slug: albums.slug,
        ownerClerkId: albums.ownerClerkId,
        ownerEmail: albums.ownerEmail,
        coupleName: albums.coupleName,
        eventType: albums.eventType,
        weddingDate: albums.weddingDate,
        location: albums.location,
        plan: albums.plan,
        photoCount: albums.photoCount,
        isPublished: albums.isPublished,
      })
      .from(albums)
      .orderBy(asc(albums.weddingDate), asc(albums.coupleName))
      .limit(500),
    loadEventTimes(),
  ]);

  const events = rows.map((row) => ({
    ...row,
    eventTime: eventTimes.get(row.id) ?? null,
  }));
  await resolveLegacyOwnerEmails(events);
  return events;
}

/** Current calendar day in the event's primary operating timezone. */
export function todayInSlovenia(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function daysBetweenIsoDates(from: string, to: string): number {
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return Number.NaN;
  return Math.round((toMs - fromMs) / 86_400_000);
}
