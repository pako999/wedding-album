import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Idempotent migrations — safe to run on every cold start.
 * Uses IF NOT EXISTS / IF EXISTS so re-running never fails.
 *
 * IMPORTANT: every statement is executed **independently** via `run()`. A
 * single failing statement (e.g. a transient Neon error, or a column add that
 * conflicts on an older DB) must never abort the whole migration and leave the
 * schema half-applied — that previously caused "column X does not exist"
 * errors when a new/restored database was only partially migrated.
 */
export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[migrations] DATABASE_URL not set — skipping migrations");
    return;
  }

  const sql = neon(url);
  let failures = 0;

  // Run one statement, swallowing (but logging) any error so the next
  // statement still gets a chance to apply.
  const run = async (
    label: string,
    fn: (q: NeonQueryFunction<false, false>) => Promise<unknown>,
  ) => {
    try {
      await fn(sql);
    } catch (err) {
      failures++;
      console.error(`[migrations] step failed (${label}):`, err);
    }
  };

  // ── Albums ────────────────────────────────────────────────────────────────
  await run("create albums", (q) => q`
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
  `);

  // Columns that may be missing in older / restored databases. Each runs on
  // its own so one failure can't block the others.
  await run("albums.owner_email",       (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS owner_email TEXT`);
  await run("albums.event_type",        (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'wedding'`);
  await run("albums.theme",             (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'navy'`);
  await run("albums.pending_count",     (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS pending_count INTEGER NOT NULL DEFAULT 0`);
  await run("albums.cover_image_url",   (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_image_url TEXT`);
  await run("albums.custom_domain",     (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS custom_domain TEXT`);
  await run("albums.notify_email",      (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS notify_email TEXT`);
  await run("albums.stripe_session_id", (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS stripe_session_id TEXT`);
  await run("albums.expires_at",        (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`);
  await run("albums.film_tier",         (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS film_tier TEXT NOT NULL DEFAULT 'free'`);
  await run("albums.card_headline",     (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS card_headline TEXT`);
  await run("albums.card_subtitle",     (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS card_subtitle TEXT`);
  await run("albums.card_cta",          (q) => q`ALTER TABLE albums ADD COLUMN IF NOT EXISTS card_cta TEXT`);

  // ── Photos ────────────────────────────────────────────────────────────────
  await run("create photos", (q) => q`
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
  `);
  await run("photos.cf_stream_video_id", (q) => q`ALTER TABLE photos ADD COLUMN IF NOT EXISTS cf_stream_video_id TEXT`);
  await run("photos.moment_id",          (q) => q`ALTER TABLE photos ADD COLUMN IF NOT EXISTS moment_id TEXT`);

  // ── Moments ───────────────────────────────────────────────────────────────
  await run("create moments", (q) => q`
    CREATE TABLE IF NOT EXISTS moments (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      album_id    TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("moments idx", (q) => q`CREATE INDEX IF NOT EXISTS moments_album_idx ON moments (album_id)`);

  // ── Guests ────────────────────────────────────────────────────────────────
  await run("create guests", (q) => q`
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
  `);

  // ── Likes ─────────────────────────────────────────────────────────────────
  await run("create photo_likes", (q) => q`
    CREATE TABLE IF NOT EXISTS photo_likes (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      photo_id      TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      uploader_name TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT photo_likes_unique UNIQUE (photo_id, uploader_name)
    )
  `);
  await run("photo_likes idx", (q) => q`CREATE INDEX IF NOT EXISTS photo_likes_photo_idx ON photo_likes (photo_id)`);

  // ── Comments ──────────────────────────────────────────────────────────────
  await run("create photo_comments", (q) => q`
    CREATE TABLE IF NOT EXISTS photo_comments (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      photo_id      TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
      album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      uploader_name TEXT NOT NULL,
      body          TEXT NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("photo_comments photo idx", (q) => q`CREATE INDEX IF NOT EXISTS photo_comments_photo_idx ON photo_comments (photo_id)`);
  await run("photo_comments album idx", (q) => q`CREATE INDEX IF NOT EXISTS photo_comments_album_idx ON photo_comments (album_id)`);

  // ── Film generations ──────────────────────────────────────────────────────
  await run("create film_generations", (q) => q`
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
  `);
  await run("film_generations idx",          (q) => q`CREATE INDEX IF NOT EXISTS film_gen_album_idx ON film_generations (album_id)`);
  await run("film_generations.shotstack_id", (q) => q`ALTER TABLE film_generations ADD COLUMN IF NOT EXISTS shotstack_render_id TEXT`);
  await run("film_generations.video_url",    (q) => q`ALTER TABLE film_generations ADD COLUMN IF NOT EXISTS video_url TEXT`);

  // ── Film clips ────────────────────────────────────────────────────────────
  await run("create film_clips", (q) => q`
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
  `);
  await run("film_clips gen idx", (q) => q`CREATE INDEX IF NOT EXISTS film_clips_gen_idx ON film_clips (generation_id)`);
  await run("film_clips fal idx", (q) => q`CREATE INDEX IF NOT EXISTS film_clips_fal_idx ON film_clips (fal_request_id)`);

  // ── Upload reminders ──────────────────────────────────────────────────────
  await run("create upload_reminders", (q) => q`
    CREATE TABLE IF NOT EXISTS upload_reminders (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      album_id    TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      email       TEXT NOT NULL,
      send_at     TIMESTAMPTZ NOT NULL,
      sent        BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("upload_reminders idx", (q) => q`CREATE INDEX IF NOT EXISTS upload_reminders_due_idx ON upload_reminders (sent, send_at)`);

  // ── Bank orders ───────────────────────────────────────────────────────────
  await run("create bank_orders", (q) => q`
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
  `);
  await run("bank_orders idx",          (q) => q`CREATE INDEX IF NOT EXISTS bank_orders_slug_idx ON bank_orders (album_slug)`);
  await run("bank_orders.company_name", (q) => q`ALTER TABLE bank_orders ADD COLUMN IF NOT EXISTS billing_company_name TEXT`);
  await run("bank_orders.email",        (q) => q`ALTER TABLE bank_orders ADD COLUMN IF NOT EXISTS billing_email TEXT`);

  // ── Discount codes ────────────────────────────────────────────────────────
  await run("create discount_codes", (q) => q`
    CREATE TABLE IF NOT EXISTS discount_codes (
      id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      code        VARCHAR(50) NOT NULL UNIQUE,
      percent_off INTEGER NOT NULL,
      max_uses    INTEGER,
      used_count  INTEGER NOT NULL DEFAULT 0,
      expires_at  TIMESTAMPTZ,
      is_active   BOOLEAN NOT NULL DEFAULT true,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("discount_codes idx", (q) => q`CREATE INDEX IF NOT EXISTS discount_codes_code_idx ON discount_codes (code)`);

  // ── Affiliates ────────────────────────────────────────────────────────────
  await run("create affiliates", (q) => q`
    CREATE TABLE IF NOT EXISTS affiliates (
      id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      clerk_user_id            TEXT,
      email                    TEXT NOT NULL UNIQUE,
      name                     TEXT NOT NULL,
      website                  TEXT,
      paypal_email             TEXT,
      bank_iban                TEXT,
      referral_code            VARCHAR(32) NOT NULL UNIQUE,
      commission_rate          INTEGER NOT NULL DEFAULT 20,
      cookie_days              INTEGER NOT NULL DEFAULT 30,
      status                   TEXT NOT NULL DEFAULT 'pending',
      preferred_locale         TEXT NOT NULL DEFAULT 'sl',
      promotion_plan           TEXT,
      notes                    TEXT,
      total_clicks             INTEGER NOT NULL DEFAULT 0,
      total_conversions        INTEGER NOT NULL DEFAULT 0,
      total_earnings_cents     INTEGER NOT NULL DEFAULT 0,
      pending_balance_cents    INTEGER NOT NULL DEFAULT 0,
      available_balance_cents  INTEGER NOT NULL DEFAULT 0,
      approved_at              TIMESTAMPTZ,
      created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("affiliates clerk idx", (q) => q`CREATE INDEX IF NOT EXISTS affiliates_clerk_idx ON affiliates (clerk_user_id)`);
  await run("affiliates code idx", (q) => q`CREATE INDEX IF NOT EXISTS affiliates_code_idx ON affiliates (referral_code)`);
  await run("affiliates status idx", (q) => q`CREATE INDEX IF NOT EXISTS affiliates_status_idx ON affiliates (status)`);

  await run("create affiliate_clicks", (q) => q`
    CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id                           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      affiliate_id                 TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      ip_address                   TEXT,
      user_agent                   TEXT,
      referrer_url                 TEXT,
      landing_page                 TEXT,
      converted_mollie_payment_id  TEXT,
      converted_at                 TIMESTAMPTZ,
      clicked_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("clicks affiliate idx", (q) => q`CREATE INDEX IF NOT EXISTS clicks_affiliate_idx ON affiliate_clicks (affiliate_id)`);
  await run("clicks at idx", (q) => q`CREATE INDEX IF NOT EXISTS clicks_clicked_at_idx ON affiliate_clicks (clicked_at)`);

  await run("create affiliate_commissions", (q) => q`
    CREATE TABLE IF NOT EXISTS affiliate_commissions (
      id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      affiliate_id             TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      mollie_payment_id        TEXT NOT NULL UNIQUE,
      album_slug               TEXT,
      customer_email           TEXT,
      order_description        TEXT,
      order_currency           TEXT NOT NULL DEFAULT 'EUR',
      order_amount_cents       INTEGER NOT NULL,
      commission_rate          INTEGER NOT NULL,
      commission_amount_cents  INTEGER NOT NULL,
      status                   TEXT NOT NULL DEFAULT 'pending',
      lock_until               TIMESTAMPTZ NOT NULL,
      approved_at              TIMESTAMPTZ,
      paid_at                  TIMESTAMPTZ,
      cancelled_at             TIMESTAMPTZ,
      cancel_reason            TEXT,
      email_sent_at            TIMESTAMPTZ,
      created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("commissions affiliate idx", (q) => q`CREATE INDEX IF NOT EXISTS commissions_affiliate_idx ON affiliate_commissions (affiliate_id)`);
  await run("commissions status idx", (q) => q`CREATE INDEX IF NOT EXISTS commissions_status_idx ON affiliate_commissions (status)`);
  await run("commissions lock idx", (q) => q`CREATE INDEX IF NOT EXISTS commissions_lock_idx ON affiliate_commissions (lock_until)`);

  await run("create affiliate_payouts", (q) => q`
    CREATE TABLE IF NOT EXISTS affiliate_payouts (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      affiliate_id  TEXT NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      amount_cents  INTEGER NOT NULL,
      currency      TEXT NOT NULL DEFAULT 'EUR',
      method        TEXT NOT NULL,
      reference     TEXT,
      status        TEXT NOT NULL DEFAULT 'requested',
      notes         TEXT,
      processed_at  TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await run("payouts affiliate idx", (q) => q`CREATE INDEX IF NOT EXISTS payouts_affiliate_idx ON affiliate_payouts (affiliate_id)`);

  if (failures === 0) {
    console.log("[migrations] ✓ DB schema up to date");
  } else {
    console.warn(`[migrations] completed with ${failures} failed step(s) — see logs above`);
  }
}
