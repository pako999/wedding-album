/**
 * Run once to create all DB tables:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/setup-db.ts
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log("🔌 Connecting to database...");

  await sql`
    CREATE TABLE IF NOT EXISTS albums (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      slug          TEXT NOT NULL UNIQUE,
      owner_clerk_id TEXT NOT NULL,
      couple_name   TEXT NOT NULL DEFAULT '',
      wedding_date  TEXT,
      location      TEXT,
      cover_image_url TEXT,
      password      TEXT,
      is_published  BOOLEAN NOT NULL DEFAULT false,
      plan          TEXT NOT NULL DEFAULT 'free',
      max_photos    INTEGER NOT NULL DEFAULT 50,
      moderation_enabled BOOLEAN NOT NULL DEFAULT false,
      custom_domain TEXT,
      notify_email  TEXT,
      photo_count   INTEGER NOT NULL DEFAULT 0,
      pending_count INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("✅ albums table ready");

  await sql`
    CREATE TYPE IF NOT EXISTS photo_status AS ENUM ('pending','published','rejected')
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      album_id          TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      guest_id          TEXT,
      uploader_name     TEXT NOT NULL DEFAULT 'Gost',
      blob_url          TEXT NOT NULL,
      thumbnail_url     TEXT,
      width             INTEGER,
      height            INTEGER,
      size_bytes        INTEGER,
      mime_type         TEXT,
      original_filename TEXT,
      status            photo_status NOT NULL DEFAULT 'published',
      caption           TEXT,
      sort_order        INTEGER NOT NULL DEFAULT 0,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("✅ photos table ready");

  await sql`
    CREATE TABLE IF NOT EXISTS guests (
      id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      album_id      TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      name          TEXT NOT NULL DEFAULT '',
      email         TEXT,
      phone         TEXT,
      session_token TEXT UNIQUE,
      photo_count   INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("✅ guests table ready");

  // Index for fast album lookups
  await sql`CREATE INDEX IF NOT EXISTS albums_owner_idx ON albums(owner_clerk_id)`;
  await sql`CREATE INDEX IF NOT EXISTS photos_album_idx ON photos(album_id)`;
  await sql`CREATE INDEX IF NOT EXISTS albums_slug_idx  ON albums(slug)`;

  console.log("\n🎉 Database setup complete! All tables created.");
}

main().catch((e) => {
  console.error("❌ Setup failed:", e);
  process.exit(1);
});
