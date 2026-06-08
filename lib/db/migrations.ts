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
        owner_email      TEXT,
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
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS owner_email TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'wedding'`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'navy'`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS pending_count INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_image_url TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_domain TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS notify_email TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS film_tier TEXT NOT NULL DEFAULT 'free'`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS card_headline TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS card_subtitle TEXT`;
    await sql`ALTER TABLE albums ADD COLUMN IF NOT EXISTS card_cta TEXT`;

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

    // ── Moments (named sub-galleries) ─────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS moments (
        id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        album_id    TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS moments_album_idx ON moments (album_id)`;

    // Add moment_id to existing photos tables (plain nullable column — no raw FK)
    await sql`ALTER TABLE photos ADD COLUMN IF NOT EXISTS moment_id TEXT`;

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

    // ── Film generations ──────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS film_generations (
        id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        status        TEXT NOT NULL DEFAULT 'queued',
        clips_total   INTEGER NOT NULL DEFAULT 0,
        clips_done    INTEGER NOT NULL DEFAULT 0,
        clips_failed  INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at  TIMESTAMPTZ
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS film_gen_album_idx ON film_generations (album_id)`;

    // Shotstack montage columns (one combined video per generation)
    await sql`ALTER TABLE film_generations ADD COLUMN IF NOT EXISTS shotstack_render_id TEXT`;
    await sql`ALTER TABLE film_generations ADD COLUMN IF NOT EXISTS video_url TEXT`;

    // ── Film clips ────────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS film_clips (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        generation_id   TEXT NOT NULL REFERENCES film_generations(id) ON DELETE CASCADE,
        album_id        TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        photo_id        TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
        photo_url       TEXT NOT NULL,
        fal_request_id  TEXT,
        status          TEXT NOT NULL DEFAULT 'queued',
        video_url       TEXT,
        error_message   TEXT,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at    TIMESTAMPTZ
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS film_clips_gen_idx ON film_clips (generation_id)`;
    await sql`CREATE INDEX IF NOT EXISTS film_clips_fal_idx ON film_clips (fal_request_id)`;

    // ── Upload reminders ──────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS upload_reminders (
        id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        album_id    TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
        email       TEXT NOT NULL,
        send_at     TIMESTAMPTZ NOT NULL,
        sent        BOOLEAN NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS upload_reminders_due_idx ON upload_reminders (sent, send_at)`;

    // ── Bank orders ───────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS bank_orders (
        id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        album_slug       VARCHAR(80) NOT NULL,
        email            TEXT NOT NULL,
        plan_id          TEXT NOT NULL,
        plan_name        TEXT NOT NULL,
        plan_price       INTEGER NOT NULL,
        billing_name     TEXT,
        billing_address  TEXT,
        billing_city     TEXT,
        billing_tax_id   TEXT,
        status           TEXT NOT NULL DEFAULT 'pending',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS bank_orders_slug_idx ON bank_orders (album_slug)`;

    console.log("[migrations] ✓ DB schema up to date");
  } catch (err) {
    console.error("[migrations] Migration error:", err);
  }
}
