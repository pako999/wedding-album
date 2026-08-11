import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Photo Wall access token — deliberately separate from the album's own
 * `slug`. The wall is meant to run all night on a shared venue TV, so
 * its link must never be derivable from the main gallery link (or let
 * someone derive the gallery link from it). Format matches the DB
 * backfill migration in lib/db/migrations.ts (a hyphen-free UUID) so
 * tokens look the same regardless of which code path generated them.
 */
export function generateWallToken(): string {
  return randomUUID().replace(/-/g, "");
}

/**
 * Returns the album's wall token, generating and persisting one on the
 * fly if it's somehow still missing (e.g. an album created in the gap
 * between a deploy and the backfill migration completing). Every album
 * created going forward gets one directly at insert time
 * (app/actions/create-album.ts) and the migration backfills the rest,
 * so this fallback should rarely actually run — best-effort: if the
 * write fails we still return a usable token for this one request.
 */
export async function getOrCreateWallToken(albumId: string, current: string | null | undefined): Promise<string> {
  if (current) return current;
  const token = generateWallToken();
  await db.update(albums).set({ wallToken: token }).where(eq(albums.id, albumId)).catch(() => {});
  return token;
}
