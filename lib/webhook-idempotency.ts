import { neon } from "@neondatabase/serverless";

/**
 * Durable webhook replay protection shared by all serverless instances.
 *
 * The table is deliberately tiny and self-initialising so webhook safety does
 * not depend on a manual migration being run before a deploy. A later schema
 * migration may create the same table; CREATE TABLE IF NOT EXISTS keeps both
 * paths compatible.
 */
let ensurePromise: Promise<void> | null = null;

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured");
  return neon(url);
}

async function ensureTable(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const sql = sqlClient();
      await sql`
        CREATE TABLE IF NOT EXISTS webhook_receipts (
          provider     TEXT NOT NULL,
          event_id     TEXT NOT NULL,
          received_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (provider, event_id)
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS webhook_receipts_received_idx
        ON webhook_receipts (received_at)
      `;
    })().catch((err) => {
      // Allow the next request to retry table initialisation after a transient
      // database outage rather than poisoning this serverless instance forever.
      ensurePromise = null;
      throw err;
    });
  }
  await ensurePromise;
}

/**
 * Atomically claim an external webhook event id.
 * Returns false when another request/delivery already claimed the same id.
 */
export async function claimWebhookEvent(provider: string, eventId: string): Promise<boolean> {
  await ensureTable();
  const sql = sqlClient();
  const rows = await sql`
    INSERT INTO webhook_receipts (provider, event_id)
    VALUES (${provider}, ${eventId})
    ON CONFLICT (provider, event_id) DO NOTHING
    RETURNING event_id
  `;
  return Array.isArray(rows) && rows.length === 1;
}

/**
 * Release a claim after a retryable side effect fails. This keeps concurrency
 * safe (only one delivery works at a time) while allowing the provider's next
 * retry to claim the operation again instead of turning a temporary outage
 * into a permanently skipped action.
 */
export async function releaseWebhookEvent(provider: string, eventId: string): Promise<void> {
  await ensureTable();
  const sql = sqlClient();
  await sql`
    DELETE FROM webhook_receipts
    WHERE provider = ${provider} AND event_id = ${eventId}
  `;
}

/**
 * Best-effort cleanup for receipts older than 90 days. Kept probabilistic so
 * normal webhook traffic never pays a DELETE on every request.
 */
export async function maybePruneWebhookReceipts(): Promise<void> {
  if (Math.random() > 0.01) return;
  try {
    await ensureTable();
    const sql = sqlClient();
    await sql`DELETE FROM webhook_receipts WHERE received_at < NOW() - INTERVAL '90 days'`;
  } catch (err) {
    console.warn("[webhook-idempotency] prune failed:", err);
  }
}
