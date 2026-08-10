import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";

/** Plans that unlock unlimited galleries per account. Free and Basic are
 *  capped at a single gallery — an owner on either plan who wants a second
 *  gallery has to upgrade an existing one to Plus or Premium first. */
const MULTI_ALBUM_PLANS = new Set(["plus", "premium"]);

export type AlbumCreationGate =
  | { allowed: true }
  | { allowed: false; mostRecentSlug: string };

/** Decides whether `userId` may create another gallery. Free/Basic owners
 *  who already have a gallery are blocked until they upgrade one of their
 *  existing galleries to Plus or Premium (expired paid plans don't count —
 *  they've fallen back to the same one-gallery cap as Free). */
export async function getAlbumCreationGate(userId: string): Promise<AlbumCreationGate> {
  const userAlbums = await db.query.albums.findMany({
    where: eq(albums.ownerClerkId, userId),
    orderBy: [desc(albums.createdAt)],
  });

  if (userAlbums.length === 0) return { allowed: true };

  const now = new Date();
  const hasActiveMultiAlbumPlan = userAlbums.some(
    (a) => MULTI_ALBUM_PLANS.has(a.plan) && (a.expiresAt === null || a.expiresAt > now),
  );
  if (hasActiveMultiAlbumPlan) return { allowed: true };

  return { allowed: false, mostRecentSlug: userAlbums[0].slug };
}
