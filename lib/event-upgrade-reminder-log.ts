import { neon } from "@neondatabase/serverless";

function client() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not configured");
  return neon(url);
}

async function ensureTable() {
  const sql = client();
  await sql`
    CREATE TABLE IF NOT EXISTS event_upgrade_reminders (
      album_id   TEXT PRIMARY KEY REFERENCES albums(id) ON DELETE CASCADE,
      email      TEXT NOT NULL,
      claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sent_at    TIMESTAMPTZ
    )
  `;
}

/**
 * Atomically claim the one reminder allowed for this album.
 * Returns false if another run already claimed/sent it.
 */
export async function claimEventUpgradeReminder(albumId: string, email: string): Promise<boolean> {
  await ensureTable();
  const sql = client();
  // A function interruption between claim and send must not block the
  // customer forever. The next run may reclaim an unfinished hour-old row.
  await sql`
    DELETE FROM event_upgrade_reminders
    WHERE sent_at IS NULL
      AND claimed_at < NOW() - INTERVAL '1 hour'
  `;
  const rows = await sql`
    INSERT INTO event_upgrade_reminders (album_id, email)
    SELECT ${albumId}, ${email}
    WHERE NOT EXISTS (
      SELECT 1
      FROM event_upgrade_reminders
      WHERE LOWER(email) = LOWER(${email})
    )
    ON CONFLICT (album_id) DO NOTHING
    RETURNING album_id
  `;
  return rows.length > 0;
}

export async function markEventUpgradeReminderSent(albumId: string): Promise<void> {
  const sql = client();
  await sql`
    UPDATE event_upgrade_reminders
    SET sent_at = NOW()
    WHERE album_id = ${albumId}
  `;
}

/** Release a failed claim so the next daily run can retry. */
export async function releaseEventUpgradeReminder(albumId: string): Promise<void> {
  const sql = client();
  await sql`
    DELETE FROM event_upgrade_reminders
    WHERE album_id = ${albumId} AND sent_at IS NULL
  `;
}
