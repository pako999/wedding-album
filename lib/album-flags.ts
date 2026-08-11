import { db } from "@/lib/db";
import { albumFeatureFlags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface AlbumFlags {
  /** Require name + surname + email from guests before uploading. */
  guestDataCapture: boolean;
}

const DEFAULTS: AlbumFlags = { guestDataCapture: false };

/**
 * Per-album feature flags. NEVER throws.
 *
 * If `album_feature_flags` doesn't exist yet (a deploy that landed ahead
 * of its migration) every flag reads as its default — the feature is
 * simply off, and nothing that depends on it can break a live gallery.
 */
export async function getAlbumFlags(albumId: string): Promise<AlbumFlags> {
  try {
    const row = await db.query.albumFeatureFlags.findFirst({
      where: eq(albumFeatureFlags.albumId, albumId),
    });
    if (!row) return DEFAULTS;
    return { guestDataCapture: row.guestDataCapture };
  } catch (err) {
    console.warn("[album-flags] lookup failed (table missing?):", err);
    return DEFAULTS;
  }
}

/** Upsert a flag. Returns false if the table isn't available yet. */
export async function setAlbumFlag<K extends keyof AlbumFlags>(
  albumId: string,
  key: K,
  value: AlbumFlags[K],
): Promise<boolean> {
  try {
    await db
      .insert(albumFeatureFlags)
      .values({ albumId, [key]: value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: albumFeatureFlags.albumId,
        set: { [key]: value, updatedAt: new Date() },
      });
    return true;
  } catch (err) {
    console.error("[album-flags] write failed:", err);
    return false;
  }
}
