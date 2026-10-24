import { pgTable, text, integer, boolean, jsonb, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { albums, photos } from '@/lib/db/schema';
import type { SuiteConfig, SuiteLang, EntryKind } from './contracts';
export const suiteSettings = pgTable('wedding_suite_settings', {
  albumId: text('album_id').primaryKey().references(() => albums.id, { onDelete: 'cascade' }),
  config: jsonb('config').$type<SuiteConfig>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const suiteAttendees = pgTable('wedding_suite_attendees', {
  id: text('id').primaryKey(), albumId: text('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), email: text('email').notNull(), language: text('language').$type<SuiteLang>().notNull(),
  tokenVersion: text('token_version').notNull(), tableId: text('table_id'), allowedCompanions: integer('allowed_companions').notNull().default(0),
  attending: text('attending').$type<'yes' | 'no' | 'maybe' | 'pending'>().notNull().default('pending'),
  companions: jsonb('companions').$type<string[]>().notNull().default([]), menuId: text('menu_id'), note: text('note').notNull().default(''),
  notifications: boolean('notifications').notNull().default(true), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [unique('wedding_suite_guest_email').on(t.albumId, t.email), index('wedding_suite_attendee_album').on(t.albumId)]);
export const suiteEntries = pgTable('wedding_suite_entries', {
  id: text('id').primaryKey(), albumId: text('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  guestHash: text('guest_hash').notNull(), kind: text('kind').$type<EntryKind>().notNull(),
  name: text('name').notNull(), message: text('message').notNull(), photoId: text('photo_id').references(() => photos.id, { onDelete: 'set null' }),
  language: text('language').$type<SuiteLang>().notNull(), approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('wedding_suite_entries_album_kind').on(t.albumId, t.kind)]);
export const suiteEmails = pgTable('wedding_suite_emails', {
  id: text('id').primaryKey(), albumId: text('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  attendeeId: text('attendee_id').notNull().references(() => suiteAttendees.id, { onDelete: 'cascade' }),
  kind: text('kind').$type<'invitation' | 'rsvp' | 'thanks' | 'capsule'>().notNull(), language: text('language').$type<SuiteLang>().notNull(),
  recipient: text('recipient').notNull(), subject: text('subject').notNull(), html: text('html').notNull(),
  status: text('status').$type<'preview' | 'sending' | 'sent' | 'failed'>().notNull(), providerId: text('provider_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('wedding_suite_mail_album').on(t.albumId)]);
