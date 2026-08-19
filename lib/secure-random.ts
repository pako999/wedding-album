import { randomInt } from "node:crypto";

/**
 * CSPRNG token helpers. Use these — never Math.random() — for anything a
 * user should not be able to guess or enumerate: album slug suffixes
 * (a guessed slug is gallery access when the album has no password),
 * referral and affiliate codes (guessing them is reward/attribution
 * fraud), and any access token.
 *
 * randomInt is Node's crypto CSPRNG and is rejection-sampled, so unlike
 * `Math.floor(Math.random() * n)` it is both unpredictable and unbiased
 * across the alphabet.
 */

/** Lowercase base36, e.g. a 4-char slug suffix. */
export function randomBase36(len: number): string {
  const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

/** Draw `len` chars from a caller-supplied alphabet (unbiased). */
export function randomFromAlphabet(alphabet: string, len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[randomInt(alphabet.length)];
  return out;
}
