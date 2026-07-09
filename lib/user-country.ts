import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userMeta } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Record the signed-in user's country from Vercel's geo header.
 *
 * `x-vercel-ip-country` is an ISO-3166 alpha-2 code Vercel stamps on
 * every edge request (absent on localhost). We upsert so the value
 * tracks the user's latest location — for a wedding SaaS the current
 * market matters more than the first-touch one.
 *
 * Always best-effort and fire-and-forget: a failed write must never
 * break album creation or a dashboard render.
 */
/**
 * @returns created=true when this call inserted the user's FIRST
 * user_meta row — i.e. we have never seen this user before. Callers
 * use that as a "new user" signal (e.g. the Telegram fallback ping
 * when the Clerk webhook misses a registration).
 */
export async function recordUserCountry(clerkId: string): Promise<{ created: boolean }> {
  try {
    const h = await headers();
    const raw = h.get("x-vercel-ip-country")?.trim().toUpperCase();
    const country = raw && raw.length === 2 && raw !== "XX" ? raw : null;

    const existing = await db.query.userMeta.findFirst({
      where: (m, { eq }) => eq(m.clerkId, clerkId),
      columns: { clerkId: true, country: true },
    });

    if (!existing) {
      await db
        .insert(userMeta)
        .values({ clerkId, country, source: "ip", updatedAt: new Date() })
        .onConflictDoNothing();
      return { created: true };
    }
    if (country && country !== existing.country) {
      await db
        .update(userMeta)
        .set({ country, source: "ip", updatedAt: new Date() })
        .where(eq(userMeta.clerkId, clerkId));
    }
    return { created: false };
  } catch (err) {
    console.warn("[user-country] record failed:", err);
    return { created: false };
  }
}

/** "SI" → 🇸🇮 via Unicode regional-indicator letters. */
export function countryFlag(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)),
  );
}

/**
 * Fallback for users with no recorded IP country: infer from the
 * free-text locations of their albums ("Sisak, Hrvatska" → HR).
 * Country names first, then major cities. Returns null when nothing
 * matches — the admin table shows "—" rather than guessing.
 */
const LOCATION_COUNTRY: ReadonlyArray<readonly [string, RegExp]> = [
  ["HR", /hrvat|croat|kroat|zagreb|\bsplit\b|rijeka|osijek|sisak|zadar|dubrovnik/i],
  ["RS", /srbij|serbi|beograd|belgrad|novi sad|kragujevac|subotica/i],
  ["SI", /sloven|ljubljana|maribor|celje|kranj|koper|portoro/i],
  ["DE", /deutsch|german|berlin|m[uü]nchen|hamburg|frankfurt/i],
  ["AT", /[oö]sterreich|austria|wien|graz|salzburg|linz/i],
  ["CH", /schweiz|switzerland|z[uü]rich|gen[eè]v|basel/i],
  ["ES", /espa[nñ]|spain|spanien|madrid|barcelona|valencia|sevilla/i],
  ["IT", /itali|roma\b|milano|venezia|trst|trieste/i],
  ["GB", /\bengland\b|united kingdom|\buk\b|london|manchester/i],
  ["US", /united states|\busa\b|new york|los angeles|chicago/i],
];

export function inferCountryFromLocation(location: string | null | undefined): string | null {
  if (!location) return null;
  for (const [code, re] of LOCATION_COUNTRY) {
    if (re.test(location)) return code;
  }
  return null;
}
