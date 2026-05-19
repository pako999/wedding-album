/**
 * Per-occasion theme system for the public guest album page.
 *
 * Each album has an `eventType` (`wedding | birthday | anniversary | party |
 * baptism | graduation | other`). Each event type gets its own dark hero
 * background hue and accent color so the page feels tailored to the occasion.
 */

export type EventTheme = {
  /** Dark background color for the album hero header. */
  heroBg: string;
  /** Accent color used for UI highlights (pills, active tabs, buttons, icons). */
  accent: string;
};

export const EVENT_THEMES: Record<string, EventTheme> = {
  wedding:     { heroBg: "#1A2238", accent: "#1E3A8A" }, // navy + champagne gold
  birthday:    { heroBg: "#2A1C24", accent: "#E06A2E" }, // deep grape + festive orange
  anniversary: { heroBg: "#2E1F26", accent: "#BD7A4E" }, // deep wine + rose-bronze
  party:       { heroBg: "#1E1A33", accent: "#7558E0" }, // deep indigo + violet
  baptism:     { heroBg: "#16252C", accent: "#5B93B5" }, // deep teal + soft blue
  graduation:  { heroBg: "#15203A", accent: "#3E6FB0" }, // midnight navy + academic blue
  other:       { heroBg: "#1E2329", accent: "#1E3A8A" }, // slate + bronze (current default)
};

/**
 * Returns the theme for a given event type, falling back to the `other`
 * theme when the type is missing or unrecognized.
 */
export function getEventTheme(eventType: string | null | undefined): EventTheme {
  if (eventType && EVENT_THEMES[eventType]) return EVENT_THEMES[eventType];
  return EVENT_THEMES.other;
}
