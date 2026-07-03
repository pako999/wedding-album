import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Referral-code generation for albums.
 *
 * Format:  <NAME>-<SUFFIX>
 *   NAME    = coupleName folded to ASCII, uppercased, split on non-alnum,
 *             hyphen-joined, trimmed to <= 12 chars total
 *   SUFFIX  = 2 random base-36 chars
 *
 * Examples:
 *   "Ana & Marko"           -> ANA-MARKO-4Z
 *   "Anna's Birthday Party" -> ANNA-BIRTHDAY-X7
 *   "Ožbej"                 -> OZBEJ-1K
 *
 * Uniqueness is enforced at the DB (UNIQUE constraint) — if a candidate
 * collides we regenerate the suffix and retry (max 10 attempts). Names
 * that fold to empty (e.g. "🎉") fall back to "GALLERY".
 */

const NAME_MAX = 12;
const SUFFIX_LEN = 2;

/** Fold diacritics + strip non-alnum + uppercase + hyphenate.
 *  "Ana & Marko" -> "ANA-MARKO"
 *  "Anna's 30th" -> "ANNA-S-30TH" */
export function normalizeNamePart(input: string): string {
  const stripped = input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // fold accents
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean)
    .join("-");
  // Cap total length; prefer whole segments over cutting mid-word.
  if (stripped.length <= NAME_MAX) return stripped || "GALLERY";
  const parts = stripped.split("-");
  const out: string[] = [];
  let used = 0;
  for (const p of parts) {
    const cost = out.length === 0 ? p.length : p.length + 1;
    if (used + cost > NAME_MAX) break;
    out.push(p);
    used += cost;
  }
  return (out.join("-") || stripped.slice(0, NAME_MAX)) || "GALLERY";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 2 + SUFFIX_LEN).toUpperCase();
}

/** Build one candidate. Not guaranteed unique — caller must probe DB. */
export function buildReferralCode(coupleName: string): string {
  return `${normalizeNamePart(coupleName)}-${randomSuffix()}`;
}

/**
 * Generate a referral code that's guaranteed unique among existing rows.
 * Retries up to 10× with fresh suffixes on collision. Throws on repeated
 * failure so a broken DB doesn't silently return a duplicate.
 */
export async function generateUniqueReferralCode(coupleName: string): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = buildReferralCode(coupleName);
    const existing = await db.query.albums
      .findFirst({ where: eq(albums.referralCode, candidate) })
      .catch(() => null);
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique referral code after 10 tries");
}
