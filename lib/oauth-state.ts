import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

/**
 * Signed OAuth `state` for the Google Drive flow.
 *
 * The callback already re-verifies album ownership against the Clerk
 * session, so a tampered slug cannot export another user's album. This
 * adds defence in depth against OAuth CSRF: state is bound to the
 * initiating user, carries a nonce and a short expiry, and is HMAC-signed
 * so it cannot be forged or replayed after expiry.
 *
 * Secret: reuses CLERK_SECRET_KEY (present wherever auth runs) rather than
 * requiring a new env var, matching how the admin cookie is signed.
 */

interface StatePayload {
  slug: string;
  userId: string;
  nonce: string;
  exp: number; // Unix ms
}

const TTL_MS = 10 * 60_000; // 10 minutes — an OAuth consent round-trip

function secret(): string {
  return process.env.CLERK_SECRET_KEY ?? "oauth_state_dev_secret";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function signOAuthState(slug: string, userId: string): string {
  const payload: StatePayload = { slug, userId, nonce: b64url(randomBytes(9)), exp: Date.now() + TTL_MS };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = b64url(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

/** Returns the payload if the signature is valid and unexpired, else null. */
export function verifyOAuthState(state: string): StatePayload | null {
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = b64url(createHmac("sha256", secret()).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()) as StatePayload;
    if (!payload.slug || !payload.userId || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
