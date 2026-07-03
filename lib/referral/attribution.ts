import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { albums, referralConversions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Guest-referral attribution — separate from the affiliate flow.
 *
 * Cookie name is distinct so we don't step on gc_ref (affiliate). First-touch
 * wins: middleware only sets the cookie when it's absent. TTL 90 days.
 */

export const GUEST_REF_COOKIE = "gc_gref";        // referral CODE
export const GUEST_TP_COOKIE  = "gc_gtp";         // touchpoint that brought them
export const COOKIE_MAX_AGE   = 90 * 24 * 60 * 60; // 90 days

/** Every touchpoint the CTA can carry. Union of what the spec allows. */
export const TOUCHPOINTS = [
  "upload_success",
  "email_d3",
  "email_d21",
  "email_footer",
  "gallery_footer",
  "live_display",
  "couple_share",
] as const;
export type Touchpoint = (typeof TOUCHPOINTS)[number];

export function isValidTouchpoint(v: unknown): v is Touchpoint {
  return typeof v === "string" && (TOUCHPOINTS as readonly string[]).includes(v);
}

/** Read guest ref+tp cookies during a server action / API route. */
export async function getGuestRefFromCookie(): Promise<{ code: string; tp: string | null } | null> {
  const jar = await cookies();
  const code = jar.get(GUEST_REF_COOKIE)?.value;
  if (!code) return null;
  const tp = jar.get(GUEST_TP_COOKIE)?.value ?? null;
  return { code, tp };
}

/**
 * Called from `createAlbum` (the moment a new user materialises an album).
 * If the guest-ref cookie is present AND resolves to a real source album,
 * we:
 *   1. Write source album + touchpoint onto the new album row (so admin
 *      can filter "acquired via referral").
 *   2. Insert a referral_conversions row. `convertedToPaidAt` is filled
 *      later by the Mollie webhook.
 *   3. Return the source album id so create-album can also grant the
 *      15% first-purchase discount if we want that behaviour (P0 spec
 *      keeps discount at Mollie only, so we do NOT auto-apply here).
 *
 * All best-effort — never blocks album creation on attribution errors.
 */
export async function attributeNewAlbumFromCookie(
  newAlbumId: string,
  newUserClerkId: string,
): Promise<{ sourceAlbumId: string; touchpoint: string | null } | null> {
  const ref = await getGuestRefFromCookie();
  if (!ref) return null;

  try {
    const source = await db.query.albums.findFirst({
      where: eq(albums.referralCode, ref.code),
    });
    if (!source) return null;

    // Prevent self-referral (user clicking their own code).
    if (source.ownerClerkId === newUserClerkId) return null;

    const touchpoint = isValidTouchpoint(ref.tp) ? ref.tp : null;

    // Stamp attribution on the new album.
    await db
      .update(albums)
      .set({ referralSourceAlbumId: source.id, referralTouchpoint: touchpoint })
      .where(eq(albums.id, newAlbumId))
      .catch(() => {});

    // Log the conversion (K-factor source of truth).
    await db
      .insert(referralConversions)
      .values({
        sourceAlbumId: source.id,
        newUserClerkId,
        newAlbumId,
        touchpoint,
      })
      .catch(() => {});

    return { sourceAlbumId: source.id, touchpoint };
  } catch {
    return null;
  }
}

/** Mark a conversion as paid — called from the Mollie webhook after
 *  successful payment. Idempotent; only writes the FIRST paid moment. */
export async function markConversionPaid(newUserClerkId: string): Promise<void> {
  try {
    // Find the earliest not-yet-paid conversion row for this user.
    const rows = await db
      .select()
      .from(referralConversions)
      .where(eq(referralConversions.newUserClerkId, newUserClerkId));
    const unpaid = rows.find((r) => r.convertedToPaidAt === null);
    if (!unpaid) return;

    await db
      .update(referralConversions)
      .set({ convertedToPaidAt: new Date() })
      .where(eq(referralConversions.id, unpaid.id));
  } catch (err) {
    console.error("[referral markConversionPaid] failed:", err);
  }
}
