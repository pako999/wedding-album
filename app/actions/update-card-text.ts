"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { albums } from "@/lib/db/schema";

export type UpdateCardTextResult = { ok: true } | { ok: false; error: string };

/**
 * Save custom print-card text. Premium plan only.
 * Empty strings are stored as null so the template default is used.
 */
export async function updateCardText(
  slug: string,
  text: { headline: string; subtitle: string; cta: string },
): Promise<UpdateCardTextResult> {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session.userId;
  } catch {
    return { ok: false, error: "Niste prijavljeni." };
  }
  if (!userId) return { ok: false, error: "Niste prijavljeni." };

  const album = await db.query.albums.findFirst({ where: eq(albums.slug, slug) });
  if (!album || album.ownerClerkId !== userId) {
    return { ok: false, error: "Galerija ni najdena." };
  }
  if (album.plan !== "premium") {
    return { ok: false, error: "Urejanje besedila je na voljo samo v paketu Premium." };
  }

  const clean = (v: string) => {
    const t = v.trim();
    return t.length > 0 ? t.slice(0, 200) : null;
  };

  await db
    .update(albums)
    .set({
      cardHeadline: clean(text.headline),
      cardSubtitle: clean(text.subtitle),
      cardCta: clean(text.cta),
      updatedAt: new Date(),
    })
    .where(eq(albums.id, album.id));

  revalidatePath(`/dashboard/${slug}/print`);
  return { ok: true };
}
