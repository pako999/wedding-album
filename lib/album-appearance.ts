import { db } from "@/lib/db";
import { albumAppearance, type AlbumAppearance } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Per-album branding + welcome screen. Reads NEVER throw: a deploy that
 * lands before the album_appearance migration renders every gallery
 * with the default look instead of breaking it.
 */

export const WELCOME_FONTS = ["elegant", "modern", "script", "classic"] as const;
export type WelcomeFont = (typeof WELCOME_FONTS)[number];

/** CSS stacks for the curated pairings — system fonts only, so the
 *  welcome screen never blocks on a webfont at a venue with bad wifi. */
export const WELCOME_FONT_STACKS: Record<WelcomeFont, string> = {
  elegant: "Georgia, 'Times New Roman', serif",
  modern: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  script: "'Snell Roundhand', 'Segoe Script', 'Brush Script MT', cursive",
  classic: "'Palatino Linotype', Palatino, 'Book Antiqua', serif",
};

export async function getAlbumAppearance(albumId: string): Promise<AlbumAppearance | null> {
  try {
    const row = await db.query.albumAppearance.findFirst({
      where: eq(albumAppearance.albumId, albumId),
    });
    return row ?? null;
  } catch (err) {
    console.warn("[appearance] lookup failed (table missing?):", err);
    return null;
  }
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Upsert appearance fields. Validates everything it accepts so a
 *  hand-crafted body can't store scripts or kilometre-long strings. */
export async function setAlbumAppearance(
  albumId: string,
  patch: Partial<Omit<AlbumAppearance, "albumId" | "updatedAt">>,
): Promise<boolean> {
  const clean: Record<string, unknown> = {};
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) || null : undefined;
  if ("logoUrl" in patch) clean.logoUrl = str(patch.logoUrl, 500);
  if ("backgroundUrl" in patch) clean.backgroundUrl = str(patch.backgroundUrl, 500);
  if ("welcomeBgUrl" in patch) clean.welcomeBgUrl = str(patch.welcomeBgUrl, 500);
  if ("welcomeTitle" in patch) clean.welcomeTitle = str(patch.welcomeTitle, 80);
  if ("welcomeText" in patch) clean.welcomeText = str(patch.welcomeText, 240);
  if ("welcomeButton" in patch) clean.welcomeButton = str(patch.welcomeButton, 40);
  if (typeof patch.welcomeEnabled === "boolean") clean.welcomeEnabled = patch.welcomeEnabled;
  if (typeof patch.accentColor === "string") {
    clean.accentColor = HEX.test(patch.accentColor) ? patch.accentColor : null;
  } else if ("accentColor" in patch) clean.accentColor = null;
  if (typeof patch.welcomeFont === "string" && (WELCOME_FONTS as readonly string[]).includes(patch.welcomeFont)) {
    clean.welcomeFont = patch.welcomeFont;
  }
  if (Object.keys(clean).length === 0) return true;
  try {
    await db
      .insert(albumAppearance)
      .values({ albumId, ...clean, updatedAt: new Date() })
      .onConflictDoUpdate({ target: albumAppearance.albumId, set: { ...clean, updatedAt: new Date() } });
    return true;
  } catch (err) {
    console.error("[appearance] write failed:", err);
    return false;
  }
}
