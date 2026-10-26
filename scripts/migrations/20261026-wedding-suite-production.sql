-- Production preflight: additive and idempotent. Never updates existing customer rows.

CREATE TABLE IF NOT EXISTS "wedding_suite_attendees" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"language" text NOT NULL,
	"token_version" text NOT NULL,
	"table_id" text,
	"allowed_companions" integer DEFAULT 0 NOT NULL,
	"attending" text DEFAULT 'pending' NOT NULL,
	"companions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"menu_id" text,
	"note" text DEFAULT '' NOT NULL,
	"notifications" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_suite_guest_email" UNIQUE("album_id","email"),
	CONSTRAINT "wedding_suite_attendees_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "wedding_suite_emails" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"attendee_id" text NOT NULL,
	"kind" text NOT NULL,
	"language" text NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"status" text NOT NULL,
	"provider_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_suite_emails_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "wedding_suite_emails_attendee_id_wedding_suite_attendees_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."wedding_suite_attendees"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "wedding_suite_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL,
	"guest_hash" text NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"message" text NOT NULL,
	"photo_id" text,
	"language" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_suite_entries_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "wedding_suite_entries_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "wedding_suite_settings" (
	"album_id" text PRIMARY KEY NOT NULL,
	"config" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wedding_suite_settings_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "wedding_suite_attendee_album" ON "wedding_suite_attendees" USING btree ("album_id");

CREATE INDEX IF NOT EXISTS "wedding_suite_mail_album" ON "wedding_suite_emails" USING btree ("album_id");

CREATE INDEX IF NOT EXISTS "wedding_suite_entries_album_kind" ON "wedding_suite_entries" USING btree ("album_id","kind");
