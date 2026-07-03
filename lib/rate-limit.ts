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
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  const key = `${namespace}:${ip}`;
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
