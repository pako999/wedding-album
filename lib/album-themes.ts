/**
 * Owner-chosen visual themes for the public guest album page.
 *
 * Each album stores a `theme` id (see `albums.theme`). The owner picks one of
 * the 10 presets below from the Settings tab. Each theme provides a dark hero
 * background hue and an accent color used across the album UI.
 */

export type AlbumTheme = {
  /** Stable identifier stored in `albums.theme`. */
  id: string;
  /** Slovenian display name shown in the Settings theme picker. */
  name: string;
  /** Dark background color for the album hero header. */
  heroBg: string;
  /** Accent color used for UI highlights (pills, active tabs, buttons, icons). */
  accent: string;
};

export const ALBUM_THEMES: AlbumTheme[] = [
  { id: "navy",       name: "Polnočno modra", heroBg: "#1A2238", accent: "#1E3A8A" },
  { id: "champagne",  name: "Šampanjec",      heroBg: "#2A2419", accent: "#B08D4F" },
  { id: "rose",       name: "Pudrasto roza",  heroBg: "#2E1F26", accent: "#BD5E78" },
  { id: "sage",       name: "Žajbelj",        heroBg: "#1E2A24", accent: "#5E8A70" },
  { id: "charcoal",   name: "Oglje",          heroBg: "#1C1C1F", accent: "#6B6B73" },
  { id: "plum",       name: "Sliva",          heroBg: "#251A2E", accent: "#8257B0" },
  { id: "terracotta", name: "Terakota",       heroBg: "#2B1E18", accent: "#B85F38" },
  { id: "ocean",      name: "Ocean",          heroBg: "#102A2E", accent: "#2E8A8A" },
  { id: "burgundy",   name: "Bordo",          heroBg: "#2A1518", accent: "#A23F52" },
  { id: "emerald",    name: "Smaragd",        heroBg: "#15241C", accent: "#2E9460" },
];

/**
 * Returns the theme for a given id, falling back to the default `navy`
 * theme when the id is missing or unrecognized.
 */
export function getAlbumTheme(id: string | null | undefined): AlbumTheme {
  return ALBUM_THEMES.find((t) => t.id === id) ?? ALBUM_THEMES[0];
}
