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

// ─── Albums ──────────────────────────────────────────────────────────────────

export const albums = pgTable(
  "albums",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 80 }).notNull().unique(),

    // Owner — Clerk userId from this app's Clerk instance
    ownerClerkId: text("owner_clerk_id").notNull(),
    // Owner email — used to match albums created by WedFlow integration
    ownerEmail: text("owner_email"),

    // Event type
    eventType: text("event_type").notNull().default("wedding"), // wedding | birthday | anniversary | party | baptism | graduation | other

    // Visual theme — owner-chosen preset for the guest album page (see lib/album-themes.ts)
    theme: text("theme").notNull().default("navy"),

    // Names and display
    coupleName: text("couple_name").notNull(), // "Ana & Marko" or event title
    weddingDate: text("wedding_date").notNull(), // ISO date string "2025-06-14"
    location: text("location"),
    coverImageUrl: text("cover_image_url"),

    // Access control
    password: text("password"), // null = no password
    isPublished: boolean("is_published").notNull().default(false),

    // Plan
    plan: text("plan", { enum: ["free", "basic", "plus", "premium"] }).notNull().default("free"),

    // Film generation tier (separate add-on from album plan)
    filmTier: text("film_tier", { enum: ["free", "pro", "premium"] }).notNull().default("free"),

    // Payment reference — holds the Paddle transaction id (txn_…) for new
    // purchases, plus historical Stripe sessions (cs_…) and admin sentinels
    // (comp:… / manual_…). Column name kept for migration stability.
    stripeSessionId: text("stripe_session_id"),

    // Limits
    maxPhotos: integer("max_photos").notNull().default(20),

    // Expiry — set at creation (free) or on plan activation (paid)
    // null = never expires; cron job deletes photos once this date passes
    expiresAt: timestamp("expires_at"),

    // Moderation: if true, photos need approval before appearing
    moderationEnabled: boolean("moderation_enabled").notNull().default(false),

    // Custom domain (premium)
    customDomain: text("custom_domain"),

    // Notification email
    notifyEmail: text("notify_email"),

    // Custom print-card text (Premium only) — null = use template default
    cardHeadline: text("card_headline"),
    cardSubtitle: text("card_subtitle"),
    cardCta: text("card_cta"),

    // Stats cache
    photoCount: integer("photo_count").notNull().default(0),
    pendingCount: integer("pending_count").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("albums_owner_idx").on(t.ownerClerkId),
    index("albums_slug_idx").on(t.slug),
  ]
);

// ─── Moments ─────────────────────────────────────────────────────────────────

export const moments = pgTable(
  "moments",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("moments_album_idx").on(t.albumId)]
);

// ─── Photos ──────────────────────────────────────────────────────────────────

export const photos = pgTable(
  "photos",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),

    // Sub-gallery / moment this photo belongs to (nullable)
    momentId: text("moment_id").references(() => moments.id, { onDelete: "set null" }),

    // Uploader info (optional, from guest table or anonymous)
    guestId: text("guest_id"),
    uploaderName: text("uploader_name"), // display name they entered

    // Blob storage (R2 or Vercel Blob)
    blobUrl: text("blob_url").notNull(),
    thumbnailUrl: text("thumbnail_url"), // generated small version or CF Stream thumbnail
    blurHash: text("blur_hash"), // for placeholder

    // Cloudflare Stream video ID (set for videos uploaded via Stream)
    cfStreamVideoId: text("cf_stream_video_id"),

    // Metadata
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes"),
    mimeType: text("mime_type"),
    originalFilename: text("original_filename"),

    // Moderation
    status: text("status", { enum: ["pending", "published", "rejected"] })
      .notNull()
      .default("published"), // default published unless album has moderation on

    // Caption set by guest or owner
    caption: text("caption"),

    // Sort
    sortOrder: integer("sort_order").notNull().default(0),

    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (t) => [
    index("photos_album_idx").on(t.albumId),
    index("photos_status_idx").on(t.albumId, t.status),
  ]
);

// ─── Guests ──────────────────────────────────────────────────────────────────

export const guests = pgTable(
  "guests",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),

    // Session token for upload auth (no Clerk required)
    sessionToken: text("session_token").unique(),

    // Stats
    photoCount: integer("photo_count").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("guests_album_idx").on(t.albumId)]
);

// ─── Film Generations ────────────────────────────────────────────────────────

export const filmGenerations = pgTable(
  "film_generations",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["queued", "processing", "complete", "failed"] })
      .notNull()
      .default("queued"),
    clipsTotal:  integer("clips_total").notNull().default(0),
    clipsDone:   integer("clips_done").notNull().default(0),
    clipsFailed: integer("clips_failed").notNull().default(0),
    // Shotstack montage render — one render per generation
    shotstackRenderId: text("shotstack_render_id"),
    videoUrl:          text("video_url"),
    createdAt:   timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [index("film_gen_album_idx").on(t.albumId)]
);

// ─── Film Clips ───────────────────────────────────────────────────────────────

export const filmClips = pgTable(
  "film_clips",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    generationId: text("generation_id")
      .notNull()
      .references(() => filmGenerations.id, { onDelete: "cascade" }),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    photoUrl:     text("photo_url").notNull(),
    falRequestId: text("fal_request_id"),
    status: text("status", { enum: ["queued", "processing", "done", "failed"] })
      .notNull()
      .default("queued"),
    videoUrl:     text("video_url"),
    errorMessage: text("error_message"),
    sortOrder:    integer("sort_order").notNull().default(0),
    createdAt:    timestamp("created_at").notNull().defaultNow(),
    completedAt:  timestamp("completed_at"),
  },
  (t) => [
    index("film_clips_gen_idx").on(t.generationId),
    index("film_clips_fal_idx").on(t.falRequestId),
  ]
);

// ─── Photo Likes ─────────────────────────────────────────────────────────────

export const photoLikes = pgTable(
  "photo_likes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    uploaderName: text("uploader_name").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("photo_likes_photo_idx").on(t.photoId),
    unique("photo_likes_unique").on(t.photoId, t.uploaderName),
  ]
);

// ─── Photo Comments ──────────────────────────────────────────────────────────

export const photoComments = pgTable(
  "photo_comments",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    uploaderName: text("uploader_name").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("photo_comments_photo_idx").on(t.photoId),
    index("photo_comments_album_idx").on(t.albumId),
  ]
);

// ─── Discount Codes ───────────────────────────────────────────────────────────

export const discountCodes = pgTable(
  "discount_codes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: varchar("code", { length: 50 }).notNull().unique(),
    percentOff: integer("percent_off").notNull(), // 1–100
    maxUses: integer("max_uses"),                 // null = unlimited
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: timestamp("expires_at"),           // null = never
    isActive: boolean("is_active").notNull().default(true),
    // If this code belongs to an affiliate partner, link to their row.
    // When the code is redeemed at checkout we also credit a commission
    // to that affiliate (no cookie needed).
    affiliateId: text("affiliate_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("discount_codes_code_idx").on(t.code)]
);

export type DiscountCode    = typeof discountCodes.$inferSelect;
export type NewDiscountCode = typeof discountCodes.$inferInsert;

// ─── Upload Reminders ────────────────────────────────────────────────────────

export const uploadReminders = pgTable(
  "upload_reminders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    sendAt: timestamp("send_at").notNull(),
    sent: boolean("sent").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("upload_reminders_due_idx").on(t.sent, t.sendAt)]
);

// ─── User plan overrides ─────────────────────────────────────────────────────
// Lets admin "upgrade" a user who has not created an album yet. The override
// is consumed (and deleted) the first time that user creates a gallery, so
// their freshly-created album lands on the chosen plan immediately. Admin
// can also write here for users who already have albums — every NEW gallery
// after the override would still inherit it on top of the existing
// inherit-from-paid-album logic.

export const userPlanOverrides = pgTable("user_plan_overrides", {
  clerkId: text("clerk_id").primaryKey(),
  plan: text("plan", { enum: ["free", "basic", "plus", "premium"] }).notNull(),
  maxPhotos: integer("max_photos").notNull(),
  filmTier: text("film_tier", { enum: ["free", "pro", "premium"] }).notNull().default("free"),
  daysAccess: integer("days_access"), // null = never expires
  /** "comp:influencer" / "comp:sponsor" stamped on the next album so the
   *  comp flag survives. null for real admin upgrades. */
  compTag: text("comp_tag"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Onboarding nudges ───────────────────────────────────────────────────────
// One row per Clerk user that has received the "you signed up but never
// created a gallery" reminder. We never want to spam — one PK on clerkId
// guarantees a single send per user.

export const onboardingReminders = pgTable("onboarding_reminders", {
  clerkId: text("clerk_id").primaryKey(),
  email: text("email").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

// ─── Bank Orders ─────────────────────────────────────────────────────────────

export const bankOrders = pgTable(
  "bank_orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumSlug: varchar("album_slug", { length: 80 }).notNull(),
    email: text("email").notNull(),
    planId: text("plan_id").notNull(),
    planName: text("plan_name").notNull(),
    planPrice: integer("plan_price").notNull(),
    billingName: text("billing_name"),
    billingCompanyName: text("billing_company_name"),
    billingEmail: text("billing_email"),
    billingAddress: text("billing_address"),
    billingCity: text("billing_city"),
    billingTaxId: text("billing_tax_id"),
    // pending = waiting for payment, paid = payment confirmed, cancelled = abandoned
    status: text("status", { enum: ["pending", "paid", "cancelled"] }).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("bank_orders_slug_idx").on(t.albumSlug)]
);

export type BankOrder = typeof bankOrders.$inferSelect;
export type NewBankOrder = typeof bankOrders.$inferInsert;

// ─── Affiliates ──────────────────────────────────────────────────────────────
// Partner program: bloggers, agencies, customers refer GuestCam and earn
// a commission (default 20%) on each paid order. All monetary fields use
// integer cents (€49 = 4900) to match the rest of the codebase and avoid
// floating-point drift.

export const affiliates = pgTable(
  "affiliates",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    // Set if the affiliate is also a Clerk user; nullable for external partners.
    clerkUserId: text("clerk_user_id"),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    website: text("website"),
    paypalEmail: text("paypal_email"),
    bankIban: text("bank_iban"),
    // Unique code that goes in their link: guestcam.si/?ref=YOURCODE
    referralCode: varchar("referral_code", { length: 32 }).notNull().unique(),
    // Percent (1–100). 20 = 20% of order value.
    commissionRate: integer("commission_rate").notNull().default(20),
    cookieDays: integer("cookie_days").notNull().default(60),
    status: text("status", {
      enum: ["pending", "active", "suspended", "rejected"],
    }).notNull().default("pending"),
    // Locale for outgoing affiliate emails.
    preferredLocale: text("preferred_locale", {
      enum: ["sl", "hr", "sr", "en", "de", "es"],
    }).notNull().default("sl"),
    // Free-form text from the affiliate's application explaining promotion plan.
    promotionPlan: text("promotion_plan"),
    notes: text("notes"),
    // Optional social media profile URLs collected at application time.
    instagramUrl: text("instagram_url"),
    facebookUrl: text("facebook_url"),
    xUrl: text("x_url"),
    tiktokUrl: text("tiktok_url"),
    // Stats cache — updated whenever a commission is created / approved / cancelled.
    totalClicks: integer("total_clicks").notNull().default(0),
    totalConversions: integer("total_conversions").notNull().default(0),
    // Money is stored as integer cents.
    totalEarningsCents: integer("total_earnings_cents").notNull().default(0),
    pendingBalanceCents: integer("pending_balance_cents").notNull().default(0),
    availableBalanceCents: integer("available_balance_cents").notNull().default(0),
    approvedAt: timestamp("approved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("affiliates_clerk_idx").on(t.clerkUserId),
    index("affiliates_code_idx").on(t.referralCode),
    index("affiliates_status_idx").on(t.status),
  ],
);

export const affiliateClicks = pgTable(
  "affiliate_clicks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    affiliateId: text("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    referrerUrl: text("referrer_url"),
    landingPage: text("landing_page"),
    // Set when this click leads to a paid order.
    convertedMolliePaymentId: text("converted_mollie_payment_id"),
    convertedAt: timestamp("converted_at"),
    clickedAt: timestamp("clicked_at").notNull().defaultNow(),
  },
  (t) => [
    index("clicks_affiliate_idx").on(t.affiliateId),
    index("clicks_clicked_at_idx").on(t.clickedAt),
  ],
);

export const affiliateCommissions = pgTable(
  "affiliate_commissions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    affiliateId: text("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    // Mollie payment id (tr_xxxx). Unique guard against double-crediting.
    molliePaymentId: text("mollie_payment_id").notNull().unique(),
    albumSlug: text("album_slug"),
    customerEmail: text("customer_email"),
    orderDescription: text("order_description"),
    orderCurrency: text("order_currency").notNull().default("EUR"),
    // Money in cents.
    orderAmountCents: integer("order_amount_cents").notNull(),
    commissionRate: integer("commission_rate").notNull(),
    commissionAmountCents: integer("commission_amount_cents").notNull(),
    status: text("status", {
      enum: ["pending", "approved", "paid", "cancelled"],
    }).notNull().default("pending"),
    // Lock period: commission becomes "approved" after lockUntil passes,
    // so refunds within the window cancel the commission cleanly.
    lockUntil: timestamp("lock_until").notNull(),
    approvedAt: timestamp("approved_at"),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancelReason: text("cancel_reason"),
    emailSentAt: timestamp("email_sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("commissions_affiliate_idx").on(t.affiliateId),
    index("commissions_status_idx").on(t.status),
    index("commissions_lock_idx").on(t.lockUntil),
  ],
);

export const affiliatePayouts = pgTable(
  "affiliate_payouts",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    affiliateId: text("affiliate_id")
      .notNull()
      .references(() => affiliates.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    method: text("method", { enum: ["paypal", "bank_transfer"] }).notNull(),
    reference: text("reference"),
    status: text("status", {
      enum: ["requested", "processing", "paid", "failed"],
    }).notNull().default("requested"),
    notes: text("notes"),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("payouts_affiliate_idx").on(t.affiliateId)],
);

export type Affiliate           = typeof affiliates.$inferSelect;
export type NewAffiliate        = typeof affiliates.$inferInsert;
export type AffiliateClick      = typeof affiliateClicks.$inferSelect;
export type AffiliateCommission = typeof affiliateCommissions.$inferSelect;
export type AffiliatePayout     = typeof affiliatePayouts.$inferSelect;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Moment = typeof moments.$inferSelect;
export type NewMoment = typeof moments.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type PhotoLike    = typeof photoLikes.$inferSelect;
export type PhotoComment = typeof photoComments.$inferSelect;
export type FilmGeneration = typeof filmGenerations.$inferSelect;
export type FilmClip       = typeof filmClips.$inferSelect;
export type UploadReminder    = typeof uploadReminders.$inferSelect;
export type NewUploadReminder = typeof uploadReminders.$inferInsert;
