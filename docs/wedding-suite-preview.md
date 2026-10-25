# Multilingual wedding suite — preview

Branch: `feat/wedding-suite-multilingual-preview`. Not merged into main.

## Included

- Moderated guestbook with optional gallery media and a print / Save as PDF view.
- Video wishes with a 60-second camera recorder, file upload fallback, and existing GuestCam upload/playback infrastructure.
- Personal table lookup, an optional seating map, and organizer seat capacities.
- Personal signed invitations, RSVP, named companions, meal selection and private notes.
- Time capsule whose contents are withheld from guest and organizer API responses until the opening time. Once messages exist, its opening cannot be moved earlier.
- Couple story with translated milestones and photographs.
- Translated travel / accommodation information and HTTPS links.
- A thank-you page and recipient-language email drafts.

All system interface text and four email types are supplied in Slovenian, Croatian, Serbian, English, German and Spanish. Organizers edit custom content per language. Missing custom translations are identified instead of being presented in another language.

New settings default to the organizer's app language. Every invitee has their own notification language. A guest can change language and notification preference in their personal form, including after the RSVP deadline; subsequent messages use the stored guest preference.

## Test environment

The branch has its own empty Neon database with current schema and synthetic demo data. It does not contain production customer records. Branch-specific Vercel variables select it; new preview endpoints fail closed if the configured database host does not match.

Demo slug: `wedding-suite-demo`. Guest identity and email are synthetic. Admin access continues to require the normal authenticated admin account and admin password. Owner authorization is unchanged.

`WEDDING_SUITE_SEND_EMAILS=0`: every new wedding email is saved as an HTML preview. The send path additionally requires the production environment and an explicit enable flag. No real invitations are sent by preview tests.

The suite uses separate tables; no core album/photo columns were added. `scripts/migrations/20261024-wedding-suite.sql` is prepared for schema review. It is not automatically applied to production by this branch. Invitation signing requires `WEDDING_INVITE_SECRET` (32+ characters) in the target environment. Never merge and enable sending without reviewing the schema, environment and recipients.

## Admin fixes

The album plan selector, overview and user badges now use the public wedding name (`premium` → `Poročni premium` in Slovenian). Stored plan IDs, billing and entitlement mappings remain the same.

Production logs confirmed that Admin → E-mails fails with Resend `401 restricted_api_key`: the existing key can send but cannot list messages. The page now supports a separate server-only `RESEND_HISTORY_API_KEY`, with explicit configuration instructions when it is missing/restricted. History requires a Full access key configured directly in the hosting secrets for the target environment. The send-only key does not need to be replaced. That credential is not included in source.

## Validation

- `npm run test:wedding-suite`
- `npm run test:wedding`
- `npm run test:regression`
- `npm run audit:i18n`
- `npm run test:premium-offer`
- `npx tsc --noEmit`

Preview browser verification is required for invitation exchange, guest preferences, RSVP, private table lookup, contributions and locked capsules. The camera recorder requires browser camera/microphone permission; file upload remains available when recording is unsupported.

## Deployment compatibility checks (2026-10-25)

The latest production (`3f8e619`) and preview (`6a21537`) have successful GitHub deployment statuses. Earlier preview commits temporarily changed dashboard callers before updating the component's props; one also removed most of the dashboard source. The latest preview restores that source. Hosting build logs are still needed to establish each historical failure's exact cause.

This follow-up restores the production hero asset and mobile upload sizing safeguards in the preview, and restores and connects all six upload-only success messages. The suite's media attachment callback is retained. Preview builds now derive QR/share origins from `VERCEL_URL`; production continues to use its canonical origin. Local development defaults to the actual server port, 3001.

Verified locally: locked dependency installation; the complete build (206 pages); TypeScript; all existing regression, locale, wedding and pricing checks; 11 wedding-suite tests, including payment-reference compatibility and idempotent upgrades preserving album data. `node scripts/upload-modal-browser-check.cjs` exercises 18 uploads across all six languages at 320px using the actual component and built CSS, with intercepted storage and metadata requests. It verifies normal, upload-only and moderated success messages and the suite attachment callback. Playwright is required separately, as with the existing browser scripts.

These checks do not establish live payment, authentication, database or storage readiness. This cloud machine has no application service credentials. Production-mode requests through Clerk return a missing-publishable-key error here. The production server serves the restored hero and its optimized image successfully; development `/llms.txt` returns 200 and unconfigured checkout returns 503 as expected. Complete authenticated album/upload and test-mode payment/webhook checks against the isolated preview services before promotion. No production database migrations, real charges or invitation sends were performed.

## Organizer text translation

Saving with automatic translation selected fills missing text in Slovenian, Croatian, Serbian, English, German and Spanish through Vercel AI Gateway. This covers menu, timeline and bingo titles/descriptions, welcome text, invitation and thank-you copy, story/travel entries, and RSVP meal options. Guests see the saved text in their selected language; guest requests do not call AI. Guest identity/contact fields, table identities, event date/time fields, media and private guest contributions are not translation inputs.

Organizers can choose the text language and correct each translation. Existing nonempty translations are preserved on subsequent saves, including when the source changes. Clear a target translation and save to regenerate it, or disable automatic translation and enter it manually. Legacy menu/timeline rows remain compatible; optional language maps live in the existing JSONB columns, with no database migration. Old untranslated rows continue to display their original text until translated.

The server needs `AI_GATEWAY_API_KEY`, using `openai/gpt-4.1-mini` at `https://ai-gateway.vercel.sh/v1/chat/completions`. The key is never sent to the browser. Ownership, premium eligibility, input limits and rate limits are checked before the call. AI responses are validated completely before being applied; translations cannot replace row IDs, links or original text. Requests time out after 45 seconds. Missing keys, provider failures, oversized content and invalid responses save the organizer's original draft with an explicit incomplete-translation warning. Large sets above 60,000 input characters across target languages must be translated manually or reduced before retrying.

The user reports the key is **Production only**. Enable it for the preview branch in Vercel and redeploy before live-provider testing. No live AI request was verified from the cloud machine. Mock-provider and authenticated-route tests cover translation completeness, original/manual text preservation, malformed responses, missing keys and authorization. `node scripts/wedding-translation-browser-check.cjs` exercises the real editor and guest preview with intercepted API responses, including language switching, corrections and failure warnings. Run after the build with the same Playwright prerequisites as the upload browser check.

## Wedding website editor

The timeline/menu/bingo editor now uses a category dropdown so organizers work on one category at a time. In the suite editor, the wedding page builder adds ceremony, reception, travel, accommodation and custom categories. Each category supports heading, text and HTTPS-link fields, with arrow controls and drag-and-drop for field order. Categories can be reordered, removed or hidden. Hidden categories are removed from public API responses.

Choose a page title, heading/body font, background/text/accent colors, and optional per-field font/color overrides. Four curated font families use existing fonts or system fallbacks, without new font downloads. The live content preview and guest page share the same renderer. Style reset preserves all text and categories. Choose the content language to edit translations; automatic translation also fills missing builder text while preserving corrections, styling, URLs and order.

Designs are an optional `page` property of the existing suite configuration JSON, requiring no additional database migration. Existing saved configurations keep their appearance until a design is saved. Validation allows only known field/category/font types, six-digit hex colors and HTTPS URLs without credentials, with a maximum of 12 categories and 12 fields per category. Raw HTML/CSS and script links are not supported. Unfinished links remain inert in the live preview.

Save using the suite's existing Save button. The full build and 24 suite tests pass. After building, run `node scripts/wedding-page-builder-browser-check.cjs` for real-component tests of category/field editing, both reorder methods, save/reload, language switching, guest styling and visibility. The fixture intercepts service responses and checks mobile/desktop widths; it does not establish live database/authentication readiness. Production promotion remains blocked as described in `wedding-suite-release-review.md`.
