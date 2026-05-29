/**
 * Structured content model for the four legal documents
 * (privacy, terms, gdpr, cookies). All six languages of every
 * document are written against this schema and rendered by a
 * single shared <LegalPage> component, which guarantees pixel
 * parity with the Slovenian master design across the whole site.
 */

export type LegalKind = "privacy" | "terms" | "gdpr" | "cookies" | "refund";

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; headers: [string, string]; rows: [string, string][] }
  | { type: "cards"; items: { title: string; desc: string }[] }
  | { type: "contactCard"; lines: string[] }
  | { type: "callout"; text: string }
  | { type: "link"; text: string; href: string };

export interface Section {
  title: string;
  blocks: Block[];
}

export interface LegalDoc {
  /** Page H1, e.g. "Politika zasebnosti" */
  heading: string;
  /** "Pravni dokument" badge above the H1 */
  eyebrow: string;
  /** "Last updated: …" line under the H1 */
  lastUpdated: string;
  /** Intro paragraph above section 1 (allows inline HTML-light markup
   *  for &ldquo; / &rdquo; — kept as a plain string to dodge JSX escaping). */
  intro: string;
  /** Document body */
  sections: Section[];
}
