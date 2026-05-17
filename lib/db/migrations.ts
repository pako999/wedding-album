import { neon } from "@neondatabase/serverless";

/**
 * Idempotent migrations — safe to run on every cold start.
 * Uses IF NOT EXISTS / IF EXISTS so re-running never fails.
 */
export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[migrations] DATABASE_URL not set — skipping migrations");
    return;
  }

  try {
    const sql = neon(url);

    // Create albums table if it doesn't exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS albums (
        id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        slug             VARCHAR(80) NOT NULL UNIQUE,
        owner_clerk_id   TEXT NOT NULL,
        event_type       TEXT NOT NULL DEFAULT 'wedding',
        couple_name      TEXT NOT NULL,
        wedding_date     TEXT NOT NULL,
        location         TEXT,
        cover_image_url  TEXT,
        password         TEXT,
        is_published     BOOLEAN NOT NULL DEFAULT false,
        plan             TEXT NOT NULL DEFAULT 'free',
        max_photos       INTEGER NOT NULL DEFAULT 50,
        moderation_enabled BOOLEAN NOT NULL DEFAULT false,
        custom_domain    TEXT,
        notify_email     TEXT,
        photo_count      INTEGER NOT NULL DEFAULT 0,
        pending_count    INTEGER NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Add columns that may be missing in older deployments
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'wedding'`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS pending_count INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_image_url TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_domain TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS notify_email TEXT`;

    // Create photos table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        album_id            TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        guest_id            TEXT,
        uploader_name       TEXT,
        blob_url            TEXT NOT NULL,
        thumbnail_url       TEXT,
        blur_hash           TEXT,
        cf_stream_video_id  TEXT,
        width               INTEGER,
        height              INTEGER,
        size_bytes          INTEGER,
        mime_type           TEXT,
        original_filename   TEXT,
        status              TEXT NOT NULL DEFAULT 'published',
        caption             TEXT,
        sort_order          INTEGER NOT NULL DEFAULT 0,
        uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // Add cf_stream_video_id to existing photos tables
    await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS cf_stream_video_id TEXT`;

    // Create guests table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS guests (
        id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        name          TEXT NOT NULL,
        email         TEXT,
        phone         TEXT,
        session_token TEXT UNIQUE,
        photo_count   INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // ── Likes ─────────────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS photo_likes (
        id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        photo_id      TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        uploader_name TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT photo_likes_unique UNIQUE (photo_id, uploader_name)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS photo_likes_photo_idx ON photo_likes (photo_id)`;

    // ── Comments ──────────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS photo_comments (
        id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        photo_id      TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        uploader_name TEXT NOT NULL,
        body          TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS photo_comments_photo_idx ON photo_comments (photo_id)`;
    await sql`CREATE INDEX IF NOT EXISTS photo_comments_album_idx ON photo_comments (album_id)`;

    console.log("[migrations] ✓ DB schema up to date");
  } catch (err) {
    console.error("[migrations] Migration error:", err);
  }
}
