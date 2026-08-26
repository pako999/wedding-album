const COOKIE_PREFIX = "gc_album_pw_";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function cookieName(slug: string): string {
  // Album slugs are already restricted to URL-safe characters. Clamp anyway so
  // an externally-created legacy slug can never create an invalid cookie name.
  return `${COOKIE_PREFIX}${slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80)}`;
}

async function encryptionKey(): Promise<CryptoKey | null> {
  const secret = process.env.ALBUM_ACCESS_SECRET ?? process.env.CLERK_SECRET_KEY;
  if (!secret) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/** Encrypt the user-entered album password before storing it in an HttpOnly cookie. */
export async function sealAlbumPassword(slug: string, password: string): Promise<string | null> {
  const key = await encryptionKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aad = new TextEncoder().encode(`guestcam:${slug}`);
  const plain = new TextEncoder().encode(password);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad }, key, plain);
  const ciphertext = new Uint8Array(encrypted);
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv, 0);
  packed.set(ciphertext, iv.length);
  return toBase64Url(packed);
}

/** Decrypt an album password cookie. Tampering or a rotated secret returns null. */
export async function unsealAlbumPassword(slug: string, value: string): Promise<string | null> {
  try {
    const key = await encryptionKey();
    if (!key) return null;
    const packed = fromBase64Url(value);
    if (packed.length <= 12) return null;
    const iv = packed.slice(0, 12);
    const ciphertext = packed.slice(12);
    const aad = new TextEncoder().encode(`guestcam:${slug}`);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: aad },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

export function albumPasswordCookieName(slug: string): string {
  return cookieName(slug);
}

export const ALBUM_PASSWORD_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
