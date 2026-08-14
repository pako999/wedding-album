import { db } from "@/lib/db";
import { albumFeatureFlags } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type AlbumPermission = "view_upload" | "view_only" | "upload_only";

export interface AlbumFlags {
  /** Require name + surname + email from guests before uploading. */
  guestDataCapture: boolean;
  /** Which media guests may upload. */
  allowPhotos: boolean;
  allowVideos: boolean;
  /** What guests can do in the digital album. */
  albumPermission: AlbumPermission;
  /** Hide the download control from guests. */
  disableDownload: boolean;
  /** Turn off likes across the album. */
  disableLikes: boolean;
}

const PERMISSIONS: AlbumPermission[] = ["view_upload", "view_only", "upload_only"];

export const DEFAULTS: AlbumFlags = {
  guestDataCapture: false,
  allowPhotos: true,
  allowVideos: true,
  albumPermission: "view_upload",
  disableDownload: false,
  disableLikes: false,
};

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
    return {
      guestDataCapture: row.guestDataCapture,
      allowPhotos: row.allowPhotos,
      allowVideos: row.allowVideos,
      albumPermission: PERMISSIONS.includes(row.albumPermission as AlbumPermission)
        ? (row.albumPermission as AlbumPermission)
        : "view_upload",
      disableDownload: row.disableDownload,
      disableLikes: row.disableLikes,
    };
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

/**
 * Upsert several flags at once — one settings save, one write. Unknown
 * keys are dropped and albumPermission is validated, so a hand-crafted
 * request body can't write arbitrary columns.
 */
export async function setAlbumFlags(albumId: string, patch: Partial<AlbumFlags>): Promise<boolean> {
  const clean: Partial<AlbumFlags> = {};
  if (typeof patch.guestDataCapture === "boolean") clean.guestDataCapture = patch.guestDataCapture;
  if (typeof patch.allowPhotos === "boolean") clean.allowPhotos = patch.allowPhotos;
  if (typeof patch.allowVideos === "boolean") clean.allowVideos = patch.allowVideos;
  if (typeof patch.disableDownload === "boolean") clean.disableDownload = patch.disableDownload;
  if (typeof patch.disableLikes === "boolean") clean.disableLikes = patch.disableLikes;
  if (patch.albumPermission && PERMISSIONS.includes(patch.albumPermission)) {
    clean.albumPermission = patch.albumPermission;
  }
  if (Object.keys(clean).length === 0) return true;
  try {
    await db
      .insert(albumFeatureFlags)
      .values({ albumId, ...clean, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: albumFeatureFlags.albumId,
        set: { ...clean, updatedAt: new Date() },
      });
    return true;
  } catch (err) {
    console.error("[album-flags] bulk write failed:", err);
    return false;
  }
}
