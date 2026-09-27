import fs from "node:fs/promises";
import path from "node:path";

const read = (p) => fs.readFile(p, "utf8");
const assert = (ok, message) => { if (!ok) throw new Error(`Wedding Premium offer check failed: ${message}`); };

const pricing = await read("lib/plan-pricing.ts");
assert(/PREMIUM_REGULAR_PRICE_EUR\s*=\s*129/.test(pricing), "regular price must be 129 EUR");
assert(/PREMIUM_SALE_PERCENT\s*=\s*35/.test(pricing), "sale must be 35 percent");
assert(/PREMIUM_SALE_PRICE_EUR\s*=\s*84/.test(pricing), "charged promotional price must be 84 EUR");

const checkout = await read("app/api/checkout/route.ts");
assert(/premium:[\s\S]*amount:\s*PREMIUM_SALE_PRICE_CENTS/.test(checkout), "Mollie checkout must charge the promotional Premium price");

const discount = await read("lib/discount.ts");
assert(/premium:\s*PREMIUM_SALE_PRICE_EUR/.test(discount), "discount engine must use the Premium promotional base price");

const entitlements = await read("lib/album-limits.ts");
assert(/premium:\s*\{[^}]*maxPhotos:\s*PREMIUM_MEDIA_LIMIT[^}]*daysAccess:\s*null/.test(entitlements), "Premium entitlement must be practically unlimited and non-expiring");

const reconcile = await read("lib/paddle-reconcile.ts");
assert(/premium:\s*\{[^}]*maxPhotos:\s*PREMIUM_MEDIA_LIMIT[^}]*daysAccess:\s*null/.test(reconcile), "payment reconciliation must apply non-expiring Premium");

const migrations = await read("lib/db/migrations.ts");
assert(/UPDATE albums[\s\S]*max_photos\s*=\s*2000000000[\s\S]*expires_at\s*=\s*NULL[\s\S]*WHERE plan = 'premium'/.test(migrations), "existing Premium albums must be backfilled to no expiry");
assert(/UPDATE user_plan_overrides[\s\S]*max_photos\s*=\s*2000000000[\s\S]*days_access\s*=\s*NULL[\s\S]*WHERE plan = 'premium'/.test(migrations), "existing Premium account grants must be backfilled");

const weddingCopy = await read("lib/wedding/copy.ts");
for (const phrase of [
  "Neomejeno videoposnetkov",
  "Neograničeno videozapisa",
  "Neograničeno video snimaka",
  "Unlimited videos",
  "Unbegrenzte Videos",
  "Vídeos ilimitados",
  "Neomejen čas hrambe in dostopa",
  "Unlimited storage and access time",
  "Almacenamiento y acceso sin vencimiento",
]) assert(weddingCopy.includes(phrase), `missing localized benefit: ${phrase}`);

const slHome = await read("components/GuestcamHomePage.tsx");
assert(slHome.includes("QR koda za poroko · baby shower · rojstni dnevi · dogodki · fotografije gostov"), "Slovenian homepage eyebrow is not current");
assert(slHome.includes("PREMIUM_REGULAR_PRICE_EUR") && slHome.includes("PREMIUM_SALE_PERCENT"), "Slovenian Premium card must show regular price and limited-time sale");
assert(slHome.includes('bg-[#111111]') && slHome.includes('ring-4 ring-[#F4B400]'), "Slovenian Premium card must use black-gold styling");

for (const p of [
  "components/LocalizedGuestcamHomePageV3.tsx",
  "components/wedding/WeddingLandingPage.tsx",
  "components/dashboard/UpgradePage.tsx",
]) {
  const src = await read(p);
  assert(src.includes("PREMIUM_REGULAR_PRICE_EUR") && src.includes("PREMIUM_SALE_PRICE_EUR"), `${p} must use centralized sale pricing`);
}

const llms = await read("app/llms.txt/route.ts");
assert(llms.includes("Poročni premium — 84 €") && llms.includes("redna cena 129 €"), "llms.txt must advertise the current offer");
const ai = await read("public/.well-known/ai-content.md");
assert(ai.includes("€84 promotional price") && ai.includes("regular €129") && ai.includes("unlimited photos and videos"), "AI content must advertise the current offer and unlimited media");

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (/\.(json|md|tsx?|txt)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const publicMarketing = [
  ...(await walk("content/blog")),
  "app/llms.txt/route.ts",
  "public/.well-known/ai-content.md",
  "lib/seo/event-topics.ts",
  "lib/email/event-upgrade-reminder.ts",
  "lib/legal/terms.ts",
].filter(Boolean);

const stalePrice = /(Poročni premium|Vjenčani premium|Venčani premium|Wedding Premium|Hochzeits-Premium|Premium para bodas)[^\n"]{0,90}(?:\(?(?:79|99)\s*€|€(?:79|99))/gi;
const staleHits = [];
for (const p of publicMarketing) {
  const src = await read(p);
  for (const hit of src.matchAll(stalePrice)) staleHits.push(`${p}: ${hit[0]}`);
}
if (staleHits.length) {
  console.error("Stale Wedding Premium price references:\n" + staleHits.join("\n"));
  process.exit(1);
}

console.log("PASS: Wedding Premium offer is 129 EUR regular / 84 EUR sale, with unlimited media and non-expiring retention.");
