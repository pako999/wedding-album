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
