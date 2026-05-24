import { auth, currentUser } from "@clerk/nextjs/server";
import { requireAdmin } from "@/lib/admin";

/**
 * Album-ownership check used by every album-mutation API route.
 *
 * Matches by:
 *   1. Clerk userId === album.ownerClerkId          (normal case)
 *   2. Clerk verified email matches album.ownerEmail (case-insensitive)
 *   3. Caller is a platform admin                    (impersonation)
 *
 * The email fallback handles:
 *   • WedFlow / cross-Clerk-instance albums (the integration endpoint
 *     creates albums with an ownerClerkId from a different Clerk env)
 *   • Cached ownerEmail typo / capitalisation drift
 *   • Users who recreated their Clerk account against the same email
 *
 * Platform-admin path lets allowlisted admins (Clerk + ADMIN_EMAILS +
 * password cookie) manage any album from /admin/albums → "Admin"
 * button. That goes through the same /dashboard/<slug> page and
 * mutation routes a regular owner uses; without this branch every
 * admin action 403s once they hit a non-owned album.
 *
 * Security: Clerk only attaches an email to a user after verification,
 * so user.emailAddresses[*].emailAddress is always a verified address
 * the user demonstrably controls. The platform-admin branch requires
 * the password second-factor cookie (requireAdmin, not just
 * requireAdminEmail), so casual sign-in alone doesn't grant edit
 * access to other people's albums.
 */

interface OwnableAlbum {
  ownerClerkId: string;
  ownerEmail: string | null;
}

export type OwnerCheckResult =
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Resolve current Clerk identity and verify it owns the album OR is
 * a platform admin. Returns { ok: true, userId } on success or
 * { ok: false, status, error } for the route to forward back as a
 * NextResponse.
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

  // currentUser() is needed for both the email-fallback and platform-
  // admin checks; fetch once and reuse.
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  // Email-match fallback (verified emails on the Clerk user).
  if (album.ownerEmail) {
    const verified = user?.emailAddresses ?? [];
    const wanted = album.ownerEmail.toLowerCase();
    const match = verified.some((e) => e.emailAddress?.toLowerCase() === wanted);
    if (match) return { ok: true, userId };
  }

  // Platform-admin impersonation — Clerk-authenticated AND allowlisted
  // email AND second-factor password cookie still valid. requireAdmin
  // returns null for any of those failing.
  try {
    const admin = await requireAdmin();
    if (admin) return { ok: true, userId };
  } catch {
    // fall through to 403
  }

  return { ok: false, status: 403, error: "Forbidden" };
}

/**
 * True iff the current request is a platform admin acting on someone
 * else's album. Used to render an "Admin view" banner on the dashboard
 * so the admin is visually reminded they're not on their own gallery.
 */
export async function isAdminImpersonating(
  album: OwnableAlbum | null | undefined,
): Promise<boolean> {
  if (!album) return false;
  let userId: string | null = null;
  try {
    userId = (await auth()).userId;
  } catch { /* */ }
  if (!userId) return false;
  if (userId === album.ownerClerkId) return false;
  // If they email-match the owner they're the legit owner, not admin
  if (album.ownerEmail) {
    try {
      const u = await currentUser();
      const verified = u?.emailAddresses ?? [];
      const wanted = album.ownerEmail.toLowerCase();
      if (verified.some((e) => e.emailAddress?.toLowerCase() === wanted)) return false;
    } catch { /* */ }
  }
  try {
    return !!(await requireAdmin());
  } catch {
    return false;
  }
}
