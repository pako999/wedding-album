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

// Unified black-blue palette — every event type uses the same colours as the
// rest of the site. The per-type structure is kept so it can be re-themed later.
const NAVY: EventTheme = { heroBg: "#1A2238", accent: "#1E3A8A" };

export const EVENT_THEMES: Record<string, EventTheme> = {
  wedding:     NAVY,
  birthday:    NAVY,
  anniversary: NAVY,
  party:       NAVY,
  baptism:     NAVY,
  graduation:  NAVY,
  other:       NAVY,
};

/**
 * Returns the theme for a given event type, falling back to the `other`
 * theme when the type is missing or unrecognized.
 */
export function getEventTheme(eventType: string | null | undefined): EventTheme {
  if (eventType && EVENT_THEMES[eventType]) return EVENT_THEMES[eventType];
  return EVENT_THEMES.other;
}
