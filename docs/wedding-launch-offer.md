# Wedding package launch offer

Standard price: **€189**. Launch price: **€113.40**, exactly 40% off, for **8 customer accounts**. One launch purchase per account. Existing albums, paid entitlements and historical payment amounts are not repriced.

## Header, prices and returning visitors

All six homepage headers and the shared wedding-page header show a gold offer strip after a verified quote. Pricing cards show the 40% badge, crossed-out €189 and €113.40. An optional `gc_wedding_offer_seen` cookie remembers the first visit for 30 days only after Cookiebot marketing consent; later visits can show a welcome-back greeting. It stores a campaign ID and timestamp, no account data. Declining consent removes it. Returning visitors see current shared inventory, never an invented drop in stock.

## Shared inventory and checkout

`wedding_offer_slots` contains exactly eight rows for campaign `wedding-launch-189-40-eight-20261025`. Page views and cookies never decrement it. Public pages show a launch price/count only after the server verifies the campaign. Missing/unavailable/uninitialized inventory shows €189 and no invented count. The browser refreshes shared data every 30 seconds and on focus; private checkout quotes also check the logged-in account's eligibility. The Serbian RSD estimate follows the current EUR quote; all payments remain in EUR.

A checkout reserves a row atomically using `FOR UPDATE SKIP LOCKED`, with a unique customer index. Both card and invoice checkouts use the same inventory. The server checks the displayed maximum before creating a payment or invoice; lost availability returns `price_changed` and refreshes the checkout. Card requests use the reservation UUID as the provider idempotency key and carry it in server-created metadata.

An authenticated Mollie payment lookup confirms paid/cancelled/expired/failed status before settling inventory. Duplicate callbacks do not consume extra places. Only a verified unpaid cancellation/expiry/failure releases a reservation; refunds do not reopen a launch purchase. An uncertain network failure keeps the reservation until reconciled, rather than risk overselling. A definitive 4xx rejection can release an unbound reservation. Invoice places are settled or released through the existing authenticated admin paid/cancel actions. Existing invoices remain payable if the optional campaign table is absent.

Other discount codes keep their existing eligibility rules; premium calculations now preserve cents. Other plan prices and their existing whole-euro discount rules are retained. A pending launch checkout/invoice is explained to the customer instead of silently opening a second discounted payment.

## Production activation

Review `scripts/migrations/20261025-wedding-eight-offer.sql`. It changes `bank_orders.plan_price` from integer euros to `numeric(12,2)` so €113.40 is stored exactly, preserving historical numerical values. It creates/seeds the campaign inventory idempotently. It does not change album/photo rows. The seed does not reset existing claims on repeat runs.

Configure an **isolated staging** `DATABASE_URL` securely and set `WEDDING_OFFER_DB_HOST` to its reviewed hostname. Then run:

```sh
cd /workspace/wedding-album
node scripts/migrate-wedding-launch-offer.mjs --apply
```

The script refuses an unreviewed/mismatched hostname or a different Vercel project. The user explicitly requested this live eight-place campaign. On Vercel Production, `prepare-wedding-offer-production.mjs` activates it only for the verified GuestCam project on main using its existing production database binding. It checks invoice storage, applies the transaction with a five-second lock timeout and preserves prior campaigns and existing reservations. Activation failure stops the build. This never updates album/photo rows. The cloud task has no directly connected staging/production database. Preview builds can bootstrap inventory only through `prepare-wedding-offer-preview.mjs`: the Vercel project and exact preview branch must match, DATABASE_URL must match the existing WEDDING_SUITE_DB_HOST pin, the database must contain no albums beyond at most the synthetic wedding-suite-demo, and there must be zero bank invoices. Any failed check skips initialization. Production never takes this path. The initializer is covered by guard tests and an actual PostgreSQL test proving that rebuilds do not reset a used place. Until the deployed API reports verified inventory, the offer stays unverified and the package displays its standard price. Production promotion still needs the release checks in `wedding-suite-release-review.md`.

For any uncertain reservation, inspect the provider/order record before changing it. Never release a place merely because a cookie disappeared or a local timer elapsed. Invoice abandonment requires an admin-confirmed cancellation. Do not clear paid rows or reseed a new campaign to fabricate availability.

## Validation and limits

- Full build, TypeScript, existing regressions/localization/wedding checks, offer audit and 36 suite/checkout tests.
- `node scripts/wedding-offer-database-check.cjs`: actual PostgreSQL engine; forty competing claims capped at eight; same-account collisions; idempotent paid/cancel processing; exact decimal invoices; historical values preserved; existing albums unchanged; safe behavior when inventory is missing.
- `node scripts/wedding-suite-database-check.cjs`: real suite routes and Drizzle/PostgreSQL queries for authorization, signed invitations, RSVP capacity, seating, moderation, video/foreign-photo handling, capsules, language preferences, preview mail and album passwords. Synthetic identity/rate-limit/mail transport substitutes are used; no real Clerk login, mail delivery or customer database access is claimed.
- Both database scripts use an isolated `@electric-sql/pglite@0.3.14` installation, without changing application dependencies: `npm install --prefix /tmp/wedding-db-check --cache /workspace/.npm-cache --no-audit --no-fund @electric-sql/pglite@0.3.14`. `PGLITE_MODULE_PATH` can select another installation of the same test dependency.
- After building, run `wedding-package-browser-check.cjs`, `wedding-offer-checkout-browser-check.cjs`, `wedding-page-builder-browser-check.cjs`, `wedding-translation-browser-check.cjs`, `wedding-video-browser-check.cjs` and `upload-modal-browser-check.cjs` from `scripts/`. Playwright is supplied by the cloud runtime. The recorder uses synthetic camera/audio and verifies track cleanup, duplicate-click protection and denied/unsupported upload fallback. API responses are intercepted; real provider charging and Clerk sessions remain unverified.

The six-language wedding pages now list all fifteen feature groups, plus gallery/storage/wall/Film Studio benefits. Three visual guides use existing wedding photography and screenshots from the real page editor. Homepage price cards, checkout, structured data, current email/SEO text and package articles use the new pricing. Static sources show the standard price rather than an unverified or expired promotion. Regenerate the two editor guide screenshots explicitly with `WEDDING_GUIDE_OUTPUT_DIR=/workspace/wedding-album/public/hero node scripts/wedding-page-builder-browser-check.cjs`.
