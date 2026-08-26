/**
 * Database bootstrap helpers.
 *
 * Schema DDL is deliberately NOT executed from application requests. Migrations
 * must be applied explicitly before/with a deployment. These helpers keep the
 * old call sites source-compatible while making stale-schema failures visible
 * instead of mutating production from a random serverless request.
 */

export function ensureMigrations(): Promise<void> {
  return Promise.resolve();
}

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

export async function withSchemaHealing<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (err) {
    if (isStaleSchemaError(err)) {
      console.error(
        "[db] stale schema detected. Runtime migrations are disabled; apply the pending migration before serving this deployment.",
      );
    }
    throw err;
  }
}
