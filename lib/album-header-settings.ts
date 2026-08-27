import { neon } from "@neondatabase/serverless";

export interface AlbumHeaderSettings {
  showEventName: boolean;
  showLocation: boolean;
}

export const DEFAULT_ALBUM_HEADER_SETTINGS: AlbumHeaderSettings = {
  showEventName: true,
  showLocation: true,
};

type HeaderRow = {
  show_event_name: boolean;
  show_location: boolean;
};

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

/**
 * Read header preferences without ever breaking a public gallery.
 * Older databases simply fall back to the historical behaviour (both on).
 */
export async function getAlbumHeaderSettings(albumId: string): Promise<AlbumHeaderSettings> {
  const query = sqlClient();
  if (!query) return DEFAULT_ALBUM_HEADER_SETTINGS;
  try {
    const rows = await query`
      SELECT show_event_name, show_location
      FROM album_header_settings
      WHERE album_id = ${albumId}
      LIMIT 1
    ` as unknown as HeaderRow[];
    const row = rows[0];
    if (!row) return DEFAULT_ALBUM_HEADER_SETTINGS;
    return {
      showEventName: row.show_event_name !== false,
      showLocation: row.show_location !== false,
    };
  } catch (err) {
    // A deploy may land before the small settings table exists. Reading a
    // gallery must remain safe; defaults preserve the current UI.
    console.warn("[album-header-settings] read failed; using defaults:", err);
    return DEFAULT_ALBUM_HEADER_SETTINGS;
  }
}

async function ensureTable() {
  const query = sqlClient();
  if (!query) throw new Error("DATABASE_URL is not configured");
  await query`
    CREATE TABLE IF NOT EXISTS album_header_settings (
      album_id TEXT PRIMARY KEY REFERENCES albums(id) ON DELETE CASCADE,
      show_event_name BOOLEAN NOT NULL DEFAULT TRUE,
      show_location BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  return query;
}

/**
 * Owner-triggered settings write. The tiny table is created lazily only if
 * this feature is actually used; normal requests never run DDL.
 */
export async function setAlbumHeaderSettings(
  albumId: string,
  patch: Partial<AlbumHeaderSettings>,
): Promise<boolean> {
  const clean: Partial<AlbumHeaderSettings> = {};
  if (typeof patch.showEventName === "boolean") clean.showEventName = patch.showEventName;
  if (typeof patch.showLocation === "boolean") clean.showLocation = patch.showLocation;
  if (Object.keys(clean).length === 0) return true;

  try {
    const query = await ensureTable();
    const current = await getAlbumHeaderSettings(albumId);
    const next = { ...current, ...clean };
    await query`
      INSERT INTO album_header_settings (album_id, show_event_name, show_location, updated_at)
      VALUES (${albumId}, ${next.showEventName}, ${next.showLocation}, NOW())
      ON CONFLICT (album_id) DO UPDATE SET
        show_event_name = EXCLUDED.show_event_name,
        show_location = EXCLUDED.show_location,
        updated_at = NOW()
    `;
    return true;
  } catch (err) {
    console.error("[album-header-settings] write failed:", err);
    return false;
  }
}
