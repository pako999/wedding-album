# Mobile width guards — 25 October 2026

Reported: the wedding page's hero, price card and header extend beyond the right edge in iPhone Safari. Normal-width live Chromium inspection measured a 390px document/body and no overflowing boxes; it did not reproduce that exact Safari screenshot.

The mobile hero used an implicit auto grid track and its children retained automatic minimum widths. Set an explicit single `minmax(0,1fr)` column below desktop, minimum widths of zero, full-width container bounds and wrapping for hero copy/pricing/banner. Bound all three public header variants to the viewport minus their actual margins and allow the logo flex item to shrink, preserving the menu button. Explicit document width and text-size adjustment prevent incidental browser text inflation; browser zoom remains enabled.

The old package test mocked the header/footer and checked only document scrollWidth, which cannot detect content clipped by the global overflow guard. The test now renders real header/footer layout (only auth calls/account controls and Next image/router shell are substituted), checks header/hero/price box bounds and menu reachability, and covers all six languages at 320/375/390/430/1280px with default and 20px root text. It serves the actual bundled font files and waits for font loading before measuring. CI runs both Chromium and WebKit from the pinned browser image.

No album, authentication, camera, price calculation or payment logic changes. The exact user's iPhone viewport/zoom state remains unobserved.
