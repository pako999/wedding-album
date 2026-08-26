-- Guestcam production performance indexes
--
-- Apply manually during a controlled maintenance/deploy window.
-- These statements are intentionally NOT executed during app startup.
-- CREATE INDEX CONCURRENTLY avoids long write locks on production tables.
-- Run each statement outside an explicit transaction.

CREATE INDEX CONCURRENTLY IF NOT EXISTS albums_custom_domain_idx
  ON albums (custom_domain)
  WHERE custom_domain IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS albums_expires_at_idx
  ON albums (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS albums_owner_email_lower_idx
  ON albums (LOWER(owner_email))
  WHERE owner_email IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS photos_blob_url_idx
  ON photos (blob_url);

CREATE INDEX CONCURRENTLY IF NOT EXISTS photos_stream_video_idx
  ON photos (cf_stream_video_id)
  WHERE cf_stream_video_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS photos_album_gallery_idx
  ON photos (album_id, status, sort_order, uploaded_at);
