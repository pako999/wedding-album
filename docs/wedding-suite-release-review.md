# Wedding suite release review

Review date: 2026-10-25. Production base: `3f8e61906327d14a25b54fcc491eaa68444b3eba`.

## Existing workflows

Compared with the production base, login middleware and root layout, Clerk provider, album creation, album ownership/access checks, upload metadata persistence, Paddle integration, paid-plan application, entitlements and the dependency lockfile remain unchanged. Core album/photo schema definitions are retained. Stripe references remain backward compatible; active checkout uses Mollie. This is source evidence, not a live login/payment test.

The newly requested €189 standard / €132.30 launch price intentionally changes premium checkout, Mollie offer metadata/reconciliation and invoice pricing. The shared twenty-place campaign requires the separate migration described in `wedding-launch-offer.md`, including exact-decimal invoice storage. Historical payments are not repriced, and other plan prices are retained. No campaign migration has been run against staging/production from this cloud task.

The upload modal adds an optional suite attachment callback after successful metadata persistence. Existing uploads do not supply it. The upload-only success message, mobile sizing safeguards and production homepage assets are retained. Existing galleries are not automatically enrolled in the suite: its settings default to disabled. Missing optional settings, expired plans and downgraded plans keep the existing album QR destination.

Suite media now respects the existing album upload-only visibility restriction. Owners retain access for moderation. Source and manually corrected translations are preserved. AI failures save organizer text with an explicit translation warning.

## Deployment data protection

The prior production build script ran an entitlement backfill against `albums` and `user_plan_overrides`. That existing behavior was incompatible with a release that must not modify existing albums. The backfill now requires the explicit `--backfill-premium-entitlements` argument; ordinary builds never pass it. Schema checks and the existing additive wedding-table migration remain. The separate suite migration creates only suite tables/indexes and their foreign keys; it does not update existing album/photo rows. It is not automatically applied by the build, and it is not idempotent. Do not apply it blindly to an existing database.

## Verified locally

- Complete production build, TypeScript and all existing regression/localization/wedding/pricing checks.
- 31 suite/checkout tests, including payment-reference compatibility, duplicate callback behavior, original album-field preservation, missing optional settings, expired-plan QR fallback, upload-only suite privacy, absence of album backfill updates in a normal production preflight, page-builder validation/translation/privacy, exact pricing and campaign reservations. Payment-provider responses are mocked; no customer database was accessed.
- Real-component browser fixtures for 18 uploads in six languages and translation editing/guest preview. Network responses are intercepted; these do not exercise live storage or authentication.
- Website builder browser fixture for categories, typed fields, fonts/colors, arrow/drag ordering, save/reload, language editing, guest output and hidden categories at mobile/desktop widths. Designs use an optional property of existing suite JSON; old configurations and album pages are unchanged by default.
- Real suite-route tests and the real launch-offer SQL executed on an isolated PostgreSQL engine. Marketing-page checks cover all six languages, fifteen feature groups, three visual guides, shared inventory across cookie jars, exhaustion and unavailable-inventory fallback. Checkout UI checks cover launch pricing, stale-price protection and decimal discounted invoice amounts.
- Actual browser video recording with synthetic camera/audio, single-stream protection for rapid clicks, stopped tracks and denied/unsupported recording upload fallback. Guide images also returned HTTP 200 through the real Next.js image optimizer.

## Blocking promotion

- Verify the four `wedding_suite_*` tables and constraints in the production database using read-only checks. If absent, prepare and apply the reviewed additive migration separately; do not modify existing albums/photos.
- Review/apply the launch inventory and exact-decimal invoice migration to the isolated preview database, then verify the actual campaign there before considering Production. The fallback is €189 with no availability count until inventory is verified.
- Verify `WEDDING_INVITE_SECRET` is securely configured for Production and is at least 32 characters. Keep `WEDDING_SUITE_SEND_EMAILS=0` until recipient and delivery checks pass.
- Provide isolated staging bindings to validate actual Clerk login, existing-album opening, upload/moderation/password flows, invitation exchange, RSVP/capsule flows, and a test-mode Mollie payment plus return/webhook. This cloud environment has none of those application bindings and no Vercel management credential.
- The user reports `AI_GATEWAY_API_KEY` is Production-only. Enable it for Preview and redeploy before verifying the live translation provider. Passing mocked tests does not establish that the key, model and provider billing work.

The user's authorization to update `main` is conditional on the features working without disrupting albums, flows, login or payments. These external checks remain outstanding, so the release is held on the preview branch. No production migration, customer-data update, charge or invitation send was performed during this review.
