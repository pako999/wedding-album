import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { albums, photos } from "@/lib/db/schema";

// Guestcam Local / Rewards is deliberately isolated from the core album tables.
// A delayed migration must never break ordinary Guestcam galleries or Photo Wall.

export const localRewardCampaigns = pgTable(
  "local_reward_campaigns",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    ownerClerkId: text("owner_clerk_id").notNull(),

    venueName: text("venue_name").notNull(),
    campaignName: text("campaign_name").notNull(),
    headline: text("headline"),

    rewardType: text("reward_type", {
      enum: ["percent", "fixed", "free_item", "custom"],
    }).notNull().default("custom"),
    // Percent is stored as an integer (20 = 20%). Fixed amount is stored in cents.
    rewardValue: integer("reward_value"),
    rewardCurrency: varchar("reward_currency", { length: 3 }).notNull().default("EUR"),
    rewardTitle: text("reward_title").notNull(),
    rewardDescription: text("reward_description"),
    rewardTerms: text("reward_terms"),

    // Coupon lifetime after it is issued to the guest.
    validDays: integer("valid_days").notNull().default(30),
    maxCoupons: integer("max_coupons"), // null = unlimited
    issuedCount: integer("issued_count").notNull().default(0),
    redeemedCount: integer("redeemed_count").notNull().default(0),

    // MVP: the base reward is earned by uploading a photo/video.
    requiresUpload: boolean("requires_upload").notNull().default(true),
    // Social sharing is a bonus, never a condition for the base reward.
    socialBonusEnabled: boolean("social_bonus_enabled").notNull().default(false),
    socialBonusText: text("social_bonus_text"),

    isActive: boolean("is_active").notNull().default(true),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("local_campaigns_album_idx").on(t.albumId),
    index("local_campaigns_owner_idx").on(t.ownerClerkId),
    index("local_campaigns_active_idx").on(t.isActive),
  ],
);

// Optional list of products/items the reward applies to. If no rows exist,
// rewardTerms remains the source of truth (e.g. "20% off your next order").
export const localRewardProducts = pgTable(
  "local_reward_products",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => localRewardCampaigns.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("local_reward_products_campaign_idx").on(t.campaignId)],
);

// One campaign can have many physical QR placements: Table 1, terrace, bar,
// entrance, hotel room 203, etc. This lets the venue measure which placement works.
export const localQrSources = pgTable(
  "local_qr_sources",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => localRewardCampaigns.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 32 }).notNull().unique(),
    label: text("label").notNull(),
    tableNumber: text("table_number"),
    isActive: boolean("is_active").notNull().default(true),
    scanCount: integer("scan_count").notNull().default(0),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("local_qr_sources_campaign_idx").on(t.campaignId),
    index("local_qr_sources_code_idx").on(t.code),
  ],
);

// Snapshot the reward copy onto the coupon so a venue can edit the campaign later
// without changing rewards already issued to guests.
export const localCoupons = pgTable(
  "local_coupons",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => localRewardCampaigns.id, { onDelete: "cascade" }),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    sourceId: text("source_id").references(() => localQrSources.id, { onDelete: "set null" }),
    photoId: text("photo_id").references(() => photos.id, { onDelete: "set null" }),

    code: varchar("code", { length: 24 }).notNull().unique(),
    status: text("status", {
      enum: ["issued", "redeemed", "expired", "void"],
    }).notNull().default("issued"),

    guestName: text("guest_name"),
    // Transactional coupon delivery can use email without marketing consent.
    guestEmail: text("guest_email"),
    venueMarketingConsent: boolean("venue_marketing_consent").notNull().default(false),
    consentTimestamp: timestamp("consent_timestamp", { withTimezone: true }),
    consentText: text("consent_text"),
    locale: varchar("locale", { length: 5 }),

    rewardTitle: text("reward_title").notNull(),
    rewardDescription: text("reward_description"),
    rewardTerms: text("reward_terms"),

    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    redeemedBy: text("redeemed_by"),
    redemptionNote: text("redemption_note"),
  },
  (t) => [
    index("local_coupons_campaign_idx").on(t.campaignId),
    index("local_coupons_album_idx").on(t.albumId),
    index("local_coupons_status_idx").on(t.campaignId, t.status),
    index("local_coupons_email_idx").on(t.guestEmail),
    unique("local_coupons_code_unique").on(t.code),
  ],
);

export type LocalRewardCampaign = typeof localRewardCampaigns.$inferSelect;
export type NewLocalRewardCampaign = typeof localRewardCampaigns.$inferInsert;
export type LocalRewardProduct = typeof localRewardProducts.$inferSelect;
export type LocalQrSource = typeof localQrSources.$inferSelect;
export type LocalCoupon = typeof localCoupons.$inferSelect;
