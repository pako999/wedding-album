import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let warnedMissingShared = false;
let warnedSharedFailureAt = 0;

function evictIfLarge(keepAfter: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [k, b] of buckets) {
    const lastHit = b.hits[b.hits.length - 1];
    if (lastHit === undefined || lastHit < keepAfter) {
      buckets.delete(k);
      if (buckets.size <= MAX_BUCKETS / 2) break;
    }
  }
}

/** Pull the real client IP. Prefer Vercel's platform-controlled header. */
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

async function sha256Short(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sharedRedisConfig(): { url: string; token: string } | null {
  const url =
    process.env.RATE_LIMIT_REDIS_URL ??
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL;
  const token =
    process.env.RATE_LIMIT_REDIS_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ""), token };
}

/**
 * Atomic Redis counter + TTL using one Lua command. Upstash/Vercel KV REST
 * accepts Redis commands as a JSON array POST to the REST endpoint.
 */
async function sharedHit(
  namespace: string,
  clientKey: string,
  windowMs: number,
): Promise<{ count: number; ttlMs: number } | null> {
  const config = sharedRedisConfig();
  if (!config) return null;

  const key = `guestcam:rl:${namespace}:${clientKey}`;
  const script =
    "local n=redis.call('INCR',KEYS[1]); " +
    "if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; " +
    "local ttl=redis.call('PTTL',KEYS[1]); return {n,ttl}";

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", script, "1", key, String(windowMs)]),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Redis REST ${response.status}`);
    const json = await response.json() as { result?: unknown };
    if (!Array.isArray(json.result) || json.result.length < 2) {
      throw new Error("Unexpected Redis rate-limit response");
    }
    const count = Number(json.result[0]);
    const ttlMs = Number(json.result[1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
      throw new Error("Invalid Redis rate-limit result");
    }
    return { count, ttlMs: Math.max(0, ttlMs) };
  } catch (err) {
    // Do not take a live event down because the rate-limit store had a brief
    // outage. Fall back locally, but keep the degradation visible in logs.
    if (Date.now() - warnedSharedFailureAt > 60_000) {
      warnedSharedFailureAt = Date.now();
      console.error("[rate-limit] shared store unavailable; using local fallback", err);
    }
    return null;
  }
}

export interface RateLimitResult {
  ok: boolean;
  response: NextResponse;
  retryAfter: number;
}

function blocked(retryAfter: number): RateLimitResult {
  return {
    ok: false,
    retryAfter,
    response: NextResponse.json(
      { error: "Too many requests, slow down.", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    ),
  };
}

/**
 * Distributed sliding-window-like limiter when Redis REST is configured;
 * per-instance fallback otherwise. Venue upload routes intentionally use very
 * high limits because hundreds of phones can share one public NAT address.
 */
export async function checkRateLimit(
  namespace: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const ip = await getClientIp();
  const hashedIp = await sha256Short(ip);

  const shared = await sharedHit(namespace, hashedIp, windowMs);
  if (shared) {
    if (shared.count > limit) {
      return blocked(Math.max(1, Math.ceil(shared.ttlMs / 1000)));
    }
    return {
      ok: true,
      retryAfter: 0,
      response: NextResponse.json({}, { status: 200 }),
    };
  }

  if (process.env.NODE_ENV === "production" && !sharedRedisConfig() && !warnedMissingShared) {
    warnedMissingShared = true;
    console.warn(
      "[rate-limit] no shared Redis REST config; set RATE_LIMIT_REDIS_URL/TOKEN (or Upstash/Vercel KV equivalents)",
    );
  }

  const key = `${namespace}:${hashedIp}`;
  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0]!;
    return blocked(Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)));
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  evictIfLarge(cutoff);

  return {
    ok: true,
    retryAfter: 0,
    response: NextResponse.json({}, { status: 200 }),
  };
}
