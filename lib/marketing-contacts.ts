import { db } from "@/lib/db";
import { marketingContacts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export interface MarketingContact {
  email: string;
  unsubscribeToken: string;
  unsubscribedAt: Date | null;
}

/**
 * Upsert a marketing contact by email and return its stable unsubscribe token
 * and current opt-out state. Idempotent: an existing row keeps its token and
 * unsubscribedAt (we never silently re-subscribe someone who opted out), while
 * clerkUserId/locale are refreshed to the latest known values.
 *
 * The caller decides whether to send based on `unsubscribedAt`.
 */
export async function ensureMarketingContact(
  email: string,
  clerkUserId: string | null,
  locale: string | null,
): Promise<MarketingContact> {
  const normalized = email.trim().toLowerCase();
  const rows = await db
    .insert(marketingContacts)
    .values({ email: normalized, clerkUserId, locale })
    .onConflictDoUpdate({
      target: marketingContacts.email,
      // Refresh identity/locale but NEVER touch unsubscribedAt or the token.
      set: { clerkUserId, locale },
    })
    .returning({
      email: marketingContacts.email,
      unsubscribeToken: marketingContacts.unsubscribeToken,
      unsubscribedAt: marketingContacts.unsubscribedAt,
    });

  return rows[0];
}

/** Resolve a marketing contact by its opaque unsubscribe token. */
export async function marketingContactByToken(
  token: string,
): Promise<{ id: string; locale: string | null } | null> {
  const rows = await db
    .select({ id: marketingContacts.id, locale: marketingContacts.locale })
    .from(marketingContacts)
    .where(eq(marketingContacts.unsubscribeToken, token))
    .limit(1);
  return rows[0] ?? null;
}

/** Stamp a contact as opted out of promotional email (idempotent). */
export async function unsubscribeMarketingContact(id: string): Promise<void> {
  await db
    .update(marketingContacts)
    .set({ unsubscribedAt: sql`COALESCE(${marketingContacts.unsubscribedAt}, NOW())` })
    .where(eq(marketingContacts.id, id));
}
