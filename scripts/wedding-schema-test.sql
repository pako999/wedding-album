-- CI scratch database only: invoked by workflow with PGDATABASE=guestcam_wedding_ci.
\set ON_ERROR_STOP on
CREATE TABLE albums (id text PRIMARY KEY);
CREATE TABLE photos (id text PRIMARY KEY, album_id text NOT NULL REFERENCES albums(id) ON DELETE CASCADE, status text NOT NULL);
\i scripts/migrations/20260926-wedding-premium.sql
-- A second run MUST work: deployments may overlap or be retried.
\i scripts/migrations/20260926-wedding-premium.sql
INSERT INTO albums VALUES ('ci-album-a'),('ci-album-b');
INSERT INTO wedding_settings(album_id,enabled,challenges) VALUES ('ci-album-a',true,'[{"id":"challenge-1","title":"Dance","detail":""}]');
INSERT INTO wedding_song_requests(id,album_id,guest_token_hash,title,requested_by) VALUES ('ci-song','ci-album-a','test-only','Song','Test guest');
INSERT INTO photos VALUES ('ci-photo','ci-album-a','pending');
INSERT INTO wedding_bingo_submissions(id,album_id,challenge_id,photo_id,guest_token_hash) VALUES ('ci-submission','ci-album-a','challenge-1','ci-photo','test-only');
DO $$ BEGIN
 IF (SELECT count(*) FROM wedding_bingo_submissions b JOIN photos p ON p.id=b.photo_id WHERE b.album_id='ci-album-a' AND p.status='published')<>0 THEN RAISE EXCEPTION 'Pending photo leaked'; END IF;
 IF (SELECT count(*) FROM wedding_song_requests WHERE album_id='ci-album-b')<>0 THEN RAISE EXCEPTION 'Album isolation failed'; END IF;
 BEGIN
  UPDATE wedding_song_requests SET status='invalid';
  RAISE EXCEPTION 'Status validation missing';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  INSERT INTO photos VALUES ('ci-atomic','ci-album-a','published');
  INSERT INTO wedding_bingo_submissions(id,album_id,challenge_id,photo_id,guest_token_hash) VALUES ('ci-submission','ci-album-a','challenge-1','ci-atomic','test-only');
  RAISE EXCEPTION 'Duplicate submission did not fail';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 IF EXISTS(SELECT 1 FROM photos WHERE id='ci-atomic') THEN RAISE EXCEPTION 'Atomic photo/submission rollback failed'; END IF;
END $$;
UPDATE photos SET status='published' WHERE id='ci-photo';
DO $$ BEGIN
 IF (SELECT count(*) FROM wedding_bingo_submissions b JOIN photos p ON p.id=b.photo_id WHERE b.album_id='ci-album-a' AND p.status='published')<>1 THEN RAISE EXCEPTION 'Published photo not counted'; END IF;
END $$;
DELETE FROM photos WHERE id='ci-photo';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM wedding_bingo_submissions) THEN RAISE EXCEPTION 'Deleted photos leave ghost bingo completion'; END IF;
END $$;
DELETE FROM albums WHERE id='ci-album-a';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM wedding_settings) OR EXISTS(SELECT 1 FROM wedding_song_requests) THEN RAISE EXCEPTION 'Album cleanup failed'; END IF;
END $$;
SELECT 'PASS: migration repeated, bingo attribution, published-only counts, isolation, status constraints, atomic rollback and cascade deletion' AS result;
