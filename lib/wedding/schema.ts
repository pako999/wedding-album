import { pgTable, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { albums, photos } from '@/lib/db/schema';
import type { WeddingRow, SongStatus } from './contracts';
// Isolated tables: never add wedding columns to core albums/photos.
export const weddingSettings = pgTable('wedding_settings', {
  albumId: text('album_id').primaryKey().references(() => albums.id, {onDelete: 'cascade'}),
  enabled: boolean('enabled').notNull().default(false),
  requestsOpen: boolean('requests_open').notNull().default(true),
  schedule: jsonb('schedule').$type<WeddingRow[]>().notNull().default([]),
  menu: jsonb('menu').$type<WeddingRow[]>().notNull().default([]),
  challenges: jsonb('challenges').$type<WeddingRow[]>().notNull().default([]),
  djTokenHash: text('dj_token_hash'),
  updatedAt: timestamp('updated_at', {withTimezone: true}).notNull().defaultNow(),
});
export const weddingSongRequests = pgTable('wedding_song_requests', {
  id: text('id').primaryKey(),
  albumId: text('album_id').notNull().references(() => albums.id, {onDelete: 'cascade'}),
  guestTokenHash: text('guest_token_hash').notNull(),
  title: text('title').notNull(), artist: text('artist').notNull().default(''),
  requestedBy: text('requested_by').notNull(), note: text('note').notNull().default(''),
  status: text('status').$type<SongStatus>().notNull().default('new'),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
}, t => [index('wedding_songs_album_created_idx').on(t.albumId, t.createdAt), index('wedding_songs_guest_idx').on(t.albumId, t.guestTokenHash)]);
export const weddingBingoSubmissions = pgTable('wedding_bingo_submissions', {
  id: text('id').primaryKey(),
  albumId: text('album_id').notNull().references(() => albums.id, {onDelete: 'cascade'}),
  challengeId: text('challenge_id').notNull(),
  photoId: text('photo_id').notNull().unique().references(() => photos.id, {onDelete: 'cascade'}),
  guestTokenHash: text('guest_token_hash').notNull(),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
}, t => [index('wedding_bingo_album_challenge_idx').on(t.albumId, t.challengeId), index('wedding_bingo_guest_idx').on(t.albumId, t.guestTokenHash)]);
