import { neon } from "@neondatabase/serverless";

export interface AlbumHeaderSettings {
  showTitle: boolean;
  showEventType: boolean;
  showEventDate: boolean;
}

export const DEFAULT_ALBUM_HEADER_SETTINGS: AlbumHeaderSettings = {
  showTitle: true,
  showEventType: true,
  showEventDate: true,
};

type HeaderRow = {
  show_event_name: boolean;
  show_event_type: boolean;
  show_event_date: boolean;
};

function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

/**
 * Read header preferences without ever breaking a public gallery. Older
 * databases and albums without a settings row keep the historical behaviour:
 * the title, event type and date are all visible.
 */
export async function getAlbumHeaderSettings(albumId: string): Promise<AlbumHeaderSettings> {
  const query = sqlClient();
  if (!query) return DEFAULT_ALBUM_HEADER_SETTINGS;

  try {
    const rows = await query`
      SELECT show_event_name, show_event_type, show_event_date
      FROM album_header_settings
      WHERE album_id = ${albumId}
      LIMIT 1
    ` as unknown as HeaderRow[];
    const row = rows[0];
    if (!row) return DEFAULT_ALBUM_HEADER_SETTINGS;

    return {
      showTitle: row.show_event_name !== false,
      showEventType: row.show_event_type !== false,
      showEventDate: row.show_event_date !== false,
    };
  } catch (err) {
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
      show_event_type BOOLEAN NOT NULL DEFAULT TRUE,
      show_event_date BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Compatibility with the earlier two-field preview of this feature.
  await query`ALTER TABLE album_header_settings ADD COLUMN IF NOT EXISTS show_event_name BOOLEAN NOT NULL DEFAULT TRUE`;
  await query`ALTER TABLE album_header_settings ADD COLUMN IF NOT EXISTS show_event_type BOOLEAN NOT NULL DEFAULT TRUE`;
  await query`ALTER TABLE album_header_settings ADD COLUMN IF NOT EXISTS show_event_date BOOLEAN NOT NULL DEFAULT TRUE`;

  return query;
}

/** Persist only validated boolean preferences supplied by the owner. */
export async function setAlbumHeaderSettings(
  albumId: string,
  patch: Partial<AlbumHeaderSettings>,
): Promise<boolean> {
  const clean: Partial<AlbumHeaderSettings> = {};
  if (typeof patch.showTitle === "boolean") clean.showTitle = patch.showTitle;
  if (typeof patch.showEventType === "boolean") clean.showEventType = patch.showEventType;
  if (typeof patch.showEventDate === "boolean") clean.showEventDate = patch.showEventDate;
  if (Object.keys(clean).length === 0) return true;

  try {
    const query = await ensureTable();
    const current = await getAlbumHeaderSettings(albumId);
    const next = { ...current, ...clean };

    await query`
      INSERT INTO album_header_settings (
        album_id,
        show_event_name,
        show_event_type,
        show_event_date,
        updated_at
      )
      VALUES (
        ${albumId},
        ${next.showTitle},
        ${next.showEventType},
        ${next.showEventDate},
        NOW()
      )
      ON CONFLICT (album_id) DO UPDATE SET
        show_event_name = EXCLUDED.show_event_name,
        show_event_type = EXCLUDED.show_event_type,
        show_event_date = EXCLUDED.show_event_date,
        updated_at = NOW()
    `;
    return true;
  } catch (err) {
    console.error("[album-header-settings] write failed:", err);
    return false;
  }
}
