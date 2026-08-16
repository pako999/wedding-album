/**
 * Hides Cookiebot's floating "CO" badge (and any stray consent dialog
 * chrome) while mounted. Rendered from the dashboard and admin layouts:
 * those screens are behind login, consent is collected on the public
 * pages, and the badge floats over real controls on phones.
 *
 * A <style> tag rather than a body class because Cookiebot injects its
 * widget at document level, OUTSIDE the app tree — descendant selectors
 * from a wrapper can never reach it, and this works in every browser
 * (no :has() dependency). The tag unmounts with the layout, so public
 * pages keep the widget.
 *
 * Consent stays manageable: the cookie-policy page and footer link keep
 * working — only the floating badge is hidden.
 */
export function HideCookiebot() {
  return (
    <style>{`
      #CookiebotWidget,
      .CookiebotWidget,
      #CookiebotDeclarationLink {
        display: none !important;
        visibility: hidden !important;
      }
    `}</style>
  );
}
