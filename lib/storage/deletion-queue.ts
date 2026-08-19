import { createHash, randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { deleteBunnyFile, deleteBunnyStreamVideo } from "@/lib/storage/bunny";

/**
 * Durable, Postgres-backed storage deletion queue.
 *
 * The problem it solves: expire-albums used to delete the remote file and
 * then the DB photo row, counting a failed remote delete as an "error" and
 * deleting the row anyway. That orphaned the file in Bunny forever — paid
 * storage with no pointer, invisible to cleanup.
 *
 * The contract now: a deletion job is persisted BEFORE the live photo row
 * is removed (enqueueMany), with a short safety delay so the row-delete and
 * the enqueue cannot race. A worker (runDeletionWorker) claims jobs
 * atomically, retries with backoff, and parks permanent failures in a
 * dead-letter state instead of losing them.
 *
 * No Redis/Upstash: the same Neon DB the app already pays for, one table.
 */

export type DeletionProvider = "bunny-storage" | "bunny-stream";

const MAX_ATTEMPTS = 6;              // then -> dead-letter
const SAFETY_DELAY_MS = 60_000;      // 1 min: DB cleanup settles before physical delete
const STALE_LOCK_MS = 5 * 60_000;    // reclaim a job whose worker died mid-flight
/** Backoff per attempt (ms), capped at the last value. */
const BACKOFF_MS = [60_000, 300_000, 900_000, 3_600_000, 10_800_000];

function dedupKey(provider: DeletionProvider, target: string): string {
  return `${provider}:${createHash("sha256").update(target).digest("hex")}`;
}

/**
 * Queue deletions. Call this BEFORE deleting the photo rows. Idempotent:
 * the unique dedup_key means re-queuing the same target is a no-op, so a
 * retried cron run cannot double-insert. Returns how many NEW jobs landed.
 */
export async function enqueueDeletions(
  items: Array<{ provider: DeletionProvider; target: string }>,
): Promise<number> {
  if (items.length === 0) return 0;
  const sql = getSql();
  const notBefore = new Date(Date.now() + SAFETY_DELAY_MS);
  let inserted = 0;
  for (const { provider, target } of items) {
    if (!target) continue;
    const rows = await sql`
      INSERT INTO storage_deletion_jobs (id, provider, target, dedup_key, not_before)
      VALUES (${randomUUID()}, ${provider}, ${target}, ${dedupKey(provider, target)}, ${notBefore.toISOString()})
      ON CONFLICT (dedup_key) DO NOTHING
      RETURNING id
    `;
    if (rows.length > 0) inserted++;
  }
  return inserted;
}

interface Job {
  id: string;
  provider: DeletionProvider;
  target: string;
  attempts: number;
}

/**
 * Process up to `batch` due jobs. Safe to run from overlapping workers:
 * the claim uses FOR UPDATE SKIP LOCKED so two workers never grab the same
 * row. Returns a small summary for the cron log.
 */
export async function runDeletionWorker(batch = 50): Promise<{
  claimed: number; deleted: number; retried: number; dead: number;
}> {
  const sql = getSql();
  const staleBefore = new Date(Date.now() - STALE_LOCK_MS).toISOString();

  // Atomic claim: pick due pending jobs (or stale-locked ones whose worker
  // vanished), mark them processing, and return them — all in one statement.
  const claimed = (await sql`
    UPDATE storage_deletion_jobs
       SET status = 'processing', locked_at = NOW(), updated_at = NOW()
     WHERE id IN (
       SELECT id FROM storage_deletion_jobs
        WHERE (
                (status = 'pending'    AND not_before <= NOW())
             OR (status = 'processing' AND locked_at < ${staleBefore})
              )
        ORDER BY not_before ASC
        LIMIT ${batch}
        FOR UPDATE SKIP LOCKED
     )
    RETURNING id, provider, target, attempts
  `) as unknown as Job[];

  let deleted = 0, retried = 0, dead = 0;

  for (const job of claimed) {
    let ok = false;
    try {
      ok = job.provider === "bunny-stream"
        ? await deleteBunnyStreamVideo(job.target)
        : await deleteBunnyFile(job.target);
    } catch {
      ok = false;
    }

    if (ok) {
      await sql`DELETE FROM storage_deletion_jobs WHERE id = ${job.id}`;
      deleted++;
      continue;
    }

    const attempts = job.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await sql`
        UPDATE storage_deletion_jobs
           SET status = 'dead', attempts = ${attempts},
               last_error = 'max attempts exceeded', locked_at = NULL, updated_at = NOW()
         WHERE id = ${job.id}
      `;
      dead++;
    } else {
      const delay = BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)];
      const next = new Date(Date.now() + delay).toISOString();
      await sql`
        UPDATE storage_deletion_jobs
           SET status = 'pending', attempts = ${attempts}, not_before = ${next},
               locked_at = NULL, updated_at = NOW()
         WHERE id = ${job.id}
      `;
      retried++;
    }
  }

  return { claimed: claimed.length, deleted, retried, dead };
}
