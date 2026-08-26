import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { runMigrations } from "@/lib/db/migrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretsEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * POST /api/migrate
 *
 * Runs the app's idempotent DB migrations. The secret is accepted only in a
 * request header — never in the URL — so it cannot leak into browser history,
 * access logs, analytics or Referer headers.
 *
 *   Authorization: Bearer <MIGRATE_SECRET>
 *   or x-migrate-secret: <MIGRATE_SECRET>
 */
export async function POST(request: Request) {
  const expectedSecret = process.env.MIGRATE_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Migration endpoint disabled" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const bearer = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";
  const providedSecret = bearer || request.headers.get("x-migrate-secret")?.trim() || "";

  if (!providedSecret || !secretsEqual(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    await runMigrations();
    // runMigrations deliberately logs individual idempotent step failures and
    // continues, so do not claim every SQL statement succeeded here.
    return NextResponse.json(
      { ok: true, message: "Migration run completed; inspect server logs for any failed steps." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[/api/migrate]", err);
    return NextResponse.json(
      { ok: false, error: "Migration run failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

// Never accept migration credentials in a query string. GET remains explicit
// so scanners/crawlers receive a clear method response instead of a 404.
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}
