import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

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

// ─── Second factor: an HMAC-signed cookie set after entering ADMIN_PASSWORD ─

const COOKIE_NAME  = "guestcam_admin_pw";
const COOKIE_TTL_S = 60 * 60 * 12;     // 12 hours

function secret(): string {
  // We reuse CLERK_SECRET_KEY as the HMAC secret so we don't need a
  // separate ADMIN_COOKIE_SECRET env var. The Clerk secret already
  // exists everywhere /admin runs and rotates with the rest of auth.
  return process.env.CLERK_SECRET_KEY ?? "guestcam_admin_dev_secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** True if the admin password was entered + cookie is valid + not expired. */
export async function hasValidAdminCookie(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  // If no password is configured, treat the second factor as disabled
  // (Clerk email allowlist still applies). Avoids locking ourselves
  // out before the env var lands in Vercel.
  if (!expected) return true;

  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [issuedAtStr, sig] = raw.split(".", 2);
  if (!issuedAtStr || !sig) return false;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > COOKIE_TTL_S * 1000) return false;

  const expectedSig = sign(`${issuedAt}:${expected}`);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expectedSig, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Verify a submitted password and return a signed cookie value to set. */
export function buildAdminCookie(submittedPassword: string): { value: string; maxAge: number } | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return null;
  const a = Buffer.from(submittedPassword);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const issuedAt = Date.now();
  const sig = sign(`${issuedAt}:${expected}`);
  return { value: `${issuedAt}.${sig}`, maxAge: COOKIE_TTL_S };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

// ─── Public admin gate ──────────────────────────────────────────────────────

/** Returns the current user's email if (and only if) they are an admin
 *  AND have passed the password second factor (when configured). */
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
  if (!(await hasValidAdminCookie())) return null;
  return { email, clerkId: user.id };
}

/** Like requireAdmin but skips the password gate. For the login page itself. */
export async function requireAdminEmail(): Promise<{ email: string; clerkId: string } | null> {
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
