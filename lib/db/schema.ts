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
    /** Default gallery UI language for guests (sl/hr/sr/de/en/es).
     *  Inferred from `location` at creation; guests can still switch via
     *  the in-gallery language picker or a ?lang= override. */
    defaultLang: varchar("default_lang", { length: 5 }).notNull().default("sl"),
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

    // Referral engine (P0). Human-friendly code derived from coupleName,
    // shown to guests on the upload success screen and everywhere else
    // the owner can share the album's referral link.
    referralCode: varchar("referral_code", { length: 20 }).unique(),

    // Photo Wall access token — a separate secret from `slug`. The wall
    // (meant to run all night on a shared venue TV) gets its own link at
    // /wall/<wallToken> so it's never derivable from the main gallery
    // link or vice versa. Lazily backfilled for pre-existing albums by
    // getOrCreateWallToken() in lib/wall-token.ts.
    wallToken: text("wall_token").unique(),

    // Attribution — when THIS album's owner signed up because a guest at
    // some OTHER album clicked the referral link.
    referralSourceAlbumId: text("referral_source_album_id"),
    referralTouchpoint: varchar("referral_touchpoint", { length: 30 }),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("albums_owner_idx").on(t.ownerClerkId),
    index("albums_slug_idx").on(t.slug),
    index("albums_referral_code_idx").on(t.referralCode),
    index("albums_wall_token_idx").on(t.wallToken),
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

// ─── Wall sponsors ───────────────────────────────────────────────────────────

/**
 * Sponsor / partner slides shown on the Photo Wall in between guest
 * photos. Deliberately its own table rather than columns on `albums`:
 * Drizzle selects every column of `albums` on every album query, so a
 * column that exists in code but not yet in the database takes the whole
 * app down (as the wall_token deploy did). A missing TABLE can only
 * break queries that touch it — and every read here is wrapped in a
 * try/catch that degrades to "no sponsors".
 */
export const wallSponsors = pgTable(
  "wall_sponsors",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    /** Public CDN URL of the uploaded sponsor image. */
    imageUrl: text("image_url").notNull(),
    /** Optional label shown under the slide (e.g. the sponsor's name). */
    caption: text("caption"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("wall_sponsors_album_idx").on(t.albumId)]
);

// ─── Per-album feature flags ─────────────────────────────────────────────────

/**
 * Opt-in feature switches, in their own table rather than as columns on
 * `albums`.
 *
 * Drizzle selects every column of `albums` on every album query, so a
 * column that exists in code but not yet in the database takes the whole
 * app down. Keeping flags here means the worst case for a deploy that
 * lands ahead of its migration is "the flag reads as off" — every read
 * goes through lib/album-flags.ts, which swallows the error and returns
 * defaults. Future flags should be added here, not to `albums`.
 */
export const albumFeatureFlags = pgTable("album_feature_flags", {
  albumId: text("album_id")
    .primaryKey()
    .references(() => albums.id, { onDelete: "cascade" }),
  /** Require name + surname + email from guests before they can upload.
   *  Sold as the events/business package — off for ordinary galleries. */
  guestDataCapture: boolean("guest_data_capture").notNull().default(false),
  // ── Event moderation & permissions ─────────────────────────────────
  // Columns on THIS table (not on albums) so a deploy landing before the
  // migration degrades to defaults via lib/album-flags' guarded reads —
  // every read of this table goes through getAlbumFlags, which never
  // throws and falls back to DEFAULTS.
  /** Which media guests may upload. Both on by default. */
  allowPhotos: boolean("allow_photos").notNull().default(true),
  allowVideos: boolean("allow_videos").notNull().default(true),
  /** What guests can do in the digital album:
   *  view_upload (default) | view_only | upload_only. */
  albumPermission: text("album_permission").notNull().default("view_upload"),
  /** Hide the download control from guests. */
  disableDownload: boolean("disable_download").notNull().default(false),
  /** Turn off likes across the album. */
  disableLikes: boolean("disable_likes").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Wall collaborators ──────────────────────────────────────────────────────
// People the owner invites to manage ONLY the Photo Wall (settings +
// sponsors) — a DJ or venue tech, matched by their signed-in e-mail.
// Deliberately wall-scoped: no access to photos, settings or billing.

export const wallCollaborators = pgTable(
  "wall_collaborators",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    /** Lowercased at write time; matched against Clerk VERIFIED e-mails
     *  only, so typing someone else's address grants nothing. */
    email: text("email").notNull(),
    invitedBy: text("invited_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("wall_collaborators_album_idx").on(t.albumId),
    unique("wall_collaborators_album_email").on(t.albumId, t.email),
  ]
);

export type WallCollaborator = typeof wallCollaborators.$inferSelect;

// ─── Album appearance & welcome screen ───────────────────────────────────────
// Branding an event host controls: logo, accent colour, backgrounds and
// the first-visit welcome screen. NEW table, guarded reads via
// lib/album-appearance.ts — a lagging migration means "default look",
// never a broken gallery.

export const albumAppearance = pgTable("album_appearance", {
  albumId: text("album_id")
    .primaryKey()
    .references(() => albums.id, { onDelete: "cascade" }),
  /** Square event logo, shown on the guest album header and the wall. */
  logoUrl: text("logo_url"),
  /** Brand accent (hex) overriding the theme preset's accent on public pages. */
  accentColor: varchar("accent_color", { length: 9 }),
  /** Custom page background image for the guest album. */
  backgroundUrl: text("background_url"),
  // Welcome screen — shown once per guest on first visit.
  welcomeEnabled: boolean("welcome_enabled").notNull().default(false),
  welcomeTitle: text("welcome_title"),
  welcomeText: text("welcome_text"),
  welcomeButton: text("welcome_button"),
  welcomeBgUrl: text("welcome_bg_url"),
  /** One of the curated font pairings: elegant | modern | script | classic. */
  welcomeFont: varchar("welcome_font", { length: 16 }).notNull().default("elegant"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AlbumAppearance = typeof albumAppearance.$inferSelect;

// ─── Event leads ─────────────────────────────────────────────────────────────

/**
 * Guest details captured at upload time when `guestDataCapture` is on.
 *
 * Deliberately NOT merged into `guest_emails`. That table is CamLove's
 * OWN marketing list (the d3/d21 sequence, where CamLove is the data
 * controller). These rows belong to the event organiser — they are the
 * controller, we are the processor, and they export and use the list.
 * Different controller, different purpose, different retention: keeping
 * them apart is what makes each one's GDPR story coherent.
 *
 * `marketingConsent` is the organiser's marketing opt-in and is always
 * optional — GDPR Art. 7(4) requires consent to be freely given, so it
 * can never be a condition of uploading a photo.
 */
export const eventLeads = pgTable(
  "event_leads",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    /** Opt-in for the ORGANISER's marketing. Optional by design. */
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    /** When consent was given — GDPR requires proof of when/what. */
    consentTimestamp: timestamp("consent_timestamp"),
    /** Exact wording the guest agreed to, stored so the organiser can
     *  evidence what was consented to even after the copy changes. */
    consentText: text("consent_text"),
    locale: varchar("locale", { length: 5 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("event_leads_album_idx").on(t.albumId),
    unique("event_leads_album_email_unique").on(t.albumId, t.email),
  ],
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

// ─── Guest email capture (referral engine — P0) ──────────────────────────────
// Emails guests give us via the "email me the album link" flow, with a
// consent flag captured at the same moment (GDPR-compliant). Feeds the
// D3 transactional and D21 soft-pitch email sequences in P1.

export const guestEmails = pgTable(
  "guest_emails",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    consentTimestamp: timestamp("consent_timestamp"),
    locale: varchar("locale", { length: 5 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    /** D3 transactional (photo-count nudge, no consent needed). */
    d3SentAt: timestamp("d3_sent_at"),
    /** D21 soft-pitch with 15% code (marketing — consent required). */
    d21SentAt: timestamp("d21_sent_at"),
    /** Timestamp of guest's unsubscribe click. Also flips consent to false. */
    unsubscribedAt: timestamp("unsubscribed_at"),
    /** Random opaque token used as the unsubscribe link — safer than exposing row id. */
    unsubscribeToken: text("unsubscribe_token").$defaultFn(() => crypto.randomUUID()),
  },
  (t) => [
    index("guest_emails_album_idx").on(t.albumId),
    unique("guest_emails_album_email_unique").on(t.albumId, t.email),
    index("guest_emails_d3_due_idx").on(t.d3SentAt),
    index("guest_emails_d21_due_idx").on(t.d21SentAt),
    unique("guest_emails_unsubscribe_token_unique").on(t.unsubscribeToken),
  ],
);

// ─── Referral conversions (K-factor source of truth) ─────────────────────────
// One row per new user whose signup was attributed to an existing album.
// convertedToPaidAt fills in when they buy — that's when it counts toward K.

export const referralConversions = pgTable(
  "referral_conversions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    /** The event whose guest turned into a new user. */
    sourceAlbumId: text("source_album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    newUserClerkId: text("new_user_clerk_id").notNull(),
    /** Nullable until the new user creates their own album. */
    newAlbumId: text("new_album_id").references(() => albums.id, { onDelete: "set null" }),
    /** Which touchpoint they clicked — upload_success, email_d3, email_d21,
     *  email_footer, gallery_footer, live_display, couple_share. */
    touchpoint: varchar("touchpoint", { length: 30 }),
    /** Set when they hit "paid" for the first time. Drives the K numerator. */
    convertedToPaidAt: timestamp("converted_to_paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("refc_source_idx").on(t.sourceAlbumId),
    index("refc_new_user_idx").on(t.newUserClerkId),
  ],
);

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

// ─── Per-user metadata we can't store in Clerk ───────────────────────────────
// Country is captured from Vercel's x-vercel-ip-country header on album
// creation and dashboard visits. Used by /admin/users to show where
// customers come from (market analysis, support language).

export const userMeta = pgTable("user_meta", {
  clerkId: text("clerk_id").primaryKey(),
  /** ISO-3166 alpha-2 country code from the visitor's IP ("SI", "HR"…). */
  country: varchar("country", { length: 2 }),
  /** How we learned it: "ip" (geo header) — inference from album
   *  location happens at render time and isn't persisted. */
  source: varchar("source", { length: 20 }).notNull().default("ip"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Signup acquisition attribution ─────────────────────────────────────────
// First-touch marketing source per user, captured from the `gc_attr`
// cookie (utm_*, gclid/fbclid, referrer) plus the affiliate/referral
// cookies, at the user's first authenticated request. One row per Clerk
// user (first-touch wins — inserts are onConflictDoNothing). Surfaced in
// /admin/users so we can see which channel brings paying customers.

export const userAttribution = pgTable("user_attribution", {
  clerkId: text("clerk_id").primaryKey(),
  /** Derived acquisition channel — see lib/attribution/signup.ts Channel. */
  channel: varchar("channel", { length: 24 }),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  gclid: text("gclid"),
  fbclid: text("fbclid"),
  /** Affiliate code (gc_ref) present at signup, if any. */
  affiliateRef: text("affiliate_ref"),
  /** Guest-referral code (gc_gref) present at signup, if any. */
  referralCode: text("referral_code"),
  referrerUrl: text("referrer_url"),
  landingPage: text("landing_page"),
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

// ─── Card-payment billing (for invoicing) ────────────────────────────────────
// Mollie's hosted checkout does NOT collect a billing address, so we gather
// it in our own checkout form and persist it here at payment-creation time
// (keyed by the Mollie payment id). Admin/payments joins on this to show the
// full invoice data, and the paid-webhook Telegram/email include it too.

export const cardBilling = pgTable(
  "card_billing",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    molliePaymentId: text("mollie_payment_id").notNull().unique(),
    albumSlug: varchar("album_slug", { length: 80 }).notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    postalCode: text("postal_code"),
    city: text("city"),
    companyName: text("company_name"),
    taxId: text("tax_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("card_billing_payment_idx").on(t.molliePaymentId)]
);

export type BankOrder = typeof bankOrders.$inferSelect;
export type NewBankOrder = typeof bankOrders.$inferInsert;

// ─── Printed-stand orders (the physical fulfilment record) ───────────────────
// Until now the only complete record of a stands order was the Mollie
// payment metadata (card) or a Telegram message (invoice) — neither of
// which is queryable, and neither of which holds a full delivery address.
// Nobody could answer "what do I need to print and post this week?".
//
// A NEW TABLE on purpose, not columns on bank_orders / card_billing.
// Drizzle SELECTs every column it knows about, so adding a column to a
// table that existing queries already read means a deploy landing before
// its migration breaks those queries outright — exactly what took the
// dashboard down when albums.wall_token was added. A brand-new table can
// only break reads of itself, and those are guarded (see lib/stand-orders).

export const standOrders = pgTable(
  "stand_orders",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumSlug: varchar("album_slug", { length: 80 }).notNull(),
    /** "card" = Mollie, "invoice" = bank transfer. */
    source: text("source", { enum: ["card", "invoice"] }).notNull(),
    /** Mollie payment id, or the bank_orders row id. Ties this parcel back
     *  to the money so fulfilment can confirm payment before printing. */
    orderRef: text("order_ref"),

    planId: text("plan_id"),
    planName: text("plan_name"),
    planCents: integer("plan_cents"),

    /** "wood" | "gold" — what to pull off the shelf. */
    variant: text("variant").notNull(),
    qty: integer("qty").notNull(),
    /** Goods and postage kept apart: an invoice has to show them separately,
     *  and the volume discount applies to the goods only. */
    standsCents: integer("stands_cents").notNull(),
    shipCents: integer("ship_cents").notNull(),
    shipCarrier: text("ship_carrier"),
    shipCountry: varchar("ship_country", { length: 2 }),
    /** Outside the EU customs union — needs a commercial invoice. */
    shipCustoms: boolean("ship_customs").notNull().default(false),
    totalCents: integer("total_cents").notNull(),

    // Delivery details. Held here rather than looked up through billing
    // because a parcel needs a name, a phone (couriers demand one) and a
    // postcode, and the invoice path never collected the last two.
    recipientName: text("recipient_name"),
    recipientPhone: text("recipient_phone"),
    recipientEmail: text("recipient_email"),
    address: text("address"),
    postalCode: text("postal_code"),
    city: text("city"),
    companyName: text("company_name"),
    taxId: text("tax_id"),

    status: text("status", {
      enum: ["pending", "paid", "printing", "shipped", "cancelled"],
    }).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("stand_orders_slug_idx").on(t.albumSlug),
    index("stand_orders_status_idx").on(t.status),
  ]
);

export type StandOrder = typeof standOrders.$inferSelect;
export type NewStandOrder = typeof standOrders.$inferInsert;

// ─── Affiliates ──────────────────────────────────────────────────────────────
// Partner program: bloggers, agencies, customers refer CamLove and earn
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
    // Unique code that goes in their link: camlove.me/?ref=YOURCODE
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
