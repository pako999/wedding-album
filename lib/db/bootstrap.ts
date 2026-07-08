import { runMigrations } from "./migrations";

/**
 * Cold-start schema bootstrap, shared by every route that needs the DB
 * schema to be current before Drizzle's typed SELECTs run.
 *
 * Why this exists: whenever a deploy adds a column to lib/db/schema.ts,
 * Drizzle immediately includes it in every SELECT — but the ALTER TABLE
 * only runs when runMigrations() fires. Previously that was wired only
 * to the /admin layout, so ADMIN pages self-healed but GUEST pages
 * (album galleries, upload APIs) kept throwing `column "x" does not
 * exist` until someone happened to open /admin. That took every
 * existing gallery down after the default_lang deploy.
 *
 * The promise is cached per server instance, so after the first call
 * this is a zero-cost await. On failure it resets so the next request
 * retries.
 */
let bootstrapPromise: Promise<void> | null = null;

export function ensureMigrations(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runMigrations().catch((err) => {
      console.error("[db bootstrap] migrations failed:", err);
      bootstrapPromise = null; // next request retries
    });
  }
  return bootstrapPromise;
}

/** True when the error is Postgres telling us the schema is stale
 *  (missing column/table) — the one failure mode migrations fix.
 *
 *  IMPORTANT: Drizzle wraps the Neon error — the top-level message is
 *  just "Failed query: select …" and the actual `column "x" does not
 *  exist` + SQLSTATE code (42703/42P01) live on `err.cause` (NeonDbError).
 *  The first version of this check only looked at err.message, so the
 *  healing retry never fired in production. Walk the whole cause chain
 *  and check both message text and the `code` property. */
export function isStaleSchemaError(err: unknown): boolean {
  const RE = /column .* does not exist|relation .* does not exist/i;
  const CODES = new Set(["42703", "42P01"]);
  let cur: unknown = err;
  for (let depth = 0; cur && depth < 6; depth++) {
    if (typeof cur === "object") {
      const e = cur as { message?: unknown; code?: unknown; cause?: unknown; sourceError?: unknown };
      if (typeof e.message === "string" && RE.test(e.message)) return true;
      if (typeof e.code === "string" && CODES.has(e.code)) return true;
      cur = e.cause ?? e.sourceError;
    } else {
      if (typeof cur === "string" && RE.test(cur)) return true;
      break;
    }
  }
  return false;
}

/**
 * Run a DB query with schema self-healing: if it fails because the
 * schema is stale, run migrations once and retry. Healthy DBs pay
 * nothing — the catch path only fires on the exact error migrations
 * can fix.
 */
export async function withSchemaHealing<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (err) {
    if (!isStaleSchemaError(err)) throw err;
    console.warn("[db bootstrap] stale schema detected — running migrations and retrying");
    await ensureMigrations();
    return await query();
  }
}
