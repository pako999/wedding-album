import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// ─── Albums ──────────────────────────────────────────────────────────────────

export const albums = pgTable(
  "albums",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 80 }).notNull().unique(),

    // Owner (Clerk userId from WedFlow)
    ownerClerkId: text("owner_clerk_id").notNull(),

    // Event type
    eventType: text("event_type").notNull().default("wedding"), // wedding | birthday | anniversary | party | baptism | graduation | other

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

    // Stripe
    stripeSessionId: text("stripe_session_id"),

    // Limits
    maxPhotos: integer("max_photos").notNull().default(50),

    // Moderation: if true, photos need approval before appearing
    moderationEnabled: boolean("moderation_enabled").notNull().default(false),

    // Custom domain (premium)
    customDomain: text("custom_domain"),

    // Notification email
    notifyEmail: text("notify_email"),

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

// ─── Photos ──────────────────────────────────────────────────────────────────

export const photos = pgTable(
  "photos",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    albumId: text("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),

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

// ─── Types ───────────────────────────────────────────────────────────────────

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
