import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { runMigrations } from "@/lib/db/migrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/admin/run-migrations
 *
 * Admin-authenticated wrapper around runMigrations(). Lets the operator
 * bootstrap new schema changes / one-shot backfills without needing to
 * know MIGRATE_SECRET or SSH into a shell. Idempotent — the migration
 * runner uses CREATE IF NOT EXISTS + safe UPDATEs everywhere.
 */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await runMigrations();
    return NextResponse.json({ ok: true, message: "Migracije so uspešno zagnane." });
  } catch (err) {
    console.error("[admin/run-migrations]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
