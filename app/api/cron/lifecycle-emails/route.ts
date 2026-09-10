import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums, discountCodes } from "@/lib/db/schema";
import {
  sendEventCountdownEmail,
  sendExpiryWarningEmail,
  sendPostEventEmail,
  sendRegistrationSalesEmail,
} from "@/lib/email/lifecycle-reminders";
import {
  claimLifecycleEmail,
  markLifecycleEmailSent,
  releaseLifecycleEmail,
} from "@/lib/lifecycle-email-log";

export const runtime = "nodejs";
export const maxDuration = 300;

const DAY_MS = 86_400_000;
const SALES_DELAY_DAYS = 15;
const SALES_DISCOUNT_PERCENT = 30;
const SALES_DISCOUNT_HOURS = 24;
const EVENT_REMINDER_DAYS = [7, 3, 1] as const;
const EXPIRY_WARNING_DAYS = 7;
const SEND_CAP = 100;

type ClerkUser = Awaited<ReturnType<Awaited<ReturnType<typeof clerkClient>>["users"]["getUser"]>>;
type AlbumRow = Awaited<ReturnType<typeof loadAlbums>>[number];

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftedIsoDay(now: Date, offset: number): string {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return isoDay(date);
}

function userLocale(user: ClerkUser): string {
  const metadata = user.publicMetadata;
  if (metadata && typeof metadata.lang === "string") return metadata.lang;
  return "sl";
}

function primaryEmail(user: ClerkUser): string | null {
  return user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
    ?? null;
}

async function loadAlbums() {
  return db.select({
    id: albums.id,
    slug: albums.slug,
    ownerClerkId: albums.ownerClerkId,
    ownerEmail: albums.ownerEmail,
    coupleName: albums.coupleName,
    weddingDate: albums.weddingDate,
    defaultLang: albums.defaultLang,
    plan: albums.plan,
    photoCount: albums.photoCount,
    expiresAt: albums.expiresAt,
  }).from(albums);
}

async function uniqueDiscountCode(expiresAt: Date): Promise<{ id: string; code: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `GC30-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
    const [created] = await db.insert(discountCodes).values({
      code,
      percentOff: SALES_DISCOUNT_PERCENT,
      maxUses: 1,
      expiresAt,
    }).onConflictDoNothing({ target: discountCodes.code }).returning({
      id: discountCodes.id,
      code: discountCodes.code,
    });
    if (created) return created;
  }
  throw new Error("Could not allocate lifecycle discount code");
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const allAlbums = await loadAlbums();
  const clerk = await clerkClient();
  const userCache = new Map<string, ClerkUser | null>();
  const counters = { salesD15: 0, eventD7: 0, eventD3: 0, eventD1: 0, postEvent: 0, expiry: 0, skipped: 0, errors: 0 };
  let totalSent = 0;

  const getUser = async (clerkId: string): Promise<ClerkUser | null> => {
    if (userCache.has(clerkId)) return userCache.get(clerkId) ?? null;
    try {
      const user = await clerk.users.getUser(clerkId);
      userCache.set(clerkId, user);
      return user;
    } catch (err) {
      console.warn(`[lifecycle-emails] Clerk lookup failed for ${clerkId}:`, err);
      userCache.set(clerkId, null);
      return null;
    }
  };

  const ownerEmail = async (album: AlbumRow): Promise<string | null> => {
    if (album.ownerEmail?.trim()) return album.ownerEmail.trim();
    const user = await getUser(album.ownerClerkId);
    return user ? primaryEmail(user) : null;
  };

  const deliverAlbumEmail = async (
    album: AlbumRow,
    kind: string,
    sendEmail: (email: string) => Promise<void>,
    counter: "eventD7" | "eventD3" | "eventD1" | "postEvent" | "expiry",
  ) => {
    if (totalSent >= SEND_CAP) return;
    const email = await ownerEmail(album);
    if (!email) { counters.skipped++; return; }
    const claimed = await claimLifecycleEmail(album.id, kind, email);
    if (!claimed) { counters.skipped++; return; }
    let accepted = false;
    try {
      await sendEmail(email);
      accepted = true;
      await markLifecycleEmailSent(album.id, kind);
      counters[counter]++;
      totalSent++;
    } catch (err) {
      console.error(`[lifecycle-emails] ${kind} failed for ${album.slug}:`, err);
      if (!accepted) await releaseLifecycleEmail(album.id, kind).catch(() => {});
      counters.errors++;
    }
  };

  // D-7, D-3 and D-1 operational checks for every event owner.
  for (const days of EVENT_REMINDER_DAYS) {
    const target = shiftedIsoDay(now, days);
    for (const album of allAlbums.filter((row) => row.weddingDate === target)) {
      const counter = `eventD${days}` as "eventD7" | "eventD3" | "eventD1";
      await deliverAlbumEmail(album, `event-d${days}`, (email) => sendEventCountdownEmail({
        to: email,
        coupleName: album.coupleName,
        eventDate: album.weddingDate,
        daysUntil: days,
        albumSlug: album.slug,
        locale: album.defaultLang,
        scopeId: album.id,
      }), counter);
    }
  }

  // D+1: remind owners with collected media to download their ZIP and review us.
  const yesterday = shiftedIsoDay(now, -1);
  for (const album of allAlbums.filter((row) => row.weddingDate === yesterday && row.photoCount > 0)) {
    await deliverAlbumEmail(album, "post-event-d1", (email) => sendPostEventEmail({
      to: email,
      coupleName: album.coupleName,
      photoCount: album.photoCount,
      albumSlug: album.slug,
      locale: album.defaultLang,
      scopeId: album.id,
    }), "postEvent");
  }

  // One warning as soon as an album enters its final seven-day access window.
  const expiryLimit = new Date(now.getTime() + EXPIRY_WARNING_DAYS * DAY_MS);
  for (const album of allAlbums.filter((row) => row.expiresAt && row.expiresAt > now && row.expiresAt <= expiryLimit)) {
    await deliverAlbumEmail(album, "expiry-d7", (email) => sendExpiryWarningEmail({
      to: email,
      coupleName: album.coupleName,
      expiresAt: album.expiresAt!,
      albumSlug: album.slug,
      locale: album.defaultLang,
      scopeId: album.id,
    }), "expiry");
  }

  // D15 sales offer: only users registered during the previous daily window
  // who have never activated a paid gallery. This avoids mailing old accounts
  // when the job is first deployed.
  const paidOwners = new Set(allAlbums.filter((album) => album.plan !== "free").map((album) => album.ownerClerkId));
  const albumsByOwner = new Map<string, AlbumRow[]>();
  for (const album of allAlbums) {
    const rows = albumsByOwner.get(album.ownerClerkId) ?? [];
    rows.push(album);
    albumsByOwner.set(album.ownerClerkId, rows);
  }
  const newestEligible = now.getTime() - SALES_DELAY_DAYS * DAY_MS;
  const oldestEligible = now.getTime() - (SALES_DELAY_DAYS + 1) * DAY_MS;
  let offset = 0;
  while (offset < 5000 && totalSent < SEND_CAP) {
    const { data } = await clerk.users.getUserList({ limit: 100, offset });
    if (data.length === 0) break;
    for (const user of data) {
      userCache.set(user.id, user);
      if (!user.createdAt || user.createdAt > newestEligible || user.createdAt <= oldestEligible || paidOwners.has(user.id)) continue;
      const email = primaryEmail(user);
      if (!email) { counters.skipped++; continue; }
      const kind = "sales-d15";
      const claimed = await claimLifecycleEmail(user.id, kind, email);
      if (!claimed) { counters.skipped++; continue; }
      let discount: { id: string; code: string } | null = null;
      let accepted = false;
      try {
        const expiresAt = new Date(Date.now() + SALES_DISCOUNT_HOURS * 3_600_000);
        discount = await uniqueDiscountCode(expiresAt);
        const ownerAlbums = albumsByOwner.get(user.id) ?? [];
        const freeAlbum = ownerAlbums.find((album) => album.plan === "free" && album.weddingDate >= isoDay(now))
          ?? ownerAlbums.find((album) => album.plan === "free")
          ?? null;
        await sendRegistrationSalesEmail({
          to: email,
          firstName: user.firstName,
          locale: freeAlbum?.defaultLang ?? userLocale(user),
          discountCode: discount.code,
          discountPercent: SALES_DISCOUNT_PERCENT,
          discountExpiresAt: expiresAt,
          albumSlug: freeAlbum?.slug,
          scopeId: user.id,
        });
        accepted = true;
        await markLifecycleEmailSent(user.id, kind);
        counters.salesD15++;
        totalSent++;
      } catch (err) {
        console.error(`[lifecycle-emails] sales-d15 failed for ${user.id}:`, err);
        if (!accepted) {
          await releaseLifecycleEmail(user.id, kind).catch(() => {});
          if (discount) await db.delete(discountCodes).where(eq(discountCodes.id, discount.id)).catch(() => {});
        }
        counters.errors++;
      }
      if (totalSent >= SEND_CAP) break;
    }
    if (data.length < 100) break;
    offset += 100;
  }

  return NextResponse.json({ ok: true, totalSent, ...counters });
}
