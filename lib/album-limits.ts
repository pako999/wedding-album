import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";

export type AlbumCreationGate =
  | { allowed: true }
  | { allowed: false; mostRecentSlug: string };

/**
 * Each paid package belongs to exactly one event/album. A paid album must
 * therefore never unlock extra paid events on the same account.
 *
 * Owners may create another event after their existing event is paid; the
 * new event starts on Free and can be upgraded separately. To prevent Free
 * from becoming an unlimited-event loophole, an account may have only one
 * active Free event at a time.
 */
export async function getAlbumCreationGate(userId: string): Promise<AlbumCreationGate> {
  const userAlbums = await db.query.albums.findMany({
    where: eq(albums.ownerClerkId, userId),
    orderBy: [desc(albums.createdAt)],
  });

  if (userAlbums.length === 0) return { allowed: true };

  const now = new Date();
  const activeFreeAlbum = userAlbums.find(
    (album) =>
      album.plan === "free" &&
      (album.expiresAt === null || album.expiresAt > now),
  );

  if (activeFreeAlbum) {
    return { allowed: false, mostRecentSlug: activeFreeAlbum.slug };
  }

  return { allowed: true };
}
