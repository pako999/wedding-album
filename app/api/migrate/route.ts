import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/migrations";

/**
 * GET /api/migrate
 * Runs idempotent DB migrations. Safe to call multiple times.
 * Protected by a simple secret so it can't be abused in production.
 */
export async function GET(request: Request) {
  // Require MIGRATE_SECRET — fail closed if it is not configured, so the
  // endpoint can never run migrations unauthenticated.
  const expectedSecret = process.env.MIGRATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Migration endpoint disabled — MIGRATE_SECRET is not set" },
      { status: 503 },
    );
  }
  // Authorization: Bearer <MIGRATE_SECRET>. Moved off the ?secret= query
  // param so the secret cannot leak via access logs, referrers or shared
  // browser history.
  if (request.headers.get("authorization") !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runMigrations();
    return NextResponse.json({ ok: true, message: "Migrations applied successfully" });
  } catch (err) {
    console.error("[/api/migrate]", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
