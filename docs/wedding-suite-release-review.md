# Wedding suite release review

Review date: 2026-10-25. Production base: `3f8e61906327d14a25b54fcc491eaa68444b3eba`.

## Existing workflows

Compared with the production base, these files are byte-for-byte unchanged: login middleware and root layout, Clerk provider, album creation, core database schema, album ownership/access checks, upload metadata persistence, checkout, Mollie and Paddle webhooks/clients, paid-plan application, entitlements, and the dependency lockfile. Stripe references remain backward compatible; active checkout uses Mollie. This is source evidence, not a live login/payment test.

The upload modal adds an optional suite attachment callback after successful metadata persistence. Existing uploads do not supply it. The upload-only success message, mobile sizing safeguards and production homepage assets are retained. Existing galleries are not automatically enrolled in the suite: its settings default to disabled. Missing optional settings, expired plans and downgraded plans keep the existing album QR destination.

Suite media now respects the existing album upload-only visibility restriction. Owners retain access for moderation. Source and manually corrected translations are preserved. AI failures save organizer text with an explicit translation warning.

## Deployment data protection

The prior production build script ran an entitlement backfill against `albums` and `user_plan_overrides`. That existing behavior was incompatible with a release that must not modify existing albums. The backfill now requires the explicit `--backfill-premium-entitlements` argument; ordinary builds never pass it. Schema checks and the existing additive wedding-table migration remain. The separate suite migration creates only suite tables/indexes and their foreign keys; it does not update existing album/photo rows. It is not automatically applied by the build, and it is not idempotent. Do not apply it blindly to an existing database.

## Verified locally

- Complete production build, TypeScript and all existing regression/localization/wedding/pricing checks.
- 20 suite tests, including payment-reference compatibility, duplicate callback behavior, original album-field preservation, missing optional settings, expired-plan QR fallback, upload-only suite privacy, and absence of album backfill updates in a normal production preflight. Database/provider-dependent tests use isolated mocks; no customer database was accessed.
- Real-component browser fixtures for 18 uploads in six languages and translation editing/guest preview. Network responses are intercepted; these do not exercise live storage or authentication.

## Blocking promotion

- Verify the four `wedding_suite_*` tables and constraints in the production database using read-only checks. If absent, prepare and apply the reviewed additive migration separately; do not modify existing albums/photos.
- Verify `WEDDING_INVITE_SECRET` is securely configured for Production and is at least 32 characters. Keep `WEDDING_SUITE_SEND_EMAILS=0` until recipient and delivery checks pass.
- Provide isolated staging bindings to validate actual Clerk login, existing-album opening, upload/moderation/password flows, invitation exchange, RSVP/capsule flows, and a test-mode Mollie payment plus return/webhook. This cloud environment has none of those application bindings and no Vercel management credential.
- The user reports `AI_GATEWAY_API_KEY` is Production-only. Enable it for Preview and redeploy before verifying the live translation provider. Passing mocked tests does not establish that the key, model and provider billing work.

The user's authorization to update `main` is conditional on the features working without disrupting albums, flows, login or payments. These external checks remain outstanding, so the release is held on the preview branch. No production migration, customer-data update, charge or invitation send was performed during this review.
