import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Simple per-IP sliding-window rate limiter.
 *
 * Implementation is in-memory (Map keyed by IP), so limits are enforced
 * PER SERVERLESS INSTANCE. With Vercel's cold starts and horizontal
 * scaling a determined attacker who can hit multiple instances gets a
 * higher effective rate. That's acceptable: casual abuse (single bot,
 * single script) is fully blocked, and adding a shared store
 * (Upstash Redis via @upstash/ratelimit or Vercel KV) is a drop-in swap
 * — just replace `hit()` with the redis-backed variant.
 *
 * Usage in a route handler:
 *
 *   const rl = await checkRateLimit("contact", 3, 60_000); // 3 per minute
 *   if (!rl.ok) return rl.response;
 */

interface Bucket {
  /** Timestamps (ms epoch) of recent hits, oldest first. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// GC old buckets so the Map doesn't grow forever. Runs on any hit
// after this many entries pile up — cheap for our scale (~10k IPs/day).
const MAX_BUCKETS = 10_000;

function evictIfLarge(now: number, keepAfter: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [k, b] of buckets) {
    const lastHit = b.hits[b.hits.length - 1];
    if (lastHit === undefined || lastHit < keepAfter) {
      buckets.delete(k);
      if (buckets.size <= MAX_BUCKETS / 2) break;
    }
  }
}

/** Pull the real client IP. Prefer Vercel's stripped-and-verified header
 *  when present so a client-sent x-forwarded-for can't spoof. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const vercel = h.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  /** For a failed check, a ready-to-return NextResponse with 429. */
  response: NextResponse;
  /** Seconds until the next allowed hit (approximate). */
  retryAfter: number;
}

/**
 * Sliding-window check.
 *
 * @param key        Namespace + IP (or user id). Choose a stable key so
 *                   different endpoints don't share buckets.
 * @param limit      Max hits within the window.
 * @param windowMs   Window duration in milliseconds.
 */
export async function checkRateLimit(
  namespace: string,
  limit: number,
  windowMs: number,
  /** Explicit per-caller identifier (e.g. a browser UUID). When omitted the
   *  key falls back to the client IP. Without this, callers that only vary
   *  the namespace share one bucket per IP — so many guests behind one venue
   *  IP would collide in a single bucket instead of each getting their own. */
  identifier?: string,
): Promise<RateLimitResult> {
  const who = identifier ?? (await getClientIp());
  const key = `${namespace}:${who}`;
  const now = Date.now();
  const cutoff = now - windowMs;

  const bucket = buckets.get(key) ?? { hits: [] };
  // Drop expired hits
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0]!;
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    const retryAfter = Math.ceil(retryAfterMs / 1000);
    return {
      ok: false,
      retryAfter,
      response: NextResponse.json(
        { error: "Too many requests, slow down.", retryAfter },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      ),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  evictIfLarge(now, cutoff);

  return {
    ok: true,
    retryAfter: 0,
    response: NextResponse.json({}, { status: 200 }), // caller ignores this
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Distributed (Neon-backed) rate limiting with quota leasing.
//
// The in-memory limiter above is per-instance: fine for shaping a single
// misbehaving browser, but NOT authoritative, since Vercel runs many
// instances. For the abuse ceiling that must hold across the whole fleet
// (e.g. one venue's public IP at a 1000-guest event) we need a shared
// counter. It lives in Postgres — the DB the app already pays for — with
// quota LEASING so a warm instance does roughly one DB round-trip per
// LEASE requests instead of one per request.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { getSql } from "@/lib/db";

/** How many hits a single DB reservation buys. ~1 DB op per LEASE requests. */
const LEASE = 5;

/** Hash identifiers before they touch the DB — never store a raw IP/email. */
function idHash(identifier: string): string {
  return createHash("sha256").update(identifier).digest("hex").slice(0, 32);
}

// Per-instance lease cache: bucketKey -> { remaining, windowEnd }. A hit
// spends a lease locally; only when the local lease is empty do we reserve
// another block from the shared counter.
interface Lease { remaining: number; windowEnd: number }
const leases = new Map<string, Lease>();

/**
 * Authoritative distributed limit. Returns ok:false once `limit` hits occur
 * across ALL instances within `windowMs`. Reserves quota in blocks of LEASE.
 *
 * On any DB error it fails OPEN (allows the request) rather than blocking
 * legitimate guests — the local in-memory limiter and browser shaping remain
 * as the fallback layer, exactly as the design intends.
 */
export async function checkDistributedLimit(
  namespace: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const windowEnd = windowStart + windowMs;
  const bucketKey = `${namespace}:${idHash(identifier)}:${windowStart}`;

  // Spend from a live local lease first — no DB call.
  const local = leases.get(bucketKey);
  if (local && local.windowEnd === windowEnd && local.remaining > 0) {
    local.remaining--;
    return { ok: true, retryAfter: 0 };
  }

  // Reserve the next block from the shared counter atomically.
  const reserve = Math.min(LEASE, limit);
  try {
    const sql = getSql();
    const rows = (await sql`
      INSERT INTO rate_limit_buckets (bucket_key, count, expires_at)
      VALUES (${bucketKey}, ${reserve}, ${new Date(windowEnd).toISOString()})
      ON CONFLICT (bucket_key)
        DO UPDATE SET count = rate_limit_buckets.count + ${reserve}
      RETURNING count
    `) as unknown as Array<{ count: number }>;

    const total = rows[0]?.count ?? reserve;
    if (total > limit) {
      // Over budget. Give back the slice we reserved past the limit so the
      // counter reflects reality, and refuse.
      const over = total - limit;
      const giveBack = Math.min(over, reserve);
      if (giveBack > 0) {
        await sql`
          UPDATE rate_limit_buckets SET count = count - ${giveBack}
           WHERE bucket_key = ${bucketKey}
        `.catch(() => {});
      }
      leases.delete(bucketKey);
      return { ok: false, retryAfter: Math.ceil((windowEnd - now) / 1000) };
    }

    // Reservation granted: consume one now, cache the rest locally.
    leases.set(bucketKey, { remaining: reserve - 1, windowEnd });
    return { ok: true, retryAfter: 0 };
  } catch (err) {
    console.error("[rate-limit] distributed check failed, allowing:", err);
    return { ok: true, retryAfter: 0 };
  }
}

/** Sweep expired buckets. Called from the hourly maintenance cron, NEVER on
 *  a user request. Returns rows removed. */
export async function cleanupRateLimitBuckets(): Promise<number> {
  try {
    const sql = getSql();
    const rows = (await sql`
      DELETE FROM rate_limit_buckets WHERE expires_at < NOW() RETURNING bucket_key
    `) as unknown as unknown[];
    return rows.length;
  } catch (err) {
    console.error("[rate-limit] bucket cleanup failed:", err);
    return 0;
  }
}
