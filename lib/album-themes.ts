/**
 * Owner-chosen visual themes for the public guest album page.
 *
 * Each album stores a `theme` id (see `albums.theme`). The owner picks one of
 * the presets below from the Settings tab. Each theme provides a dark hero
 * background hue and an accent color used across the album UI.
 *
 * Themes are tagged with the event types they suit best (`events`) — the
 * Settings picker surfaces matching themes first ("Priporočene za vaš
 * dogodek") so a baby shower isn't defaulted to wedding navy.
 *
 * Color constraints (both are used on the live gallery):
 *  • heroBg — must stay DARK: the hero renders white text over it.
 *  • accent — mid-dark: used as button background with white text and as
 *    text on a ~8% tint, so it needs contrast in both directions.
 */

/** Event ids as persisted in `albums.event_type`. */
export type AlbumEventType =
  | "wedding"
  | "birthday"
  | "anniversary"
  | "party"
  | "baptism"
  | "graduation"
  | "baby_shower"
  | "business"
  | "other";

export type AlbumTheme = {
  /** Stable identifier stored in `albums.theme`. */
  id: string;
  /** Slovenian display name shown in the Settings theme picker. */
  name: string;
  /** Dark background color for the album hero header. */
  heroBg: string;
  /** Accent color used for UI highlights (pills, active tabs, buttons, icons). */
  accent: string;
  /** Event types this theme is recommended for (picker grouping). */
  events: AlbumEventType[];
};

export const ALBUM_THEMES: AlbumTheme[] = [
  // ── Classics (original 10 — ids must never change, they're in the DB) ──
  { id: "navy",       name: "Polnočno modra", heroBg: "#1A2238", accent: "#1E3A8A", events: ["wedding", "graduation", "business"] },
  { id: "champagne",  name: "Šampanjec",      heroBg: "#2A2419", accent: "#B08D4F", events: ["wedding", "anniversary"] },
  { id: "rose",       name: "Pudrasto roza",  heroBg: "#2E1F26", accent: "#BD5E78", events: ["wedding", "anniversary", "birthday"] },
  { id: "sage",       name: "Žajbelj",        heroBg: "#1E2A24", accent: "#5E8A70", events: ["wedding", "baby_shower", "baptism"] },
  { id: "charcoal",   name: "Oglje",          heroBg: "#1C1C1F", accent: "#6B6B73", events: ["business", "party", "other"] },
  { id: "plum",       name: "Sliva",          heroBg: "#251A2E", accent: "#8257B0", events: ["party", "birthday"] },
  { id: "terracotta", name: "Terakota",       heroBg: "#2B1E18", accent: "#B85F38", events: ["birthday", "party", "other"] },
  { id: "ocean",      name: "Ocean",          heroBg: "#102A2E", accent: "#2E8A8A", events: ["party", "business", "graduation"] },
  { id: "burgundy",   name: "Bordo",          heroBg: "#2A1518", accent: "#A23F52", events: ["anniversary", "wedding"] },
  { id: "emerald",    name: "Smaragd",        heroBg: "#15241C", accent: "#2E9460", events: ["graduation", "business", "party"] },

  // ── Event-tailored additions ──────────────────────────────────────────
  // Baby shower / krst — soft pastels on a deep muted base.
  { id: "babyblue",   name: "Baby modra",     heroBg: "#1E2A3A", accent: "#5B8FBF", events: ["baby_shower", "baptism", "birthday"] },
  { id: "babypink",   name: "Baby roza",      heroBg: "#33222B", accent: "#C4718F", events: ["baby_shower", "birthday"] },
  // Birthday / party — warm celebratory gold-orange.
  { id: "sunshine",   name: "Sonček",         heroBg: "#2E2414", accent: "#C9902E", events: ["birthday", "party", "baby_shower"] },
  // Krst / baby shower / romantic weddings — gentle lavender.
  { id: "lavender",   name: "Sivka",          heroBg: "#272438", accent: "#8B7FC7", events: ["baptism", "baby_shower", "wedding"] },
  // Business / corporate events — restrained steel blue.
  { id: "slate",      name: "Poslovna",       heroBg: "#1B222B", accent: "#4A6785", events: ["business", "graduation", "other"] },
];

/**
 * Returns the theme for a given id, falling back to the default `navy`
 * theme when the id is missing or unrecognized.
 */
export function getAlbumTheme(id: string | null | undefined): AlbumTheme {
  return ALBUM_THEMES.find((t) => t.id === id) ?? ALBUM_THEMES[0];
}

/**
 * Split themes into (recommended-for-this-event, the-rest) for the
 * Settings picker. Unknown event types recommend nothing — the picker
 * then renders a single flat list.
 */
export function themesForEvent(eventType: string | null | undefined): {
  recommended: AlbumTheme[];
  others: AlbumTheme[];
} {
  const et = (eventType ?? "") as AlbumEventType;
  const recommended = ALBUM_THEMES.filter((t) => t.events.includes(et));
  const others = ALBUM_THEMES.filter((t) => !t.events.includes(et));
  return { recommended, others };
}
