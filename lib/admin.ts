import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const DEV_FALLBACK_ADMINS = [
  "info@surf-store.com",
  "surfnow2017@gmail.com",
];

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function adminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv;
  // Production must never silently fall back to source-code identities.
  return isProduction() ? [] : DEV_FALLBACK_ADMINS;
}

const COOKIE_NAME  = "guestcam_admin_pw";
const COOKIE_TTL_S = 60 * 60 * 12;

function secret(): string | null {
  const configured = process.env.ADMIN_COOKIE_SECRET ?? process.env.CLERK_SECRET_KEY;
  if (configured) return configured;
  return isProduction() ? null : "guestcam_admin_dev_secret";
}

function sign(payload: string): string | null {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(payload).digest("hex");
}

export async function hasValidAdminCookie(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  // Fail closed in production when either factor is not configured.
  if (!expected || !secret()) return false;

  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [issuedAtStr, sig] = raw.split(".", 2);
  if (!issuedAtStr || !sig) return false;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > COOKIE_TTL_S * 1000) return false;
  // Reject future-issued cookies beyond a tiny clock-skew allowance.
  if (issuedAt > Date.now() + 60_000) return false;

  const expectedSig = sign(`${issuedAt}:${expected}`);
  if (!expectedSig) return false;
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expectedSig, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function buildAdminCookie(submittedPassword: string): { value: string; maxAge: number } | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !secret()) return null;
  const a = Buffer.from(submittedPassword);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const issuedAt = Date.now();
  const sig = sign(`${issuedAt}:${expected}`);
  if (!sig) return null;
  return { value: `${issuedAt}.${sig}`, maxAge: COOKIE_TTL_S };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

function pickAllowlistedEmail(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  if (!user) return null;
  const allowed = new Set(adminEmails().map((e) => e.toLowerCase()));
  if (allowed.size === 0) return null;
  const candidates = (user.emailAddresses ?? [])
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress?.toLowerCase())
    .filter((e): e is string => !!e);
  for (const e of candidates) {
    if (allowed.has(e)) return e;
  }
  return null;
}

export async function requireAdmin(): Promise<{ email: string; clerkId: string } | null> {
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch {
    return null;
  }
  if (!user) return null;
  const email = pickAllowlistedEmail(user);
  if (!email) return null;
  if (!(await hasValidAdminCookie())) return null;
  return { email, clerkId: user.id };
}

/** Login-page gate only: verified Clerk identity + explicit admin allowlist. */
export async function requireAdminEmail(): Promise<{ email: string; clerkId: string } | null> {
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  try {
    user = await currentUser();
  } catch {
    return null;
  }
  if (!user) return null;
  const email = pickAllowlistedEmail(user);
  if (!email) return null;
  return { email, clerkId: user.id };
}
