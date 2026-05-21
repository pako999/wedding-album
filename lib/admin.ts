import { currentUser } from "@clerk/nextjs/server";

/**
 * Platform-owner admin allowlist. Anyone whose primary Clerk email matches
 * one of these gets access to `/admin/*`. Comma-separated env var wins;
 * the hardcoded fallback covers the founder accounts so we never lock
 * ourselves out by misconfiguring the env var.
 */
const FALLBACK_ADMINS = [
  "info@surf-store.com",
  "surfnow2017@gmail.com",
];

export function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : FALLBACK_ADMINS;
}

/** Returns the current user's email if (and only if) they are an admin. */
export async function requireAdmin(): Promise<{ email: string; clerkId: string } | null> {
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch {
    return null;
  }
  if (!user) return null;
  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  if (!email) return null;
  if (!adminEmails().includes(email)) return null;
  return { email, clerkId: user.id };
}
