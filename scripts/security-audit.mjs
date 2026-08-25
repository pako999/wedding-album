#!/usr/bin/env node
/**
 * Repository security regression audit.
 *
 * Fails (exit 1) if any hardening from the 2026 security+cost pass has
 * regressed. Runs in CI and locally (`node scripts/security-audit.mjs`).
 * Each check is a grep-style invariant with a clear message; add a check
 * here whenever a class of bug is fixed so it can never silently return.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", ".vercel"].includes(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(p)) out.push(p);
  }
  return out;
}
const files = walk(ROOT);
const read = (p) => readFileSync(p, "utf8");
const rel = (p) => p.slice(ROOT.length + 1);

// 1. No cron/migrate route reads its secret from a query param.
for (const p of files.filter((f) => /app\/api\/(cron|migrate)\//.test(rel(f)))) {
  const s = read(p);
  if (/searchParams\.get\(["'](secret|apiKey|api_key|key)["']\)/.test(s)) {
    fail(`${rel(p)}: cron/migrate reads a secret from a query param — use Authorization: Bearer`);
  }
}

// 2. No Math.random in security-token modules.
for (const p of files) {
  const r = rel(p);
  if (/(referral|affiliate)\/codes\.ts$|actions\/create-album\.ts$|secure-random\.ts$/.test(r)) {
    if (r.endsWith("secure-random.ts")) continue;
    if (/Math\.random/.test(read(p))) fail(`${r}: Math.random used for a security-sensitive identifier`);
  }
}

// 3. A guest-supplied password is never compared with a plain === against
//    the stored column. An `isHashed(x) && x === album.password` idempotency
//    guard (owner re-saving an already-hashed value) is allowed — that is a
//    hash-to-hash equality, not a plaintext auth check.
for (const p of files.filter((f) => /app\/api\/albums\//.test(rel(f)))) {
  const s = read(p);
  for (const m of s.matchAll(/(\w+)\s*===\s*album\.password|album\.password\s*===\s*(\w+)/g)) {
    const varName = m[1] || m[2];
    const guarded = new RegExp(`isHashed\\(\\s*${varName}\\s*\\)`).test(s);
    if (!guarded) {
      fail(`${rel(p)}: guest password compared directly — use verifyAlbumPassword`);
    }
  }
}

// 4. The distributed limiter and its cleanup still exist.
const rlSrc = read(join(ROOT, "lib/rate-limit.ts"));
if (!/checkDistributedLimit/.test(rlSrc)) fail("lib/rate-limit.ts: distributed limiter removed");
if (!/cleanupRateLimitBuckets/.test(rlSrc)) fail("lib/rate-limit.ts: bucket cleanup removed");
if (!/const LEASE\s*=/.test(rlSrc)) fail("lib/rate-limit.ts: quota leasing removed");

// 5. The durable deletion queue exists and enqueues before row deletion.
const expire = read(join(ROOT, "app/api/cron/expire-albums/route.ts"));
if (!/enqueueDeletions/.test(expire)) fail("expire-albums: not using the durable deletion queue");
const enqIdx = expire.indexOf("enqueueDeletions");
const delIdx = expire.indexOf("db.delete(photos)");
if (enqIdx === -1 || delIdx === -1 || enqIdx > delIdx) {
  fail("expire-albums: photo rows deleted before deletion jobs are enqueued");
}

// 6. Hourly (not */5) maintenance cron.
const vercel = JSON.parse(read(join(ROOT, "vercel.json")));
const worker = (vercel.crons || []).find((c) => c.path === "/api/cron/deletion-worker");
if (!worker) fail("vercel.json: deletion-worker cron missing");
else if (/^\*\/[0-9]/.test(worker.schedule)) fail(`vercel.json: deletion-worker runs too often (${worker.schedule})`);

// 7. OAuth Drive callback verifies signed state.
const cb = read(join(ROOT, "app/api/google-drive/callback/route.ts"));
if (!/verifyOAuthState/.test(cb)) fail("google-drive callback: signed OAuth state not verified");

// 8. Clerk webhook checks timestamp freshness.
const clerk = read(join(ROOT, "app/api/webhooks/clerk/route.ts"));
if (!/svix-timestamp/.test(clerk) || !/300/.test(clerk)) {
  fail("clerk webhook: timestamp freshness check missing");
}

// 9. bank-order never falls back to a €0 price.
const bank = read(join(ROOT, "app/api/bank-order/route.ts"));
if (/\?\?\s*\{\s*name:[^}]*price:\s*0/.test(bank)) {
  fail("bank-order: unknown plan falls back to price 0");
}

// 10. No unresolved git conflict markers.
for (const p of files) {
  if (/^(<{7}|={7}|>{7})/m.test(read(p))) fail(`${rel(p)}: unresolved git conflict marker`);
}

if (failures.length) {
  console.error(`\n✖ security audit: ${failures.length} regression(s)\n`);
  for (const f of failures) console.error("  - " + f);
  process.exit(1);
}
console.log("✓ security audit: all invariants hold");
