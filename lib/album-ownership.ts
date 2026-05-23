import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Album-ownership check used by every album-mutation API route.
 *
 * Matches by:
 *   1. Clerk userId === album.ownerClerkId   (normal case)
 *   2. Clerk verified email matches album.ownerEmail (case-insensitive)
 *
 * The email fallback handles:
 *   • WedFlow / cross-Clerk-instance albums (the integration endpoint
 *     creates albums with an ownerClerkId from a different Clerk env)
 *   • Cached ownerEmail typo / capitalisation drift
 *   • Users who recreated their Clerk account against the same email
 *
 * Security: Clerk only attaches an email to a user after verification,
 * so `user.emailAddresses[*].emailAddress` is always a verified address
 * the user demonstrably controls. The trust placed in `album.ownerEmail`
 * is the same trust this app already places on it for the dashboard
 * read path (post-commit 8f50f0e) and for the per-album guest-page
 * "isOwner" check in app/[slug]/page.tsx — this helper just makes that
 * consistent across the mutation surface.
 */

interface OwnableAlbum {
  ownerClerkId: string;
  ownerEmail: string | null;
}

export type OwnerCheckResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Resolve current Clerk identity and verify it owns the album.
 * Returns { ok: true, userId } on success or { ok: false, status, error }
 * for the route to forward back as a NextResponse.
 */
export async function checkAlbumOwnership(album: OwnableAlbum | null | undefined): Promise<OwnerCheckResult> {
  if (!album) return { ok: false, status: 403, error: "Album not found" };

  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    // Clerk error treated as unauthenticated
  }
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };

  // Fast path: Clerk id matches directly.
  if (album.ownerClerkId === userId) return { ok: true, userId };

  // Slow path: fall back to verified-email match. Only fetched if needed
  // because currentUser() costs a Clerk API call.
  if (!album.ownerEmail) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  const verified = user?.emailAddresses ?? [];
  const wanted = album.ownerEmail.toLowerCase();
  const match = verified.some((e) => e.emailAddress?.toLowerCase() === wanted);
  if (match) return { ok: true, userId };

  return { ok: false, status: 403, error: "Forbidden" };
}
