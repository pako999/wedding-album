/**
 * Escape a JSON string so it can be safely embedded inside an inline
 * <script type="application/ld+json"> block via dangerouslySetInnerHTML.
 *
 * JSON.stringify does NOT escape "</script>" by default. If any string
 * inside the payload contains that literal (user-generated titles,
 * comment bodies, imported metadata), the browser terminates the script
 * tag and interprets whatever follows as HTML — the classic content-XSS
 * payload for JSON-in-HTML.
 *
 * Also escape U+2028 / U+2029 which older JS parsers treat as literal
 * newlines. Matched via Unicode escape in the regex source so the .ts
 * file itself stays ASCII — Turbopack's lexer errors on a bare LINE
 * SEPARATOR inside a `/.../` literal.
 */
export function safeJsonLd(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
