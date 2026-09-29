import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const offer = new RegExp("(?:custom|own)\\s+domains?|(?:lastn\\p{L}*|vlastit\\p{L}*|sopstven\\p{L}*)\\s+domen\\p{L}*|eigen\\p{L}*\\s+(?:web)?domain|dominios?\\s+(?:propios?|personalizados?)", 'iu');
const read = file => fs.readFileSync(file, 'utf8');
const files = ["components/GuestcamHomePage.tsx","components/LocalizedHomePage.tsx","components/LocalizedGuestcamHomePageV3.tsx","app/sl/qr-koda-za-poslovne-dogodke/page.tsx","lib/wedding/copy.ts","lib/i18n/admin-settings-copy.ts"];
for (const file of files) {
  assert.ok(!offer.test(read(file)), 'Retired domain marketing remains in ' + file);
}
const admin = read('components/dashboard/AlbumAdminPanel.tsx');
assert.ok(!/CustomDomainPanel|interface DnsRecord|interface DomainStatus|albums\/.*\/domain/.test(admin), 'Domain setup must not ship in user admin');
assert.ok(!/domainBenefit/.test(read('lib/wedding/copy.ts')), 'Retired translated benefit must not remain');
const route = read('app/api/albums/[slug]/domain/route.ts');
assert.match(route, /export async function POST\(\)\s*\{[\s\S]*?status: 410/);
assert.ok(!route.includes('addProjectDomain'), 'No route may register a new domain');
assert.ok(!/album\.plan/.test(route), 'No premium upsell for retired feature');
assert.match(route, /checkAlbumOwnership\(album\)/, 'Legacy domain access remains owner-checked');
assert.match(read('proxy.ts'), /eq\(albums\.customDomain, bareHost\)/, 'Existing URLs remain compatible');
assert.match(read('lib/db/schema.ts'), /customDomain: text\("custom_domain"\)/, 'No destructive data migration');
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (file === 'app/api') continue;
    if (entry.isDirectory()) { scan(file); continue; }
    if (!/\.(tsx?|mdx?|json|txt)$/.test(file)) continue;
    if (offer.test(read(file))) throw new Error('Review retired domain claim in public content: ' + file);
  }
}
for (const dir of ['app','components','content','public']) scan(dir);
console.log('Custom-domain retirement: marketing, six locales, admin, API and legacy URL guards passed.');

assert.ok(!/domainBenefit/.test(read('components/wedding/WeddingLandingPage.tsx')), 'Wedding landing pages do not advertise domains');
for (const dir of ['lib/blog','lib/i18n','lib/seo']) scan(dir);
// Exercise the actual compiled POST handler with external services stubbed.
const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const vm = require('node:vm');
const compiled = ts.transpileModule(route, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
let externalCalls = 0;
const sandbox = { exports: {}, require(id) {
  if (id === 'next/server') return {NextResponse: {json(body, init) {return {body, ...init};}}};
  return new Proxy({}, {get() {return new Proxy(function() {externalCalls++; throw new Error('Retired registration attempted an external call');}, {get() {externalCalls++; throw new Error('Retired registration attempted external data access');}});}});
}};
vm.runInNewContext(compiled, sandbox);
const retired = await sandbox.exports.POST();
assert.equal(retired.status, 410);
assert.equal(retired.body.code, 'CUSTOM_DOMAINS_RETIRED');
assert.equal(externalCalls, 0, 'Retired registration never calls the DB or Vercel');
console.log('Retired POST runtime check: HTTP 410, zero external calls.');
