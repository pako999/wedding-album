import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Album password hashing + verification.
 *
 * We use Node's built-in scrypt so there's no extra npm dependency. Format
 * stored in the DB:
 *
 *   scrypt$<N>$<salt-hex>$<hash-hex>
 *
 * where N is the scrypt cost parameter. Salt is 16 bytes, hash is 64 bytes.
 *
 * Legacy: before this landed we stored passwords in plaintext. `verify()`
 * transparently handles both — if the stored value doesn't look like our
 * scrypt format we fall back to a timing-safe string compare. `needsRehash()`
 * returns true for such rows so callers can silently upgrade on the next
 * successful verification. Never re-store the plaintext after a failed check;
 * only rehash after a MATCHED plaintext.
 */

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const SCRYPT_N = 16384;       // 2^14 — safe default, ~30ms on modern hw
const KEY_LEN = 64;
const SALT_LEN = 16;

const FORMAT_PREFIX = "scrypt$";

/** True iff `stored` looks like our hashed format (not legacy plaintext). */
export function isHashed(stored: string): boolean {
  return stored.startsWith(FORMAT_PREFIX);
}

/** Hash a plaintext password for storage. */
export async function hashAlbumPassword(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext; // caller should have already null-checked
  const salt = randomBytes(SALT_LEN);
  const hash = await scryptAsync(plaintext, salt, KEY_LEN);
  return `${FORMAT_PREFIX}${SCRYPT_N}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/**
 * Verify plaintext against a stored value. Handles both hashed and legacy
 * plaintext rows. Timing-safe in both branches.
 */
export async function verifyAlbumPassword(
  plaintext: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored || !plaintext) return false;

  if (isHashed(stored)) {
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "scrypt") return false;
    const saltHex = parts[2];
    const hashHex = parts[3];
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    let actual: Buffer;
    try {
      actual = await scryptAsync(plaintext, salt, expected.length);
    } catch {
      return false;
    }
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }

  // Legacy plaintext row — timing-safe string compare so we don't leak
  // partial-match info via response time.
  return safeStringEqual(plaintext, stored);
}

/** True iff a matched password is stored in legacy plaintext form and
 *  should be re-stored as a hash. Caller should only call this AFTER
 *  verifyAlbumPassword() has returned true. */
export function needsRehash(stored: string | null | undefined): boolean {
  return !!stored && !isHashed(stored);
}

/** Pad the shorter string to the longer one's length before comparing,
 *  so timingSafeEqual (which requires equal-length inputs) can run on
 *  arbitrary user input without leaking length via early return. */
function safeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  // Compare lengths in constant time by expanding both to max length.
  const max = Math.max(aBuf.length, bBuf.length);
  const aPad = Buffer.alloc(max, 0);
  const bPad = Buffer.alloc(max, 0);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  const equalLen = aBuf.length === bBuf.length;
  const equalBytes = timingSafeEqual(aPad, bPad);
  return equalLen && equalBytes;
}
