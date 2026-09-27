-- Additive only. No changes to albums, photos, payments or existing plan IDs.
CREATE TABLE IF NOT EXISTS wedding_settings (
 album_id text PRIMARY KEY REFERENCES albums(id) ON DELETE CASCADE,
 enabled boolean NOT NULL DEFAULT false,
 requests_open boolean NOT NULL DEFAULT true,
 schedule jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(schedule) = 'array'),
 menu jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(menu) = 'array'),
 challenges jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(challenges) = 'array'),
 dj_token_hash text,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wedding_song_requests (
 id text PRIMARY KEY,
 album_id text NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
 guest_token_hash text NOT NULL,
 title text NOT NULL CHECK (length(title) BETWEEN 1 AND 160),
 artist text NOT NULL DEFAULT '',
 requested_by text NOT NULL,
 note text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','accepted','played','declined')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wedding_songs_album_created_idx ON wedding_song_requests(album_id, created_at);
CREATE INDEX IF NOT EXISTS wedding_songs_guest_idx ON wedding_song_requests(album_id, guest_token_hash);
CREATE TABLE IF NOT EXISTS wedding_bingo_submissions (
 id text PRIMARY KEY,
 album_id text NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
 challenge_id text NOT NULL,
 photo_id text NOT NULL UNIQUE REFERENCES photos(id) ON DELETE CASCADE,
 guest_token_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wedding_bingo_album_challenge_idx ON wedding_bingo_submissions(album_id, challenge_id);
CREATE INDEX IF NOT EXISTS wedding_bingo_guest_idx ON wedding_bingo_submissions(album_id, guest_token_hash);
