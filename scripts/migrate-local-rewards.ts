/**
 * Guestcam Local / Rewards migration.
 *
 * Run manually against the intended Neon database:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/migrate-local-rewards.ts
 *
 * This is intentionally separate from the core Guestcam setup. Every object is
 * created with IF NOT EXISTS so deploying Local/Rewards code cannot damage or
 * block ordinary albums if this migration has not been run yet.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log("🔌 Migrating Guestcam Local / Rewards...");

  await sql`
    CREATE TABLE IF NOT EXISTS local_reward_campaigns (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      owner_clerk_id TEXT NOT NULL,
      venue_name TEXT NOT NULL,
      campaign_name TEXT NOT NULL,
      headline TEXT,
      reward_type TEXT NOT NULL DEFAULT 'custom',
      reward_value INTEGER,
      reward_currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
      reward_title TEXT NOT NULL,
      reward_description TEXT,
      reward_terms TEXT,
      valid_days INTEGER NOT NULL DEFAULT 30,
      max_coupons INTEGER,
      issued_count INTEGER NOT NULL DEFAULT 0,
      redeemed_count INTEGER NOT NULL DEFAULT 0,
      requires_upload BOOLEAN NOT NULL DEFAULT TRUE,
      social_bonus_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      social_bonus_text TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      starts_at TIMESTAMPTZ,
      ends_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT local_reward_campaign_type_check
        CHECK (reward_type IN ('percent','fixed','free_item','custom')),
      CONSTRAINT local_reward_campaign_value_check
        CHECK (reward_value IS NULL OR reward_value >= 0),
      CONSTRAINT local_reward_campaign_valid_days_check
        CHECK (valid_days >= 0),
      CONSTRAINT local_reward_campaign_max_coupons_check
        CHECK (max_coupons IS NULL OR max_coupons > 0)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS local_reward_products (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      campaign_id TEXT NOT NULL REFERENCES local_reward_campaigns(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sku TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS local_qr_sources (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      campaign_id TEXT NOT NULL REFERENCES local_reward_campaigns(id) ON DELETE CASCADE,
      code VARCHAR(32) NOT NULL UNIQUE,
      label TEXT NOT NULL,
      table_number TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      scan_count INTEGER NOT NULL DEFAULT 0,
      last_scanned_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS local_coupons (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      campaign_id TEXT NOT NULL REFERENCES local_reward_campaigns(id) ON DELETE CASCADE,
      album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
      source_id TEXT REFERENCES local_qr_sources(id) ON DELETE SET NULL,
      photo_id TEXT REFERENCES photos(id) ON DELETE SET NULL,
      claim_token VARCHAR(80) NOT NULL UNIQUE,
      code VARCHAR(24) NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'issued',
      guest_name TEXT,
      guest_email TEXT,
      venue_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
      consent_timestamp TIMESTAMPTZ,
      consent_text TEXT,
      locale VARCHAR(5),
      reward_title TEXT NOT NULL,
      reward_description TEXT,
      reward_terms TEXT,
      issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ,
      redeemed_at TIMESTAMPTZ,
      redeemed_by TEXT,
      redemption_note TEXT,
      CONSTRAINT local_coupon_status_check
        CHECK (status IN ('issued','redeemed','expired','void'))
    )
  `;

  // Safe forward-compatible additions in case an early Local preview migration
  // was ever run before the claim-token columns existed.
  await sql`ALTER TABLE local_coupons ADD COLUMN IF NOT EXISTS claim_token VARCHAR(80)`;
  await sql`UPDATE local_coupons SET claim_token = gen_random_uuid()::text WHERE claim_token IS NULL`;
  await sql`ALTER TABLE local_coupons ALTER COLUMN claim_token SET NOT NULL`;

  await sql`CREATE INDEX IF NOT EXISTS local_campaigns_album_idx ON local_reward_campaigns(album_id)`;
  await sql`CREATE INDEX IF NOT EXISTS local_campaigns_owner_idx ON local_reward_campaigns(owner_clerk_id)`;
  await sql`CREATE INDEX IF NOT EXISTS local_campaigns_active_idx ON local_reward_campaigns(is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS local_reward_products_campaign_idx ON local_reward_products(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS local_qr_sources_campaign_idx ON local_qr_sources(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS local_qr_sources_code_idx ON local_qr_sources(code)`;
  await sql`CREATE INDEX IF NOT EXISTS local_coupons_campaign_idx ON local_coupons(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS local_coupons_album_idx ON local_coupons(album_id)`;
  await sql`CREATE INDEX IF NOT EXISTS local_coupons_status_idx ON local_coupons(campaign_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS local_coupons_email_idx ON local_coupons(guest_email)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS local_coupons_claim_unique ON local_coupons(claim_token)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS local_coupons_photo_unique ON local_coupons(photo_id) WHERE photo_id IS NOT NULL`;

  console.log("✅ Guestcam Local / Rewards tables ready");
}

main().catch((error) => {
  console.error("❌ Local/Rewards migration failed", error);
  process.exit(1);
});
