/**
 * Escape a JSON string so it can be safely embedded inside an inline
 * <script type="application/ld+json"> block via dangerouslySetInnerHTML.
 *
 * JSON.stringify does NOT escape "</script>" by default. If any string
 * inside the payload ever contains that literal (user-generated titles,
 * comment bodies, imported metadata), the browser terminates the script
 * tag and interprets whatever follows as HTML — the classic content-XSS
 * payload for JSON-in-HTML.
 *
 * Also escape U+2028 / U+2029 which break older JS parsers when the
 * <script> content is later re-served / re-parsed by legacy user-agents.
 */
export function safeJsonLd(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/ /g, "\\u2028")
    .replace(/ /g, "\\u2029");
}
