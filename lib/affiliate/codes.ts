import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

function randomCode(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Generate a unique referral code. Length 8 by default → ~10^12 combinations.
 * Retries a few times if there's a collision before giving up.
 */
export async function generateReferralCode(seed?: string): Promise<string> {
  // If the affiliate's name/email gives us a slug-friendly start, use it.
  // e.g. "ANA" + 4 random chars. Falls back to fully random for safety.
  const seedPart = seed
    ? seed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)
    : "";

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = (seedPart + randomCode(8 - seedPart.length)).slice(0, 8);
    const existing = await db.query.affiliates.findFirst({
      where: eq(affiliates.referralCode, code),
    });
    if (!existing) return code;
  }
  // Fallback: pure random, 10 chars
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomCode(10);
    const existing = await db.query.affiliates.findFirst({
      where: eq(affiliates.referralCode, code),
    });
    if (!existing) return code;
  }
  throw new Error("Could not generate unique referral code");
}
