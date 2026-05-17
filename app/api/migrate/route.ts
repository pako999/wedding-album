import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/migrations";

/**
 * GET /api/migrate
 * Runs idempotent DB migrations. Safe to call multiple times.
 * Protected by a simple secret so it can't be abused in production.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Simple protection — set MIGRATE_SECRET env var, or allow if not set (first deploy)
  const expectedSecret = process.env.MIGRATE_SECRET;
  if (expectedSecret && secret !== expectedSecret) {
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
