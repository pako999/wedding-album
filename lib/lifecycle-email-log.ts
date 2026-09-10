import { neon } from "@neondatabase/serverless";

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured");
  return neon(url);
}

let readyPromise: Promise<void> | null = null;

async function ensureTable() {
  if (!readyPromise) {
    readyPromise = (async () => {
      const sql = client();
      await sql`
        CREATE TABLE IF NOT EXISTS lifecycle_email_reminders (
          scope_id   TEXT NOT NULL,
          kind       VARCHAR(40) NOT NULL,
          email      TEXT NOT NULL,
          claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          sent_at    TIMESTAMPTZ,
          PRIMARY KEY (scope_id, kind)
        )
      `;
      await sql`
        DELETE FROM lifecycle_email_reminders
        WHERE sent_at IS NULL
          AND claimed_at < NOW() - INTERVAL '1 hour'
      `;
    })().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  await readyPromise;
}

/**
 * Atomically reserve one lifecycle email. A stale unfinished reservation is
 * released after one hour, while Resend's deterministic idempotency key still
 * protects a retry from delivering the same message twice.
 */
export async function claimLifecycleEmail(scopeId: string, kind: string, email: string): Promise<boolean> {
  await ensureTable();
  const sql = client();
  const rows = await sql`
    INSERT INTO lifecycle_email_reminders (scope_id, kind, email)
    VALUES (${scopeId}, ${kind}, ${email})
    ON CONFLICT (scope_id, kind) DO NOTHING
    RETURNING scope_id
  `;
  return rows.length > 0;
}

export async function markLifecycleEmailSent(scopeId: string, kind: string): Promise<void> {
  const sql = client();
  await sql`
    UPDATE lifecycle_email_reminders
    SET sent_at = NOW()
    WHERE scope_id = ${scopeId} AND kind = ${kind}
  `;
}

export async function releaseLifecycleEmail(scopeId: string, kind: string): Promise<void> {
  const sql = client();
  await sql`
    DELETE FROM lifecycle_email_reminders
    WHERE scope_id = ${scopeId} AND kind = ${kind} AND sent_at IS NULL
  `;
}
