# GuestCam wedding package — 26 September 2026

Target: pako999/wedding-album / Vercel prj_EDblP7nig2nLLZTQlxnrkusvxoSj. Not a JuntaFotos deployment.

The existing premium plan retains its ID, EUR 99 price, purchase mapping and existing benefits. Its display name is localized: Poročni premium (sl), Vjenčani premium (hr), Venčani premium (sr), Wedding Premium (en), Hochzeits-Premium (de), Premium para bodas (es). Film Studio Premium is a different product and remains unchanged.

## Experience

Album administration has a Poročni paket tab. The owner can enable the experience, configure schedule/menu/photo challenges and pause song requests. Existing albums stay unchanged until enabled. Guests reach /[slug]/wedding through their gallery; existing publication/password controls apply. The separate /[slug]/dj link uses a random revocable album-scoped bearer token in the URL fragment, hashed at rest. DJ polling is opt-in, visible-tab-only, and has no background jobs.

Bingo uses the existing uploader and storage providers. A validated challenge ID is passed through every save path. Photo metadata and bingo attribution are inserted as one Neon HTTP batch transaction. Counts and thumbnails include only published photos, never pending/rejected uploads. A deleted photo removes its completion via a foreign key. Video uploads are excluded from bingo.

## Schema rollout

scripts/migrations/20260926-wedding-premium.sql adds wedding_settings, wedding_song_requests and wedding_bingo_submissions, with indexes and cascade references. It does not alter existing albums/photos/payment columns. npm run db:migrate:wedding runs an idempotent, advisory-lock-protected deployment preflight using this project's existing DATABASE_URL. Missing schema/columns fail the deployment; request handlers never run DDL. Do not run drizzle-kit push --force.

## Public routes

/porocni-paket, /hr/vjencani-paket, /sr/vencani-paket, /en/wedding-package, /de/hochzeitspaket, /es/paquete-boda. Serbian/Spanish public URLs keep the existing .rs/.es domain routing. Hreflang, sitemap and navigation are included. Private experience pages remain noindex.

The homepage retains its original hero, images, text, calls to action, navigation and video placement in all six languages. Only the Premium pricing card is updated: localized wedding name, schedule/menu/song requests/photo bingo and a link to the separate wedding-package page. The new wedding page and private wedding features remain separate from the homepage layout.

## Verification

npm run test:regression; npm run audit:i18n; npm run test:wedding; npx tsc --noEmit. The isolated PostgreSQL CI fixture tests repeated migration, published-only completion, isolation, constraints, atomic failure and deletion cleanup. Browser fixtures use mocked API responses and never write to customer albums. Production build logs must confirm the actual three-table migration before promotion.
