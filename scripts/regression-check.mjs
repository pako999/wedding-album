import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

async function read(file) {
  return fs.readFile(path.join(root, file), "utf8");
}

async function readTsxTree(directory) {
  const absolute = path.join(root, directory);
  const entries = await fs.readdir(absolute, { withFileTypes: true });
  const chunks = await Promise.all(entries.map(async (entry) => {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) return readTsxTree(relative);
    return entry.name.endsWith(".tsx") ? read(relative) : "";
  }));
  return chunks.join("\n");
}

function requireMatch(name, text, pattern, hint) {
  if (!pattern.test(text)) {
    throw new Error(`FAIL: ${name} — ${hint}`);
  }
  console.log(`PASS: ${name}`);
}

function requireAbsent(name, text, pattern, hint) {
  if (pattern.test(text)) {
    throw new Error(`FAIL: ${name} — ${hint}`);
  }
  console.log(`PASS: ${name}`);
}

const files = {
  legacyUpload: await read("app/api/albums/[slug]/upload/route.ts"),
  uploadUrl: await read("app/api/albums/[slug]/upload-url/route.ts"),
  saveUpload: await read("app/api/albums/[slug]/save-upload/route.ts"),
  legacyGateway: await read("app/api/albums/[slug]/bunny-upload/route.ts"),
  legacyDownload: await read("app/api/albums/[slug]/download/route.ts"),
  albumPage: await read("app/[slug]/page.tsx"),
  albumDashboardPage: await read("app/dashboard/[slug]/page.tsx"),
  albumGuestView: await read("components/album/AlbumGuestView.tsx"),
  albumHeaderSettings: await read("lib/album-header-settings.ts"),
  proxy: await read("proxy.ts"),
  siteDomains: await read("lib/site-domains.ts"),
  urls: await read("lib/urls.ts"),
  clerkProvider: await read("components/GuestcamClerkProvider.tsx"),
  clerkWebhook: await read("app/api/webhooks/clerk/route.ts"),
  signUpPage: await read("app/sign-up/[[...sign-up]]/page.tsx"),
  signupAttribution: await read("lib/attribution/signup.ts"),
  signupAttributionRecord: await read("lib/attribution/record.ts"),
  signupAttributionTelegram: await read("lib/attribution/telegram.ts"),
  dashboardPage: await read("app/dashboard/page.tsx"),
  demoButton: await read("components/DemoButton.tsx"),
  headerAuthButtons: await read("components/HeaderAuthButtons.tsx"),
  languageSwitcher: await read("components/LanguageSwitcher.tsx"),
  robots: await read("app/robots.ts"),
  s3: await read("lib/storage/bunny-s3.ts"),
  s3Read: await read("app/api/bunny-s3-file/[...key]/route.ts"),
  legacyRead: await read("app/api/img/route.ts"),
  deleteMedia: await read("lib/storage/delete-media.ts"),
  instrumentation: await read("instrumentation.ts"),
  bankOrder: await read("app/api/bank-order/route.ts"),
  adminOverview: await read("app/admin/page.tsx"),
  adminPayments: await read("app/admin/payments/page.tsx"),
  adminSales: await read("lib/admin-sales.ts"),
  mollie: await read("lib/mollie.ts"),
  checkout: await read("app/api/checkout/route.ts"),
  eventOfferCron: await read("app/api/cron/event-upgrade-reminder/route.ts"),
  eventOfferEmail: await read("lib/email/event-upgrade-reminder.ts"),
  eventOfferLog: await read("lib/event-upgrade-reminder-log.ts"),
  vercelConfig: await read("vercel.json"),
  dbSchema: await read("lib/db/schema.ts"),
  upgradePage: await read("components/dashboard/UpgradePage.tsx"),
  upgradePageRoute: await read("app/dashboard/[slug]/upgrade/page.tsx"),
  albumLimits: await read("lib/album-limits.ts"),
  galleryLimits: await read("lib/gallery-limits.ts"),
  processOverride: await read("components/GuestcamProcessHowOverride.tsx"),
  videoPlayback: await read("app/api/albums/[slug]/video-playback-url/route.ts"),
  videoClient: await read("components/album/IosBunnyPlaybackFix.tsx"),
  filmStatus: await read("app/api/albums/[slug]/film/status/route.ts"),
  envExample: await read(".env.example"),
  homePage: await read("app/page.tsx"),
  homeComponent: await read("components/GuestcamHomePage.tsx"),
  localizedHomeComponent: await read("components/LocalizedGuestcamHomePageV3.tsx"),
  albumAdminPanel: await read("components/dashboard/AlbumAdminPanel.tsx"),
  albumSettingsRoute: await read("app/api/albums/[slug]/settings/route.ts"),
  seoFooter: await read("components/SeoFooter.tsx"),
  discountBanner: await read("components/DiscountBanner.tsx"),
  sitemap: await read("app/sitemap.ts"),
  hreflang: await read("lib/seo/hreflang.ts"),
  eventTopics: await read("lib/seo/event-topics.ts"),
  nextConfig: await read("next.config.ts"),
  hrGuide: await read("app/hr/qr-kod-vjencanje/page.tsx"),
  srGuide: await read("app/sr/qr-kod-vencanje/page.tsx"),
  hrAlternatives: await read("app/hr/alternativne-aplikacije/page.tsx"),
  srAlternatives: await read("app/sr/alternativne-aplikacije/page.tsx"),
  regionalBlogContent: (
    await Promise.all((await Promise.all(
      ["hr", "sr"].map(async (lang) =>
        (await fs.readdir(path.join(root, "content", "blog", lang)))
          .filter((name) => name.endsWith(".json"))
          .map((name) => `content/blog/${lang}/${name}`),
      ),
    )).flat().map(read))
  ).join("\n"),
  globalStyles: await read("app/globals.css"),
  dashboardLayout: await read("app/dashboard/layout.tsx"),
  adminLayout: await read("app/admin/layout.tsx"),
  authenticatedUi: (
    await Promise.all([
      "app/dashboard",
      "app/admin",
      "app/affiliate/dashboard",
      "components/dashboard",
      "components/admin",
    ].map(readTsxTree))
  ).join("\n"),
};

requireMatch(
  "unpaid event offer runs exactly 14 days before the event",
  files.eventOfferCron,
  /DAYS_BEFORE_EVENT\s*=\s*14[\s\S]*eq\(albums\.plan, "free"\)[\s\S]*eq\(albums\.weddingDate, targetDay\)/,
  "the promotion must target Free galleries on the exact 14-day date",
);

requireMatch(
  "event offer creates a unique single-use 30 percent code valid for 24 hours",
  files.eventOfferCron,
  /DISCOUNT_PERCENT\s*=\s*30[\s\S]*DISCOUNT_VALID_HOURS\s*=\s*24[\s\S]*GC30-[\s\S]*percentOff:\s*DISCOUNT_PERCENT[\s\S]*maxUses:\s*1[\s\S]*expiresAt/,
  "each eligible customer must receive a generated one-use code with a fixed expiry",
);

requireMatch(
  "event offer is sent at most once per customer",
  files.eventOfferLog,
  /WHERE LOWER\(email\) = LOWER\(\$\{email\}\)/,
  "multiple galleries owned by the same email must not trigger duplicate offers",
);

requireMatch(
  "event offer email links carry and auto-apply the generated code",
  `${files.eventOfferEmail}\n${files.upgradePageRoute}\n${files.upgradePage}`,
  /discount=\$\{encodeURIComponent\(fields\.discountCode\)\}[\s\S]*sp\.discount[\s\S]*validateDiscount\(requestedCode, initialPlan\)[\s\S]*initialDiscount \? "valid" : "idle"/,
  "the email CTA must take the customer to checkout with the one-time code applied",
);

requireAbsent(
  "unused Kling polling no longer keeps Neon awake",
  files.vercelConfig,
  /\/api\/cron\/poll-kling/,
  "the current Shotstack Film Studio must not retain the legacy two-minute Kling cron",
);

requireMatch(
  "guest upload reminders use an hourly database wake-up",
  files.vercelConfig,
  /\/api\/cron\/send-reminders[\s\S]*"schedule":\s*"0 \* \* \* \*"/,
  "reminder delivery can tolerate an hourly window and should allow Neon to suspend",
);

requireMatch(
  "event offer lookup has a matching composite index",
  files.dbSchema,
  /albums_event_offer_due_idx[\s\S]*t\.plan, t\.weddingDate/,
  "the daily unpaid-event lookup must not scan the albums table",
);

requireMatch(
  "authenticated screens use the shared onboarding font scope",
  `${files.dashboardLayout}\n${files.adminLayout}`,
  /gc-admin-ui[\s\S]*gc-admin-ui/,
  "dashboard and internal admin layouts must both inherit the onboarding typography system",
);

requireMatch(
  "authenticated typography uses the DM Sans UI family and onboarding title scale",
  files.globalStyles,
  /\.gc-admin-ui\s*\{[\s\S]*font-family:\s*var\(--font-dm-sans\)[\s\S]*\.gc-admin-page-title\s*\{[\s\S]*font-size:\s*1\.5rem[\s\S]*font-weight:\s*700/,
  "the shared product typography tokens must stay aligned with onboarding",
);

requireAbsent(
  "authenticated page titles do not reintroduce one-off fonts or sizes",
  files.authenticatedUi,
  /<h1\b(?![^>]*\bgc-admin-page-title\b)[^>]*>/,
  "every dashboard, onboarding, partner and internal-admin h1 must use gc-admin-page-title",
);

requireMatch(
  "legacy upload endpoint stays retired",
  files.legacyUpload,
  /status:\s*410/,
  "legacy upload route must keep returning HTTP 410",
);

requireMatch(
  "legacy server ZIP endpoint stays retired",
  files.legacyDownload,
  /status:\s*410/,
  "server-side ZIP endpoint must not be re-enabled accidentally",
);

requireMatch(
  "Bunny S3 physical delete support exists",
  files.s3,
  /DeleteObjectCommand/,
  "Bunny S3 helper must support DeleteObjectCommand",
);

requireMatch(
  "central media deletion handles Bunny S3",
  files.deleteMedia,
  /deleteBunnyS3Object/,
  "provider-aware deletion must include Bunny S3",
);

requireAbsent(
  "runtime startup does not run schema migrations",
  files.instrumentation,
  /runMigrations\s*\(/,
  "schema migrations must not execute during application startup",
);

requireMatch(
  "bank orders require album ownership",
  files.bankOrder,
  /checkAlbumOwnership/,
  "bank-order route must verify album owner/admin access",
);

requireMatch(
  "Free accounts allow only one active event",
  files.albumLimits,
  /activeFreeAlbum[\s\S]*allowed: false/,
  "creating albums must remain blocked while an active Free event exists",
);

requireMatch(
  "Free events allow only one gallery",
  files.galleryLimits,
  /free:\s*1,/,
  "the server-side named-gallery limit for Free must be exactly one",
);

requireAbsent(
  "Free pricing no longer advertises two galleries",
  files.processOverride,
  /(?:do 2 galerij|do 2 galerije|bis zu 2 Galerien|up to 2 galleries|hasta 2 galerías)/,
  "all localized Free pricing cards must say one event and one gallery",
);

requireMatch(
  "admin revenue uses actual Mollie and paid bank records",
  files.adminOverview,
  /listAllPayments\(\)[\s\S]*bankOrders\.status, "paid"[\s\S]*summarizePaidPlanSales/,
  "the overview must derive paid packages from successful payment sources, not legacy processor IDs",
);

requireAbsent(
  "admin revenue no longer filters only legacy Stripe or Paddle IDs",
  files.adminOverview,
  /like\(albums\.stripeSessionId, "(?:txn|cs)_/,
  "Mollie tr_ payments and paid bank orders must not be excluded",
);

requireMatch(
  "admin overview separates Mollie and invoice revenue",
  files.adminOverview,
  /Mollie \(\{sales\.mollieCount\}\)[\s\S]*Predračuni \(\{sales\.bankCount\}\)/,
  "the owner must see how much revenue came from each payment source",
);

requireMatch(
  "Mollie admin reads the complete paginated payment history",
  files.mollie,
  /listAllPayments[\s\S]*limit: "250"[\s\S]*searchParams\.get\("from"\)/,
  "financial totals must not stop at the latest 50 Mollie transactions",
);

requireMatch(
  "package revenue excludes refunds and physical add-ons",
  files.adminSales,
  /amountRefunded[\s\S]*standsCents[\s\S]*shipCents[\s\S]*netCents - addOnCents/,
  "the package total must use the actual net package portion of each payment",
);

requireMatch(
  "Mollie payments screen shows complete history",
  files.adminPayments,
  /listAllPayments\(\)[\s\S]*Vseh \{enriched\.length\} transakcij iz Mollie/,
  "the payments screen must match the complete history used by the overview",
);

requireMatch(
  "protected video playback uses album request access",
  files.videoPlayback,
  /hasAlbumRequestAccess/,
  "video playback token issuance must use the shared album access gate",
);

requireAbsent(
  "video playback password is not read from query string",
  files.videoPlayback,
  /searchParams\.get\(["']pw["']\)/,
  "protected playback must use HttpOnly album-access cookies/headers, not ?pw=",
);

requireAbsent(
  "video client does not append album password to URLs",
  files.videoClient,
  /\.set\(["']pw["']/,
  "client video requests must not put album passwords into query parameters",
);

requireMatch(
  "new S3 media checks protected album guest access",
  files.s3Read,
  /hasAlbumRequestAccess/,
  "password-protected S3 reads must use the shared album access gate",
);

requireMatch(
  "new S3 media preserves owner access",
  files.s3Read,
  /checkAlbumOwnership/,
  "album owners must still be able to manage protected S3 media",
);

requireMatch(
  "legacy Bunny media checks protected album access",
  files.legacyRead,
  /hasAlbumRequestAccess/,
  "historical Bunny media must use the same protected album access model",
);

requireMatch(
  "legacy Bunny media preserves owner access",
  files.legacyRead,
  /checkAlbumOwnership/,
  "album owners must still be able to manage historical protected media",
);

requireMatch(
  "upload URL issuance uses HttpOnly album access",
  files.uploadUrl,
  /hasAlbumRequestAccess/,
  "upload-url must accept the protected album cookie instead of requiring raw client password props",
);

requireMatch(
  "upload finalization uses HttpOnly album access",
  files.saveUpload,
  /hasAlbumRequestAccess/,
  "save-upload must accept the protected album cookie instead of requiring raw client password props",
);

requireMatch(
  "legacy upload gateway uses HttpOnly album access",
  files.legacyGateway,
  /hasAlbumRequestAccess/,
  "legacy-compatible upload gateway must follow the same album access model",
);

requireAbsent(
  "album page does not serialize raw passwords to client props",
  files.albumPage,
  /providedPassword\s*=|\{\s*pw\s*,/,
  "the Server Component must never pass a raw album password into AlbumGuestView",
);

requireAbsent(
  "proxy never rewrites raw password back into query string",
  files.proxy,
  /searchParams\.set\(["']pw["']/,
  "decrypted album passwords must stay in a server-only request header",
);

requireMatch(
  "proxy strips untrusted internal password header",
  files.proxy,
  /delete\(["']x-album-access-password["']\)/,
  "browser-supplied internal password headers must be overwritten/removed",
);

requireMatch(
  "guestcam.rs is an official Serbian routing host",
  files.siteDomains,
  /SERBIAN_GUESTCAM_ORIGIN\s*=\s*"https:\/\/www\.guestcam\.rs"[\s\S]*SERBIAN_ROUTING_HOSTS[\s\S]*guestcam\.rs[\s\S]*www\.guestcam\.rs/,
  "the Serbian country domain must not fall through to custom album-domain resolution",
);

requireMatch(
  "guestcam.es is an official Spanish routing host",
  files.siteDomains,
  /SPANISH_GUESTCAM_ORIGIN\s*=\s*"https:\/\/guestcam\.es"[\s\S]*SPANISH_ROUTING_HOSTS[\s\S]*guestcam\.es[\s\S]*www\.guestcam\.es/,
  "the Spanish country domain must never fall through to custom album-domain resolution",
);

requireAbsent(
  "country marketing domains are not Clerk satellites",
  `${files.siteDomains}\n${files.proxy}\n${files.clerkProvider}`,
  /isSpanishGuestcamSatelliteHost|isSerbianGuestcamSatelliteHost|\bisSatellite\b|satelliteAutoSync|domain=["']guestcam\.(?:rs|es)["']|domain:\s*["']guestcam\.(?:rs|es)["']/,
  "Serbian and Spanish marketing pages must use Clerk only after redirecting to www.guestcam.si",
);

requireMatch(
  "country-domain create CTAs open primary Clerk sign-up",
  files.proxy,
  /pathname === "\/dashboard\/new"[\s\S]*new URL\("\/sign-up", PRIMARY_GUESTCAM_ORIGIN\)[\s\S]*redirect_url[\s\S]*countryLocale && isPrimaryAccountPath\(pathname\)/,
  "create-album clicks from .rs and .es must open the existing Clerk sign-up on www.guestcam.si",
);

requireMatch(
  "country-domain sign-up bridges its acquisition source to the primary domain",
  files.proxy,
  /buildSignupSourceSnapshot[\s\S]*SIGNUP_SOURCE_PARAM[\s\S]*serializeSignupSourceSnapshot/,
  ".rs and .es sign-ups must retain their source when Clerk opens on .si",
);

requireMatch(
  "Clerk receives the validated signup attribution snapshot",
  `${files.signUpPage}\n${files.signupAttribution}`,
  /parseSignupSourceParam[\s\S]*unsafeMetadata=\{\{ guestcamAttribution: signupSource \}\}[\s\S]*parseSignupSourceSnapshot/,
  "the user.created webhook must have source metadata before the first dashboard visit",
);

requireMatch(
  "new-user Telegram alerts include the acquisition source",
  `${files.clerkWebhook}\n${files.signupAttributionTelegram}\n${files.dashboardPage}`,
  /signupSourceTelegramLines\(signupSource\)[\s\S]*Vir prijave[\s\S]*signupSourceTelegramLines\(signupSource\)/,
  "both the Clerk webhook and dashboard fallback must report the signup source",
);

requireAbsent(
  "cross-domain signup source excludes advertising click IDs and full referrer URLs",
  files.signupAttribution.split("export function buildSignupSourceSnapshot")[1] ?? "",
  /gclid\s*:|fbclid\s*:|referrerUrl\s*:/,
  "the URL/Clerk bridge should carry only a compact non-sensitive attribution summary",
);

requireMatch(
  "country-domain attribution is persisted after first sign-in",
  `${files.dashboardPage}\n${files.signupAttributionRecord}`,
  /unsafeMetadata\?\.guestcamAttribution[\s\S]*recordSignupAttribution\(userId, clerkSignupSource\)[\s\S]*clerkSource \?\? cookieSource/,
  "the admin attribution record must preserve .rs/.es source metadata instead of becoming direct .si",
);

requireMatch(
  "country-domain demo links return to the local homepage modal",
  files.proxy,
  /countryLocale && pathname === "\/demo"[\s\S]*target\.pathname = "\/"[\s\S]*searchParams\.set\("demo", "1"\)/,
  "bookmarked .rs and .es demo links must not rewrite to missing locale routes",
);

requireMatch(
  "demo bridge is active and localized on every homepage",
  `${files.headerAuthButtons}\n${files.demoButton}`,
  /<DemoButton variant="bridge" lang=\{lang\}[\s\S]*MODAL_COPY/,
  "all languages must open the localized demo modal",
);

requireMatch(
  "country-domain demo modal uses the primary demo album",
  files.demoButton,
  /PRIMARY_GUESTCAM_ORIGIN[\s\S]*isCountryMarketingHost[\s\S]*demoOrigin = PRIMARY_GUESTCAM_ORIGIN/,
  "country marketing domains must never resolve the demo album as a locale page",
);

requireMatch(
  "country marketing domains do not boot Clerk in the browser",
  files.clerkProvider,
  /isCountryMarketingHost\(host\)[\s\S]*return <>\{children\}<\/>/,
  "the Serbian and Spanish origins must render without a local Clerk frontend instance",
);

requireMatch(
  "country language links use clean ccTLD URLs",
  files.languageSwitcher,
  /sr:\s*`\$\{SERBIAN_GUESTCAM_ORIGIN\}\/`[\s\S]*es:\s*`\$\{SPANISH_GUESTCAM_ORIGIN\}\/`[\s\S]*SERBIAN_GUESTCAM_ORIGIN\}\/blog[\s\S]*SPANISH_GUESTCAM_ORIGIN\}\/blog/,
  "language switchers must send Serbian and Spanish visitors to clean country-domain paths",
);

requireMatch(
  "legacy locale prefixes permanently consolidate onto country domains",
  files.proxy,
  /pathname === "\/sr"[\s\S]*permanentCountryRedirect\(req, "sr"\)[\s\S]*pathname === "\/es"[\s\S]*permanentCountryRedirect\(req, "es"\)/,
  "old .si/sr, .si/es, .rs/sr and .es/es URLs must transfer signals with a 308",
);

requireMatch(
  "clean country URLs rewrite to internal locale routes",
  files.proxy,
  /internalCountryPath[\s\S]*`\/\$\{locale\}`[\s\S]*`\/\$\{locale\}\$\{pathname\}`[\s\S]*NextResponse\.rewrite/,
  "public country-domain paths must stay clean while reusing the localized App Router tree",
);

requireMatch(
  "country domains preserve public static asset paths",
  files.proxy,
  /isCountryRoutePassthrough[\s\S]*test\(pathname\)[\s\S]*internalCountryPath/,
  "images, fonts and other public files must not be rewritten under /sr or /es",
);

requireMatch(
  "Spanish and Serbian canonicals use their country domains",
  files.urls,
  /locale === "sr"[\s\S]*serbianGuestcamUrl[\s\S]*locale === "es"[\s\S]*spanishGuestcamUrl/,
  "locale canonical builders must not point Serbian or Spanish pages back to .si",
);

requireMatch(
  "film no-generation state is a normal response",
  files.filmStatus,
  /generation:\s*null/,
  "film status should represent 'no film yet' without an expected 404",
);

requireMatch(
  "published album guests can read only completed film output",
  files.filmStatus,
  /hasAlbumRequestAccess[\s\S]*album\.isPublished[\s\S]*filmGenerations\.status, "complete"[\s\S]*status: "complete"[\s\S]*videoUrl: completed\.videoUrl/,
  "the guest gallery must display completed films without exposing owner-only render state",
);

requireMatch(
  "env template separates legacy Bunny CDN from new S3 CDN",
  files.envExample,
  /BUNNY_CDN_URL=https:\/\/frfr1\.b-cdn\.net[\s\S]*BUNNY_S3_CDN_URL=https:\/\/guestcam-media\.b-cdn\.net/,
  "legacy and S3 pull zones must remain separate",
);

requireAbsent(
  "homepage does not reparent React-owned DOM",
  files.homePage,
  /MoveAfterHero/,
  "imperatively moving rendered nodes breaks every client-side navigation away from the homepage",
);

requireMatch(
  "homepage video is rendered directly after the hero",
  files.homeComponent,
  /<\/section>\s*<PromoVideo\s*\/>\s*<section className="bg-\[#FFFDF8\] px-4 py-8/,
  "the promo video must stay in the React tree immediately after the hero section",
);

requireMatch(
  "album settings expose the default guest language",
  files.albumAdminPanel,
  /Privzeti jezik galerije[\s\S]*value=\{defaultLang\}[\s\S]*setDefaultLang/,
  "the owner must be able to choose the album and Photo Wall language",
);

requireMatch(
  "album settings save the default guest language",
  files.albumSettingsRoute,
  /defaultLang:\s*validDefaultLang/,
  "the settings PATCH route must persist the validated default language",
);

requireMatch(
  "album settings auto-save ordinary changes",
  files.albumAdminPanel,
  /setTimeout\(\(\) => \{[\s\S]*setAutoSaveStatus\("saving"\)[\s\S]*fetch\(`\/api\/albums\/\$\{album\.slug\}\/settings`[\s\S]*Samodejno shranjevanje vključeno/,
  "ordinary settings must auto-save and expose a visible save status",
);

requireMatch(
  "album settings expose all gallery header controls",
  files.albumAdminPanel,
  /Prikaz v glavi galerije[\s\S]*checked=\{showTitle\}[\s\S]*checked=\{showEventType\}[\s\S]*checked=\{showEventDate\}/,
  "owners must be able to toggle the title, event type and event date separately",
);

requireMatch(
  "album settings persist event date changes",
  files.albumSettingsRoute,
  /weddingDate:\s*validWeddingDate/,
  "the settings PATCH route must write the validated event date",
);

requireMatch(
  "album settings persist gallery header controls",
  files.albumSettingsRoute,
  /setAlbumHeaderSettings\(album\.id,[\s\S]*showTitle[\s\S]*showEventType[\s\S]*showEventDate/,
  "the settings PATCH route must persist all three header visibility flags",
);

requireMatch(
  "gallery header settings are durable",
  files.albumHeaderSettings,
  /show_event_name[\s\S]*show_event_type[\s\S]*show_event_date[\s\S]*ON CONFLICT \(album_id\) DO UPDATE/,
  "header visibility flags must be stored per album with safe defaults",
);

requireMatch(
  "public album receives gallery header settings",
  files.albumPage,
  /getAlbumHeaderSettings\(album\.id\)[\s\S]*headerVisibility=\{headerSettings\}/,
  "the public gallery must receive the saved header settings",
);

requireMatch(
  "dashboard receives current gallery header settings",
  files.albumDashboardPage,
  /getAlbumHeaderSettings\(album\.id\)[\s\S]*headerSettings=\{headerSettings\}/,
  "the owner controls must initialize from persisted values",
);

requireMatch(
  "public gallery honors all header visibility controls",
  files.albumGuestView,
  /headerVisibility\?\.showTitle !== false[\s\S]*headerVisibility\?\.showEventType !== false[\s\S]*headerVisibility\?\.showEventDate !== false[\s\S]*showEventDate && \([\s\S]*CountdownTimer/,
  "the public gallery must hide the selected title, type and date content",
);

requireMatch(
  "localized feature footer anchors have a target",
  files.localizedHomeComponent,
  /<section id="features"/,
  "localized homepages must expose the #features section used by every localized footer",
);

requireMatch(
  "localized FAQ footer anchors have a target",
  files.localizedHomeComponent,
  /<section id="faq"/,
  "localized homepages must expose the #faq section used by every localized footer",
);

requireMatch(
  "affiliate applications have crawlable localized inlinks",
  files.seoFooter,
  /localePublicPath\(lang, lang === "sl" \? "\/affiliate\/apply" : `\/\$\{lang\}\/affiliate\/apply`\)/,
  "the footer must link to the application page in the current language",
);

requireMatch(
  "homepage sitemap date reflects the latest meaningful edit",
  files.sitemap,
  /homepage:\s*"2026-08-30"/,
  "do not leave the homepage lastmod stale after a meaningful homepage update",
);

requireMatch(
  "each production host exposes only its own sitemap URLs",
  files.sitemap,
  /countryLocale[\s\S]*serbianPath[\s\S]*spanishPath[\s\S]*countryLocale === "sr"[\s\S]*countryLocale === "es"[\s\S]*!serbianPath && !spanishPath/,
  ".si, .rs and .es must each publish only their own canonical URLs",
);

requireMatch(
  "country robots files point to their own sitemap",
  files.robots,
  /isSerbianGuestcamHost\(requestHost\)[\s\S]*SERBIAN_GUESTCAM_ORIGIN[\s\S]*isSpanishGuestcamHost\(requestHost\)[\s\S]*SPANISH_GUESTCAM_ORIGIN[\s\S]*sitemap: `\$\{publicOrigin\}\/sitemap\.xml`/,
  "search crawlers on .rs and .es must discover the matching country sitemap",
);

requireMatch(
  "Croatian, Serbian and Spanish pages publish regional hreflang aliases",
  files.hreflang,
  /languages\.hr[\s\S]*localized\["hr-HR"\][\s\S]*languages\.sr[\s\S]*localized\["sr-RS"\][\s\S]*languages\.es[\s\S]*localized\["es-ES"\]/,
  "search engines should receive generic and language-region hreflang codes",
);

requireMatch(
  "former Slovenian wedding-photo URL redirects permanently",
  files.nextConfig,
  /source:\s*"\/slike-s-poroke"[\s\S]*destination:\s*"\/sl\/slike-s-poroke"[\s\S]*permanent:\s*true/,
  "old Slovenian search links must consolidate into the canonical /sl page",
);

requireMatch(
  "duplicate Croatian QR guide redirects permanently",
  files.nextConfig,
  /source:\s*"\/hr\/qr-kod-za-vjencanje-kako"[\s\S]*destination:\s*"\/hr\/qr-kod-vjencanje"[\s\S]*permanent:\s*true/,
  "the duplicate Croatian guide must consolidate ranking signals into one canonical URL",
);

requireMatch(
  "duplicate Serbian QR guide redirects permanently",
  files.nextConfig,
  /source:\s*"\/sr\/qr-kod-za-vencanje-kako"[\s\S]*destination:\s*"\/sr\/qr-kod-vencanje"[\s\S]*permanent:\s*true/,
  "the duplicate Serbian guide must consolidate ranking signals into one canonical URL",
);

requireMatch(
  "retired Croatian video guide redirects permanently",
  files.nextConfig,
  /source:\s*"\/blog\/kako-prikupiti-video-snimke-gostiju-vencanje"[\s\S]*destination:\s*"\/hr\/blog\/kako-skupiti-fotografije-gostiju-na-vjencanju"[\s\S]*permanent:\s*true/,
  "old indexed Croatian links must resolve to the closest current guide",
);

requireMatch(
  "duplicate regional guides stay out of SEO clusters",
  files.eventTopics,
  /key === "qr-koda-za-poroko" && \(loc === "hr" \|\| loc === "sr"\)/,
  "sitemap and hreflang clusters must not include URLs that redirect",
);

requireAbsent(
  "regional SEO copy contains no unsupported internal statistics",
  `${files.eventTopics}\n${files.regionalBlogContent}`,
  /(?:Guestcam interni podaci|interna Guestcam analiza|67\s*%|95\s*%|65[–-]80\s*%|15[–-]25\s*%|50[–-]70\s*%|5[–-]10\s*%|11×|3×)/i,
  "unpublished statistics and fabricated case-study numbers must not be presented as facts",
);

requireAbsent(
  "regional content contains no known language defects",
  `${files.localizedHomeComponent}\n${files.hrGuide}\n${files.srGuide}\n${files.hrAlternatives}\n${files.srAlternatives}\n${files.regionalBlogContent}`,
  /(?:punoj kvalitetu|hrvaski|slovenaçki|njemçaki|besplatno zauvek|na voljo|postavitve|povezavo pa lahko)/i,
  "Croatian and Serbian pages must not leak Slovenian or malformed translations",
);

requireMatch(
  "regional homepage business copy is localized",
  files.localizedHomeComponent,
  /vlastiti vizualni identitet[\s\S]*prikupljanje kontakata uz privolu[\s\S]*sopstveni vizuelni identitet[\s\S]*prikupljanje kontakata uz saglasnost/,
  "Croatian and Serbian homepages must not expose English marketing jargon",
);

requireMatch(
  "Serbian pricing shows informative RSD equivalents",
  files.localizedHomeComponent,
  /39 €[\s\S]*≈ 4\.580 RSD[\s\S]*49 €[\s\S]*≈ 5\.750 RSD[\s\S]*99 €[\s\S]*≈ 11\.620 RSD[\s\S]*Plaćanje se obračunava u EUR preko Mollie/,
  "the .rs pricing grid must show local context without presenting RSD as the charged currency",
);

requireMatch(
  "Mollie checkout remains denominated in EUR",
  `${files.mollie}\n${files.checkout}`,
  /const currency = opts\.currency \?\? "EUR"[\s\S]*createPayment\(\{[\s\S]*amountCents: totalCents/,
  "RSD equivalents are informative only; Mollie, invoices and refunds must remain in EUR",
);

requireAbsent(
  "checkout never submits Serbian dinars to Mollie",
  files.checkout,
  /currency:\s*["']RSD["']/,
  "Mollie does not support RSD for this checkout",
);

requireMatch(
  "footer attribution is localized",
  files.seoFooter,
  /madeIn[\s\S]*\{t\.madeIn\}[\s\S]*Futurecode\.si/,
  "the footer must not show Slovenian attribution on every locale",
);

requireAbsent(
  "discount copy action is not hardcoded in English",
  files.discountBanner,
  />copy</,
  "the discount banner action must use localized copy",
);

for (const guide of [files.hrGuide, files.srGuide]) {
  requireMatch(
    "regional guide states the exact Free plan limits",
    guide,
    /1 događaj[\s\S]*1 galerij/,
    "Free must mean one event and one gallery in regional SEO content",
  );
  requireMatch(
    "regional guide has a current modification date",
    guide,
    /2026-08-28/,
    "structured article metadata must expose the current modification date",
  );
}

for (const lang of ["hr", "sr", "de", "en", "es"]) {
  for (const document of ["privacy", "terms", "gdpr", "cookies", "refund"]) {
    const legalPage = await read(`app/${lang}/${document}/page.tsx`);
    requireMatch(
      `${lang}/${document} has reciprocal hreflang metadata`,
      legalPage,
      new RegExp(`languages:\\s*legalAlternates\\("${document}"\\)`),
      "every translated legal page must publish the same reciprocal cluster as the sitemap",
    );
    if (lang === "hr" || lang === "sr") {
      requireMatch(
        `${lang}/${document} has a localized metadata description`,
        legalPage,
        /description:\s*"[^"\n]+"[\s\S]*openGraph:\s*\{[\s\S]*description:\s*"[^"\n]+"/,
        "regional legal pages must not inherit Slovenian search-result descriptions",
      );
    }
  }
}

console.log("\nAll Guestcam critical regression checks passed.");
