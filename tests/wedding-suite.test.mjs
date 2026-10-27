import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
function modules(overrides = {}) {
 const cache = new Map();
 const load = path => {
  if (path in overrides) return overrides[path];
  const full = resolve(root, path);
  if (cache.has(full)) return cache.get(full);
  const output = {};
  cache.set(full, output);
  const source = ts.transpileModule(readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', source)(name => {
   if (name in overrides) return overrides[name];
   if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`);
   if (name.startsWith('.')) { const p = resolve(dirname(full), name); return load(existsSync(`${p}.ts`) ? `${p}.ts` : p); }
   return require(name);
  }, output);
  return output;
 };
 return load;
}
const load = modules();
const contracts = load('lib/wedding-suite/contracts.ts');
const { suiteCopy } = load('lib/wedding-suite/copy.ts');
const { weddingEmail } = load('lib/wedding-suite/email.ts');
const tokens = load('lib/wedding-suite/tokens.ts');
const config = { ...contracts.EMPTY_SUITE, enabled: true, capsuleUnlockAt: '2027-10-01T00:00:00Z' };
const uuid = 'a2c41a03-a4ef-44dc-a332-0c8909770111';

test('wedding templates preserve content and starter sections never publish invented event details', () => {
 const templates = load('lib/wedding-suite/page-templates.ts');
 const { DEFAULT_PAGE } = load('lib/wedding-suite/page-design.ts');
 const input = { ...structuredClone(DEFAULT_PAGE), title: { en: 'Our names' }, sections: [{ id: uuid, category: 'custom', title: { de: 'Original' }, visible: false, fields: [] }] };
 const original = structuredClone(input);
 for (const style of Object.keys(templates.PAGE_STYLES)) {
  const result = templates.applyPageStyle(input, style);
  assert.deepEqual(input, original); assert.deepEqual(result.sections, input.sections); assert.deepEqual(result.title, input.title);
  assert.ok(contracts.pageDesignSchema.safeParse(result).success); assert.ok(contracts.PAGE_COVER_IMAGES.includes(result.coverImageUrl));
 }
 const starter = templates.starterSections(() => require('node:crypto').randomUUID());
 assert.equal(starter.length, 3); assert.ok(starter.every(section => section.fields.every(field => Object.keys(field.text).length === 0)));
 const demo = templates.sampleWeddingPage(); assert.ok(contracts.pageDesignSchema.safeParse(demo).success);
 for (const lang of contracts.SUITE_LANGS) {
  assert.ok(demo.title[lang]); assert.ok(demo.subtitle[lang]); assert.ok(demo.sections.every(section => section.title[lang] && section.fields[0].text[lang]));
 }
 assert.equal(contracts.pageDesignSchema.safeParse({ ...demo, coverImageUrl: 'javascript:bad' }).success, false);
});

test('template covers stay on the current origin, including previously saved preview URLs', () => {
 const { pageCoverSource, DEFAULT_PAGE } = load('lib/wedding-suite/page-design.ts');
 for (const asset of contracts.PAGE_COVER_IMAGES) {
  assert.equal(pageCoverSource(asset), asset);
  assert.equal(pageCoverSource(`https://www.guestcam.si${asset}`), asset);
  assert.equal(pageCoverSource(`https://wedding-album-old-protected.vercel.app${asset}`), asset);
  assert.equal(contracts.pageDesignSchema.safeParse({ ...DEFAULT_PAGE, coverImageUrl: asset }).success, true);
 }
 for (const bad of ['/api/private', '//outside.example/photo.jpg', '/hero/../private', 'javascript:bad', 'https://name:secret@outside.example/photo.jpg']) {
  assert.equal(contracts.pageDesignSchema.safeParse({ ...DEFAULT_PAGE, coverImageUrl: bad }).success, false);
  assert.equal(pageCoverSource(bad), undefined);
 }
 const own = 'https://photos.example/couple.jpg'; assert.equal(pageCoverSource(own), own);
 const samePath = 'https://photos.example/hero/wedding-castle.webp'; assert.equal(pageCoverSource(samePath), samePath);
});

test('professional wedding presentation and all twenty feature explanations are complete in six languages', () => {
 const { presentationCopy } = load('lib/wedding-suite/presentation-copy.ts');
 const { weddingFeatureDetails } = load('lib/wedding/feature-details.ts');
 const keys = Object.keys(presentationCopy('en'));
 const identifiers = weddingFeatureDetails('sl').map(feature => feature.id);
 for (const lang of contracts.SUITE_LANGS) {
  assert.deepEqual(Object.keys(presentationCopy(lang)), keys);
  assert.ok(Object.values(presentationCopy(lang)).every(text => typeof text === 'string' && text.trim()));
  const features = weddingFeatureDetails(lang);
  assert.equal(features.length, 20); assert.deepEqual(features.map(feature => feature.id), identifiers);
  for (const feature of features) { assert.ok(feature.title && feature.body); assert.ok(feature.points.length >= 2 && feature.points.every(Boolean)); }
 }
 assert.equal(presentationCopy('sl').website, 'Vaša spletna poročna stran');
});

test('autosave compares normalized content independently of PostgreSQL jsonb key order', () => {
 const { suiteSnapshot } = load('lib/wedding-suite/autosave.ts');
 const original = { ...structuredClone(contracts.EMPTY_SUITE), welcome: { en: 'Welcome ', sl: 'Pozdrav' } };
 const reordered = Object.fromEntries(Object.entries(original).reverse()); reordered.welcome = { sl: 'Pozdrav', en: 'Welcome' };
 assert.equal(suiteSnapshot(original), suiteSnapshot(reordered));
 assert.equal(original.welcome.en, 'Welcome ', 'Normalization must never mutate the typing buffer');
 assert.notEqual(suiteSnapshot(original), suiteSnapshot({ ...original, welcome: { en: 'A real change' } }));
});

test('unfinished draft inputs survive reload but unsafe shapes never reach the editor or server', () => {
 const { isRecoverableSuiteDraft } = load('lib/wedding-suite/autosave.ts');
 const unfinished = { ...structuredClone(contracts.EMPTY_SUITE), seatingMapUrl: 'https://', tables: [{ id: uuid, name: '', capacity: 0 }] };
 assert.equal(configSchemaSafe(unfinished), false);
 assert.equal(isRecoverableSuiteDraft(unfinished), true);
 assert.equal(isRecoverableSuiteDraft({ ...unfinished, tables: null }), false);
 assert.equal(isRecoverableSuiteDraft({ ...unfinished, welcome: 'invalid' }), false);
 assert.equal(isRecoverableSuiteDraft({ ...unfinished, unexpected: true }), false);
 function configSchemaSafe(value) { return contracts.configSchema.safeParse(value).success; }
});

test('background translations preserve newer edits, removed rows, manual translations and page styling', () => {
 const { mergeSuiteTranslations, translationFingerprint } = load('lib/wedding-suite/autosave.ts');
 const source = { ...structuredClone(contracts.EMPTY_SUITE), welcome: { en: 'Welcome' }, invitation: { en: 'Join us' },
  story: [{ id: uuid, title: { en: 'Story' }, text: { en: 'Our story' } }],
  menuOptions: [{ id: uuid, title: { en: 'Dinner' } }],
  page: { title: { en: 'Wedding' }, font: 'classic', headingFont: 'classic', backgroundColor: '#ffffff', accentColor: '#123456', textColor: '#000000', sections: [] } };
 const translated = structuredClone(source);
 translated.welcome.de = 'Willkommen'; translated.invitation.de = 'Kommt'; translated.menuOptions[0].title.de = 'Abendessen'; translated.page.title.de = 'Hochzeit';
 const current = structuredClone(source); current.welcome.en = 'A newer source'; current.invitation.de = 'My correction'; current.story = [];
 current.tables = [{ id: uuid, name: 'New table', capacity: 8 }]; current.page.accentColor = '#ffffff';
 const original = structuredClone(current);
 const merged = mergeSuiteTranslations(current, source, translated);
 assert.deepEqual(current, original); assert.equal(merged.welcome.de, undefined); assert.equal(merged.invitation.de, 'My correction');
 assert.equal(merged.menuOptions[0].title.de, 'Abendessen'); assert.equal(merged.page.title.de, 'Hochzeit');
 assert.deepEqual(merged.story, []); assert.deepEqual(merged.tables, current.tables); assert.equal(merged.page.accentColor, '#ffffff');
 assert.equal(translationFingerprint(contracts.EMPTY_SUITE), null);
 assert.equal(translationFingerprint(source), translationFingerprint({ ...source, tables: current.tables }));
 assert.notEqual(translationFingerprint(source), translationFingerprint(current));
});

test('background translation authorizes and rate-limits before AI, returns suggestions without writing settings', async () => {
 let authorized = false, sameSite = true, rateAllowed = true, translations = 0, writes = 0;
 const reply = (body, status = 200) => Response.json(body, { status });
 class TestError extends Error { constructor(code, status = 400) { super(code); this.code = code; this.status = status; } }
 const route = modules({
  '@/lib/wedding/server': { sameOrigin: () => sameSite, reply },
  '@/lib/wedding-suite/server': { SuiteError: TestError, suiteFailure: e => reply({ error: e.code || 'unavailable' }, e.status || 503), suiteOwner: async () => { if (!authorized) throw new TestError('guestOnly', 401); return { album: { id: 'album-a' }, config }; } },
  '@/lib/rate-limit': { checkRateLimit: async key => key.startsWith('wedding-translate:') && !rateAllowed ? { ok: false, response: reply({ error: 'rate' }, 429) } : { ok: true } },
  '@/lib/wedding/translate': { translateSuite: async value => { translations++; return { ...value, welcome: { en: 'Welcome', de: 'Willkommen' } }; } },
  '@/lib/db': { db: { insert: () => { writes++; throw new Error('Translation must not write'); } } },
 })('app/api/albums/[slug]/wedding-suite/manage/route.ts');
 const context = { params: Promise.resolve({ slug: 'demo' }) };
 const request = value => ({ json: async () => ({ action: 'translate', config: value }) });
 assert.equal((await route.POST(request(config), context)).status, 401); assert.equal(translations, 0);
 authorized = true; sameSite = false;
 assert.equal((await route.POST(request(config), context)).status, 403); assert.equal(translations, 0);
 sameSite = true; rateAllowed = false;
 assert.equal((await route.POST(request(config), context)).status, 429); assert.equal(translations, 0);
 rateAllowed = true;
 assert.equal((await route.POST(request({ ...config, seatingMapUrl: 'javascript:bad' }), context)).status, 400); assert.equal(translations, 0);
 const response = await route.POST(request(config), context);
 assert.equal(response.status, 200); assert.equal((await response.json()).config.welcome.de, 'Willkommen');
 assert.equal(translations, 1); assert.equal(writes, 0);
});

test('all six languages have complete interface and email copy', () => {
 const keys = Object.keys(suiteCopy('en'));
 for (const lang of contracts.SUITE_LANGS) {
  const copy = suiteCopy(lang); assert.deepEqual(Object.keys(copy), keys);
  for (const [key, value] of Object.entries(copy)) assert.ok(typeof value === 'string' && value.trim(), `${lang}.${key}`);
  for (const kind of ['invitation','rsvp','thanks','capsule']) {
   const mail = weddingEmail({ kind, language: lang, name: 'Ana', couple: 'Ana & Marko', date: '2026-10-01', url: 'https://preview.example/wedding/celebrate', config });
   assert.match(mail.html, new RegExp(`<html lang="${lang}">`));
   assert.ok(mail.subject.includes(copy[`${kind}Subject`]));
   assert.ok(mail.html.includes(copy[`${kind}Intro`]));
  }
 }
});

test('custom content uses only the selected language and emails escape names, text, and URLs', () => {
 assert.equal(contracts.localized({ sl: 'Slovensko' }, 'de'), '');
 const custom = { ...config, invitation: { de: '<img src=x onerror=alert(1)>' } };
 const mail = weddingEmail({ kind:'invitation', language:'de', name:'<script>bad</script>', couple:'A & B', date:'2026-10-01', url:'https://preview.example/celebrate?x=1&y=2', config:custom });
 assert.ok(!mail.html.includes('<script>')); assert.ok(!mail.html.includes('<img src=x'));
 assert.ok(mail.html.includes('&lt;script&gt;')); assert.ok(mail.html.includes('A &amp; B')); assert.ok(mail.html.includes('x=1&amp;y=2'));
});

test('config, RSVP and entry contracts reject unsafe URLs, unsupported languages, and missing video', () => {
 assert.equal(contracts.configSchema.safeParse(config).success, true);
 assert.equal(contracts.configSchema.safeParse({ ...config, seatingMapUrl:'javascript:alert(1)' }).success, false);
 assert.equal(contracts.configSchema.safeParse({ ...config, defaultLang:'xx' }).success, false);
 assert.equal(contracts.configSchema.safeParse({ ...config, unexpected:true }).success, false);
 assert.equal(contracts.entrySchema.safeParse({ action:'entry', kind:'video', name:'Ana', message:'', photoId:null, language:'sl' }).success, false);
 const response = { action:'rsvp', language:'de', attending:'yes', companions:['Marko'], menuId:null, note:'', notifications:true };
 assert.equal(contracts.rsvpSchema.safeParse(response).success, true);
 assert.equal(contracts.rsvpSchema.safeParse({ ...response, companions:Array(11).fill('Guest') }).success, false);
});

test('capsules and RSVP deadlines use exact server timestamps including the boundary', () => {
 const instant = Date.parse('2027-10-01T00:00:00Z');
 assert.equal(contracts.capsuleIsOpen(config.capsuleUnlockAt, instant - 1), false);
 assert.equal(contracts.capsuleIsOpen(config.capsuleUnlockAt, instant), true);
 assert.equal(contracts.capsuleIsOpen(null, instant), false);
 assert.equal(contracts.rsvpIsOpen(config.capsuleUnlockAt, instant), true);
 assert.equal(contracts.rsvpIsOpen(config.capsuleUnlockAt, instant + 1), false);
});

test('invitation tokens cannot be altered, transferred between albums, or reused after rotation', () => {
 const attendee = { id:uuid, albumId:'album-a', tokenVersion:'version-one' }; const secret = 'test-only-secret-longer-than-thirty-two-characters';
 const token = tokens.invitationToken(attendee, secret);
 assert.equal(tokens.validInvitation(token, attendee, secret), true);
 assert.equal(tokens.validInvitation(`${token.slice(0,-1)}!`, attendee, secret), false);
 assert.equal(tokens.validInvitation(token, { ...attendee, albumId:'album-b' }, secret), false);
 assert.equal(tokens.validInvitation(token, { ...attendee, tokenVersion:'version-two' }, secret), false);
 assert.throws(() => tokens.invitationToken(attendee, 'short'));
});

function fixture(rows = [], flags = { albumPermission: 'view_upload' }) {
 const inserts = []; let sendCalls = 0;
 const query = () => { let projection;
  const q = { from() { return q; }, where() { return q; }, limit() { return q; }, orderBy() { return q; }, leftJoin() { return q; },
   then(resolve) { return Promise.resolve(rows.map(row => projection ? Object.fromEntries(Object.entries(projection).map(([key, column]) => [key, row[column.name.replace(/_([a-z])/g, (_, c) => c.toUpperCase())]])) : row)).then(resolve); }, setProjection(value) { projection = value; return q; } };
  return q;
 };
 const db = { select: value => query().setProjection(value), query:{ albums:{ findFirst:async()=>null } }, insert() {
  let payload;
  const q = { values(value) { payload=value; return q; }, onConflictDoNothing() { return q; }, returning() { inserts.push(payload); return Promise.resolve([{id:payload.id}]); } }; return q;
 } };
 const server = modules({ '@/lib/db':{ db }, '@/lib/album-flags': { getAlbumFlags: async () => flags }, '@/lib/wedding/server':{ digest:value=>require('node:crypto').createHash('sha256').update(value).digest('hex'), reply:Response.json, weddingForAlbum: async () => null },
  '@/lib/album-request-access':{}, '@/lib/storage/bunny':{ bunnyDisplayUrl:value=>value }, resend:{ Resend:class { constructor(){sendCalls++;throw new Error('Sending must not occur in preview');} } },
 })('lib/wedding-suite/server.ts');
 return { server, inserts, sendCalls:()=>sendCalls };
}
const oldEnv = { DATABASE_URL:process.env.DATABASE_URL, WEDDING_SUITE_DB_HOST:process.env.WEDDING_SUITE_DB_HOST, VERCEL_ENV:process.env.VERCEL_ENV, WEDDING_SUITE_SEND_EMAILS:process.env.WEDDING_SUITE_SEND_EMAILS, WEDDING_INVITE_SECRET:process.env.WEDDING_INVITE_SECRET };
afterEach(() => { for (const [key,value] of Object.entries(oldEnv)) { if (value===undefined) delete process.env[key];else process.env[key]=value; } });

test('the actual entry reader withholds capsule text, names, and media from owners and guests before release', async () => {
 const f=fixture([{ id:uuid, albumId:'album-a', kind:'capsule', name:'Secret author', message:'Hidden wish', photoId:null, language:'sl', approved:true, createdAt:new Date().toISOString() }]);
 for (const owner of [true,false]) {
  const entries=await f.server.visibleEntries({ id:'album-a' }, config, owner);
  assert.deepEqual(Object.keys(entries[0]).sort(), ['createdAt','id','kind','locked']);
  assert.equal(entries[0].locked,true); assert.ok(!JSON.stringify(entries).includes('Hidden wish'));
 }
 const open=await f.server.visibleEntries({ id:'album-a' }, { ...config,capsuleUnlockAt:'2020-01-01T00:00:00Z' },true);
 assert.equal(open[0].message,'Hidden wish');
});

test('upload-only gallery policy also hides wedding-suite media while preserving owner access', async () => {
 const rows = [
  { id: 'photo-entry', kind: 'guestbook', name: 'Guest', message: 'Attached photo', photoId: uuid, blobUrl: 'https://example.test/private-photo.jpg', status: 'published', approved: true },
  { id: 'text-entry', kind: 'guestbook', name: 'Guest', message: 'Text wish', photoId: null, approved: true },
 ];
 const hidden = fixture(rows, { albumPermission: 'upload_only' });
 const publicEntries = await hidden.server.visibleEntries({ id: 'album-a' }, config, false);
 assert.deepEqual(publicEntries.map(row => row.id), ['text-entry']);
 assert.ok(!JSON.stringify(publicEntries).includes('private-photo'));
 assert.equal((await hidden.server.visibleEntries({ id: 'album-a' }, config, true)).length, 2);
 const visible = fixture(rows);
 assert.equal((await visible.server.visibleEntries({ id: 'album-a' }, config, false)).length, 2);
});

test('QR suite eligibility falls back to existing album links for expired, downgraded or unavailable suites', async () => {
 // This tests the production fallback, independently of the deployment's Preview database pin.
 process.env.VERCEL_ENV = 'production';
 let reads = 0;
 const query = { from() { return query; }, where() { return query; }, limit: async () => { reads++; throw new Error('missing optional table'); } };
 const server = modules({
  '@/lib/db': { db: { select: () => query } },
  '@/lib/wedding/server': { activePremium: album => album.plan === 'premium' && (!album.expiresAt || album.expiresAt.getTime() > Date.now()) },
 })('lib/wedding-suite/server.ts');
 assert.equal(await server.suiteEnabled({ plan: 'free' }), false);
 assert.equal(await server.suiteEnabled({ plan: 'premium', expiresAt: new Date('2020-01-01') }), false);
 assert.equal(reads, 0);
 assert.equal(await server.suiteEnabled({ id: 'existing-album', plan: 'premium' }), false);
 assert.equal(reads, 1);
});

test('preview suite access requires a matching database pin before reading settings', async () => {
 process.env.VERCEL_ENV = 'preview';
 process.env.DATABASE_URL = 'postgresql://test-only-host/test';
 process.env.WEDDING_SUITE_DB_HOST = 'different-test-host';
 let reads = 0;
 const query = { from() { return query; }, where() { return query; }, limit: async () => { reads++; return [{config:{enabled:true}}]; } };
 const server = modules({
  '@/lib/db': { db: { select: () => query } },
  '@/lib/wedding/server': { activePremium: () => true },
 })('lib/wedding-suite/server.ts');
 assert.equal(await server.suiteEnabled({id:'test-only'}),false);
 assert.equal(reads,0);
 process.env.WEDDING_SUITE_DB_HOST = 'test-only-host';
 assert.equal(await server.suiteEnabled({id:'test-only'}),true);
 assert.equal(reads,1);
});

test('production deployment preflight never updates existing albums without an explicit repair argument', async () => {
 const script = readFileSync(resolve(root, 'scripts/migrate-wedding-premium.mjs'), 'utf8')
  .replace(/^import .*;\n/gm, '').replaceAll('import.meta.url', "'file:///isolated/scripts/migrate-wedding-premium.mjs'");
 const columns = { wedding_settings: ['album_id','enabled','requests_open','schedule','menu','challenges','dj_token_hash','updated_at'], wedding_song_requests: ['id','album_id','guest_token_hash','title','artist','requested_by','note','status','created_at'], wedding_bingo_submissions: ['id','album_id','challenge_id','photo_id','guest_token_hash','created_at'] };
 for (const table of ['wedding_suite_settings','wedding_suite_attendees','wedding_suite_entries','wedding_suite_emails']) {
  const migration = readFileSync(resolve(root, 'scripts/migrations/20261026-wedding-suite-production.sql'), 'utf8');
  const body = migration.split(`CREATE TABLE IF NOT EXISTS "${table}" (`)[1].split('\n);')[0];
  columns[table] = [...body.matchAll(/^\s*"([^"]+)"/gm)].map(match => match[1]);
 }
 const queries = [];
 const sql = (strings) => {
  const source = strings.join('?'); queries.push(source);
  if (source.includes('information_schema.columns')) return Promise.resolve(Object.entries(columns).flatMap(([table_name, values]) => values.map(column_name => ({ table_name, column_name }))));
  if (source.includes('to_regclass')) return Promise.resolve([{ name: null }]);
  return Promise.resolve([]);
 };
 sql.query = source => { queries.push(source); return Promise.resolve([]); };
 sql.transaction = values => Promise.all(values);
 const execute = new (Object.getPrototypeOf(async function(){}).constructor)('fs', 'neon', 'process', 'console', script);
 const run = argv => execute({ readFile: async url => readFileSync(url.pathname.includes('suite-production') ? resolve(root, 'scripts/migrations/20261026-wedding-suite-production.sql') : resolve(root, 'scripts/migrations/20260926-wedding-premium.sql'), 'utf8') }, () => sql, { env: { VERCEL_ENV: 'production', DATABASE_URL: 'isolated-test-value' }, argv }, { log() {} });
 await run([]);
 assert.ok(!queries.some(query => /\bUPDATE\s+(albums|user_plan_overrides)\b/i.test(query)));
 queries.length = 0;
 await run(['--backfill-premium-entitlements']);
 assert.ok(queries.some(query => /\bUPDATE\s+albums\b/i.test(query)));
});

test('mail preparation follows recipient language and preview never calls Resend even if sending flag is set', async () => {
 process.env.VERCEL_ENV='preview';process.env.WEDDING_SUITE_SEND_EMAILS='1';process.env.WEDDING_INVITE_SECRET='test-only-secret-longer-than-thirty-two-characters';
 const f=fixture(); const guest={ id:uuid,albumId:'album-a',tokenVersion:'one',language:'de',name:'Anna',email:'delivered@resend.dev',notifications:true };
 await f.server.queueMail({url:'https://isolated-preview.vercel.app/api/mail'},{id:'album-a',slug:'demo',coupleName:'Ana & Marko',weddingDate:'2026-10-01'},config,guest,'invitation',uuid);
 assert.equal(f.inserts[0].status,'preview');assert.equal(f.inserts[0].language,'de');assert.equal(f.sendCalls(),0);
 assert.ok(f.inserts[0].html.includes('<html lang="de">'));assert.ok(f.inserts[0].html.includes('https://isolated-preview.vercel.app/demo/celebrate?lang=de'));
 assert.ok(!f.inserts[0].html.includes('www.guestcam.si'));
 await assert.rejects(f.server.queueMail({url:'https://preview.example'}, {id:'album-a',slug:'demo'},config,guest,'capsule',uuid), {code:'locked'});
});

test('admin plan labels match the same multilingual pricing names while plan IDs remain premium', () => {
 const { adminPlanLabel }=load('lib/admin-plan-labels.ts');
 const { weddingCopy }=load('lib/wedding/copy.ts');
 for (const lang of contracts.SUITE_LANGS) assert.equal(adminPlanLabel('premium',lang),weddingCopy(lang).plan);
 assert.equal(adminPlanLabel('premium','sl'),'Poročni paket Premium');
});

test('admin email history prefers a separate key and explains send-only access without a crash', async () => {
 const old = { history:process.env.RESEND_HISTORY_API_KEY, send:process.env.RESEND_API_KEY }; let key;
 process.env.RESEND_HISTORY_API_KEY='test-history'; process.env.RESEND_API_KEY='test-send';
 try {
  const admin=modules({resend:{Resend:class{constructor(value){key=value;this.emails={list:async()=>({error:{name:'restricted_api_key',message:'This API key is restricted to only send emails',statusCode:401}})};}}}})('lib/admin-emails.ts');
  const result=await admin.listAdminEmails();assert.equal(key,'test-history');assert.equal(result.setupRequired,true);assert.match(result.error,/RESEND_HISTORY_API_KEY/);assert.equal(result.emails.length,0);
 } finally { for(const [env,value] of [['RESEND_HISTORY_API_KEY',old.history],['RESEND_API_KEY',old.send]]) { if(value===undefined)delete process.env[env];else process.env[env]=value; } }
});

test('preview QR and share origins stay on the deployment while production stays canonical', () => {
 const names = ['NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL', 'NEXT_PUBLIC_APP_URL'];
 const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
 try {
  process.env.NODE_ENV = 'production';
  process.env.VERCEL_ENV = 'preview';
  process.env.VERCEL_URL = 'wedding-suite-preview.vercel.app';
  process.env.NEXT_PUBLIC_APP_URL = 'https://retired.example';
  assert.equal(modules()('next.config.ts').default.env.NEXT_PUBLIC_APP_URL, 'https://wedding-suite-preview.vercel.app');
  process.env.VERCEL_ENV = 'production';
  assert.equal(modules()('next.config.ts').default.env.NEXT_PUBLIC_APP_URL, 'https://www.guestcam.si');
  process.env.NODE_ENV = 'development';
  delete process.env.NEXT_PUBLIC_APP_URL;
  assert.equal(modules()('next.config.ts').default.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3001');
 } finally {
  for (const [name, value] of Object.entries(previous)) {
   if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
 }
});

test('paid upgrades preserve album data and apply once with Mollie, legacy Stripe and Paddle references', async () => {
 for (const paymentRef of ['tr_test123', 'cs_test_legacy', 'txn_legacy']) {
  const existing = { slug: 'existing-album', plan: 'free', stripeSessionId: paymentRef, filmTier: null,
   photoCount: 12, pendingCount: 3, ownerClerkId: 'existing-owner', password: 'existing-hash', isPublished: true };
  const writes = [];
  const db = {
   query: { albums: { findFirst: async () => existing } },
   update: () => ({ set: values => ({ where: async () => { writes.push(values); Object.assign(existing, values); } }) }),
  };
  const { applyPlanToAlbum } = modules({ '@/lib/db': { db } })('lib/paddle-reconcile.ts');
  assert.deepEqual(await applyPlanToAlbum(existing.slug, 'premium', paymentRef), { plan: 'premium', status: 'applied' });
  assert.equal(writes.length, 1);
  assert.equal(existing.maxPhotos, 2_000_000_000);
  assert.equal(existing.expiresAt, null);
  assert.equal(existing.filmTier, 'premium');
  for (const [key, value] of Object.entries({ photoCount: 12, pendingCount: 3, ownerClerkId: 'existing-owner', password: 'existing-hash', isPublished: true })) assert.equal(existing[key], value);
  assert.deepEqual(await applyPlanToAlbum(existing.slug, 'premium', paymentRef), { plan: 'premium', status: 'already_applied' });
  assert.equal(writes.length, 1, 'duplicate callbacks must not rewrite the album');
  assert.equal(await applyPlanToAlbum(existing.slug, 'invalid-plan', paymentRef), null);
  assert.equal(writes.length, 1);
 }
});

test('wedding menu and timeline translations validate and render without changing original data', async () => {
 const { parseWeddingSettings, weddingRowText, EMPTY_WEDDING } = load('lib/wedding/contracts.ts');
 const input = { ...EMPTY_WEDDING, schedule: [{ id: 'ceremony', title: 'Obred', detail: 'Na vrtu', time: '18:00', sourceLang: 'sl', translations: { en: { title: 'Our ceremony' } } }] };
 const original = structuredClone(input);
 const { translateWedding } = load('lib/wedding/translate.ts');
 const result = await translateWedding(input, 'sl', async tasks => tasks.map(task => ({ id: task.id, text: `${task.targetLanguage}: ${task.source}` })));
 assert.deepEqual(input, original);
 assert.equal(result.schedule[0].time, '18:00');
 assert.equal(result.schedule[0].id, 'ceremony');
 assert.equal(weddingRowText(result.schedule[0], 'en', 'title'), 'Our ceremony');
 for (const lang of contracts.SUITE_LANGS) {
  assert.ok(weddingRowText(result.schedule[0], lang, 'detail').includes('Na vrtu'));
  assert.ok(parseWeddingSettings(result));
 }
 assert.equal(parseWeddingSettings({ ...input, schedule: [{ ...input.schedule[0], translations: { xx: { title: 'Bad' } } }] }), null);
 assert.equal(parseWeddingSettings({ ...input, schedule: [{ ...input.schedule[0], translations: { en: { title: 'x'.repeat(161) } } }] }), null);
 assert.equal(weddingRowText({ id: 'old', title: 'Original', detail: '' }, 'de', 'title'), 'Original');
});

test('suite translation fills all supported languages and preserves manual corrections, links and table identities', async () => {
 const { translateSuite } = load('lib/wedding/translate.ts');
 const input = { ...structuredClone(contracts.EMPTY_SUITE), welcome: { sl: 'Dobrodošli', de: 'Persönlich korrigiert' }, story: [{ id: uuid, title: { sl: 'Najina zgodba' }, text: { sl: 'Skupaj od 2020' }, url: 'https://example.test/photo.jpg' }], tables: [{ id: uuid, name: 'Ana', capacity: 8 }] };
 const original = structuredClone(input);
 const result = await translateSuite(input, async tasks => {
  assert.ok(!tasks.some(task => task.source === 'Ana' || task.source.startsWith('https:')));
  return tasks.map(task => ({ id: task.id, text: `${task.targetLanguage}: ${task.source}` }));
 });
 assert.deepEqual(input, original);
 assert.equal(result.welcome.de, 'Persönlich korrigiert');
 assert.deepEqual(result.tables, input.tables);
 assert.equal(result.story[0].url, input.story[0].url);
 for (const lang of contracts.SUITE_LANGS) assert.ok(result.story[0].text[lang]);
 let calls = 0;
 await translateSuite(result, async () => { calls++; return []; });
 assert.equal(calls, 0, 'fully translated content must not incur another AI call');
});

test('a manual translation of an empty optional detail never overwrites or repeatedly retranslates the original', async () => {
 const { translateWedding } = load('lib/wedding/translate.ts');
 const { EMPTY_WEDDING } = load('lib/wedding/contracts.ts');
 const input = { ...EMPTY_WEDDING, menu: [{ id: 'dinner', title: 'Dinner', detail: '', sourceLang: 'en', translations: { de: { detail: 'Vegetarisch' } } }] };
 const result = await translateWedding(input, 'en', async tasks => {
  assert.ok(!tasks.some(task => task.targetLanguage === 'en'));
  return tasks.map(task => ({ id: task.id, text: `${task.targetLanguage}: ${task.source}` }));
 });
 assert.equal(result.menu[0].detail, '');
 let called = false;
 await translateWedding(result, 'en', async () => { called = true; return []; });
 assert.equal(called, false);
});

test('incomplete, duplicated and overlong model output never changes organizer data', async () => {
 const { translateSuite } = load('lib/wedding/translate.ts');
 const input = { ...structuredClone(contracts.EMPTY_SUITE), menuOptions: [{ id: uuid, title: { en: 'Dinner' } }] };
 const original = structuredClone(input);
 for (const transform of [tasks => [], tasks => tasks.map(() => ({ id: tasks[0].id, text: 'duplicate' })), tasks => tasks.map(task => ({ id: task.id, text: 'x'.repeat(181) }))]) {
  await assert.rejects(translateSuite(input, async tasks => transform(tasks)));
  assert.deepEqual(input, original);
 }
});

test('gateway uses the server key and validates its JSON response; missing credentials fail without a request', async () => {
 const originalFetch = globalThis.fetch; const key = process.env.AI_GATEWAY_API_KEY;
 const { translateSuite } = load('lib/wedding/translate.ts');
 const input = { ...structuredClone(contracts.EMPTY_SUITE), welcome: { en: 'Welcome' } };
 let calls = 0;
 try {
  delete process.env.AI_GATEWAY_API_KEY;
  globalThis.fetch = async () => { calls++; throw new Error('unexpected'); };
  await assert.rejects(translateSuite(input), /not_configured/);
  assert.equal(calls, 0);
  process.env.AI_GATEWAY_API_KEY = 'test-only-gateway-key';
  globalThis.fetch = async (url, options) => {
   calls++; assert.equal(url, 'https://ai-gateway.vercel.sh/v1/chat/completions');
   assert.equal(options.headers.Authorization, 'Bearer test-only-gateway-key');
   const body = JSON.parse(options.body); const { tasks } = JSON.parse(body.messages[1].content);
   assert.equal(body.model, 'openai/gpt-4.1-mini');
   return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ translations: tasks.map(task => ({ id: task.id, text: `${task.targetLanguage}: Welcome` })) }) } }] });
  };
  const result = await translateSuite(input);
  assert.equal(calls, 1); assert.equal(result.welcome.de, 'de: Welcome');
 } finally {
  globalThis.fetch = originalFetch;
  if (key === undefined) delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY = key;
 }
});

test('wedding save authenticates first and saves original text with a warning if translation is unavailable', async () => {
 const { EMPTY_WEDDING } = load('lib/wedding/contracts.ts');
 const draft = { ...EMPTY_WEDDING, menu: [{ id: 'dinner', title: 'Dinner', detail: '' }] };
 let authorized = false, sameSite = true, saved, translated = 0;
 const reply = (data, status = 200) => Response.json(data, { status });
 const route = modules({
  '@/lib/wedding/server': { ownerAccess: async () => authorized ? { album: { id: 'album-a', defaultLang: 'en' } } : { response: reply({ error: 'signIn' }, 401) }, activePremium: () => true, sameOrigin: () => sameSite, reply, failure: (error, status) => reply({ error }, status) },
  '@/lib/rate-limit': { checkRateLimit: async () => ({ ok: true }) },
  '@/lib/wedding/translate': { translateWedding: async () => { translated++; throw new Error('not_configured'); } },
  '@/lib/db': { db: { insert: () => ({ values: value => ({ onConflictDoUpdate: async () => { saved = value; } }) }) } },
 })('app/api/albums/[slug]/wedding/manage/route.ts');
 const req = { nextUrl: new URL('https://preview.example/manage?translate=1'), json: async () => draft };
 const context = { params: Promise.resolve({ slug: 'demo' }) };
 assert.equal((await route.PUT(req, context)).status, 401); assert.equal(translated, 0);
 authorized = true; sameSite = false;
 assert.equal((await route.PUT(req, context)).status, 403); assert.equal(translated, 0);
 sameSite = true;
 const result = await route.PUT(req, context);
 assert.equal(result.status, 200); assert.equal((await result.json()).translationWarning, true);
 assert.equal(translated, 1); assert.equal(saved.menu[0].title, 'Dinner');
});

test('page designs round-trip without affecting old configs and reject unsafe style, links and duplicate IDs', () => {
 const { DEFAULT_PAGE } = load('lib/wedding-suite/page-design.ts');
 const page = { ...structuredClone(DEFAULT_PAGE), title: { en: 'Our wedding' }, sections: [{ id: uuid, category: 'ceremony', title: { en: 'Ceremony' }, visible: true,
  fields: [{ id: 'e305cce6-759a-4259-b382-4df1d4ac8896', type: 'link', text: { en: 'Directions' }, url: 'https://example.test/venue', font: 'classic', color: '#123456' }] }] };
 assert.deepEqual(contracts.configSchema.parse(contracts.EMPTY_SUITE), contracts.EMPTY_SUITE);
 assert.deepEqual(contracts.configSchema.parse({ ...contracts.EMPTY_SUITE, page }).page, page);
 for (const patch of [{ accent: 'red;position:fixed' }, { headingFont: 'url(https://bad.test)' }, { textColor: '#fff' }]) assert.equal(contracts.configSchema.safeParse({ ...contracts.EMPTY_SUITE, page: { ...page, ...patch } }).success, false);
 for (const url of ['javascript:alert(1)', 'http://example.test', 'https://user:secret@example.test']) {
  const bad = structuredClone(page); bad.sections[0].fields[0].url = url;
  assert.equal(contracts.configSchema.safeParse({ ...contracts.EMPTY_SUITE, page: bad }).success, false);
 }
 const duplicate = structuredClone(page); duplicate.sections[0].fields[0].id = uuid;
 assert.equal(contracts.configSchema.safeParse({ ...contracts.EMPTY_SUITE, page: duplicate }).success, false);
 const oversized = { ...page, sections: Array(13).fill(page.sections[0]) };
 assert.equal(contracts.configSchema.safeParse({ ...contracts.EMPTY_SUITE, page: oversized }).success, false);
});

test('page field reordering preserves multilingual content, formatting and input arrays', () => {
 const { movePageItem } = load('lib/wedding-suite/page-design.ts');
 const input = [{ id: 'a', text: { en: 'First', sl: 'Prvo' }, color: '#123456' }, { id: 'b', text: { en: 'Second' }, font: 'classic' }];
 const original = structuredClone(input);
 const result = movePageItem(input, 'a', 1);
 assert.deepEqual(input, original); assert.deepEqual(result.map(item => item.id), ['b', 'a']);
 assert.deepEqual(result[1], original[0]);
 assert.equal(movePageItem(input, 'missing', 1), input);
 assert.equal(movePageItem(input, 'a', -1), input);
});

test('custom page text is translated while typography, visibility and URLs remain untouched', async () => {
 const { translateSuite } = load('lib/wedding/translate.ts');
 const { DEFAULT_PAGE } = load('lib/wedding-suite/page-design.ts');
 const input = { ...structuredClone(contracts.EMPTY_SUITE), page: { ...structuredClone(DEFAULT_PAGE), accent: '#123456', title: { en: 'Our wedding', de: 'Unsere Hochzeit korrigiert' }, sections: [{ id: uuid, category: 'custom', title: { en: 'Details' }, visible: false,
  fields: [{ id: 'e305cce6-759a-4259-b382-4df1d4ac8896', type: 'link', text: { en: 'Directions' }, url: 'https://example.test/venue', font: 'classic' }] }] } };
 const result = await translateSuite(input, async tasks => {
  assert.ok(!tasks.some(task => task.source === '#123456' || task.source.startsWith('https:')));
  return tasks.map(task => ({ id: task.id, text: `${task.targetLanguage}: ${task.source}` }));
 });
 assert.equal(result.page.title.de, input.page.title.de);
 assert.equal(result.page.accent, input.page.accent);
 assert.equal(result.page.sections[0].visible, false);
 assert.equal(result.page.sections[0].fields[0].url, input.page.sections[0].fields[0].url);
 for (const lang of contracts.SUITE_LANGS) assert.ok(result.page.sections[0].fields[0].text[lang]);
 assert.equal(input.page.sections[0].fields[0].text.de, undefined);
});

test('hidden page categories are withheld by the public API and unsafe unsaved links remain inert', async () => {
 const { DEFAULT_PAGE, safePageLink } = load('lib/wedding-suite/page-design.ts');
 const input = { ...structuredClone(contracts.EMPTY_SUITE), page: { ...structuredClone(DEFAULT_PAGE), sections: [{ id: uuid, category: 'custom', title: { en: 'Private draft' }, visible: false, fields: [] }] } };
 const result = await fixture().server.publicSuite({ cookies: { get: () => undefined } }, { id: 'album-a', slug: 'demo' }, input);
 assert.deepEqual(result.config.page.sections, []);
 assert.ok(!JSON.stringify(result).includes('Private draft'));
 assert.equal(input.page.sections.length, 1, 'owner draft must be preserved');
 assert.equal(safePageLink('javascript:alert(1)'), undefined);
 assert.equal(safePageLink('https://name:secret@example.test'), undefined);
 assert.equal(safePageLink(''), undefined);
 assert.equal(safePageLink('https://example.test/venue'), 'https://example.test/venue');
});

test('deployment identifiers keep old tabs from mixing release assets', () => {
 const names=['NEXT_DEPLOYMENT_ID','VERCEL_DEPLOYMENT_ID','VERCEL_GIT_COMMIT_SHA'];
 const original=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try {
  for(const name of names) delete process.env[name];
  process.env.VERCEL_GIT_COMMIT_SHA='test-commit';
  assert.equal(modules()('next.config.ts').default.deploymentId,'test-commit');
  process.env.VERCEL_DEPLOYMENT_ID='test-deployment';
  assert.equal(modules()('next.config.ts').default.deploymentId,'test-deployment');
  process.env.NEXT_DEPLOYMENT_ID='platform-deployment';
  assert.equal(modules()('next.config.ts').default.deploymentId,'platform-deployment');
 } finally {for(const [name,value] of Object.entries(original)) {if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});

test('unified program drafts and AI suggestions preserve existing rows, source text and manual corrections', () => {
 const { EMPTY_WEDDING, parseWeddingSettings } = load('lib/wedding/contracts.ts');
 const { recoverableWeddingDraft, mergeWeddingTranslations, weddingSnapshot } = load('lib/wedding/autosave.ts');
 const source = { ...EMPTY_WEDDING, enabled: true, schedule: [{ id: 'ceremony', title: 'Obred', detail: 'Na vrtu', sourceLang: 'sl', time: '16:00' }], menu: [{ id: 'dinner', title: 'Večerja', detail: '', sourceLang: 'sl' }] };
 const translated = structuredClone(source);
 translated.schedule[0].translations = { en: { title: 'Ceremony', detail: 'In the garden' }, de: { title: 'Trauung', detail: 'Im Garten' } };
 const merged = mergeWeddingTranslations(source, source, translated);
 assert.deepEqual(merged.schedule[0].translations, translated.schedule[0].translations, 'all missing languages are filled');
 assert.deepEqual(merged.menu, source.menu);
 const edited = structuredClone(source); edited.schedule[0].translations = { en: { title: 'My own heading' } };
 assert.equal(mergeWeddingTranslations(edited, source, translated).schedule[0].translations.en.title, 'My own heading');
 edited.schedule[0].detail = 'A newer location';
 assert.equal(mergeWeddingTranslations(edited, source, translated).schedule[0].translations.en.detail, undefined);
 assert.equal(mergeWeddingTranslations({ ...source, schedule: [] }, source, translated).schedule.length, 0);
 const draft = { ...source, schedule: [{ id: 'new', title: '', detail: '', time: '', sourceLang: 'sl' }] };
 assert.equal(recoverableWeddingDraft(draft), true); assert.equal(parseWeddingSettings(draft), null);
 assert.equal(recoverableWeddingDraft({ ...draft, schedule: [{ ...draft.schedule[0], id: '../bad' }] }), false);
 assert.equal(weddingSnapshot(source), weddingSnapshot(Object.fromEntries(Object.entries(source).reverse())));
});

test('program translation suggestions authorize and validate without creating DJ links or writing settings', async () => {
 let authorized = false, writes = 0, calls = 0;
 const route = modules({
  '@/lib/wedding/server': {
   ownerAccess: async () => authorized ? { album: { id: 'album-a', defaultLang: 'sl' } } : { response: Response.json({}, { status: 401 }) },
   activePremium: () => true, sameOrigin: () => true,
   reply: value => Response.json(value), failure: (error, status) => Response.json({ error }, { status }),
  },
  '@/lib/rate-limit': { checkRateLimit: async () => ({ ok: true }) },
  '@/lib/db': { db: { insert() { writes++; throw new Error('Suggestions cannot write'); } } },
  '@/lib/wedding/translate': { translateWedding: async value => { calls++; return value; } },
 })('app/api/albums/[slug]/wedding/manage/route.ts');
 const { EMPTY_WEDDING } = load('lib/wedding/contracts.ts');
 const request = settings => ({ json: async () => ({ action: 'translate', source: 'sl', settings }) });
 const context = { params: Promise.resolve({ slug: 'test' }) };
 assert.equal((await route.POST(request(EMPTY_WEDDING), context)).status, 401); assert.equal(calls, 0);
 authorized = true;
 assert.equal((await route.POST(request({ ...EMPTY_WEDDING, schedule: [{ id: 'bad' }] }), context)).status, 400); assert.equal(calls, 0);
 assert.equal((await route.POST(request(EMPTY_WEDDING), context)).status, 200); assert.equal(calls, 1); assert.equal(writes, 0);
});

test('wedding artwork uploads enforce owner access and limits, optimize real image bytes, and never update album/gallery records', async () => {
 const sharp = require('sharp'); const { NextRequest } = require('next/server');
 let authorized = false, allowed = true, storage = true, storageFails = false, ownerReads = 0;
 const uploads = [];
 const route = modules({
  sharp: { default: sharp },
  '@/lib/wedding-suite/server': {
   suiteOwner: async () => { ownerReads++; if (!authorized) throw Object.assign(new Error('denied'), { status: 401 }); return { album: { id: 'album-only' } }; },
   suiteFailure: cause => Response.json({ error: 'unavailable' }, { status: cause.status || 503 }),
  },
  '@/lib/wedding/server': {
   sameOrigin: req => req.headers.get('origin') === new URL(req.url).origin,
   reply: (data, status = 200) => Response.json(data, { status }),
  },
  '@/lib/rate-limit': { checkRateLimit: async () => allowed ? { ok: true } : { ok: false, response: Response.json({}, { status: 429 }) } },
  '@/lib/storage/bunny': {
   isBunnyStorageConfigured: () => storage,
   uploadToBunnyStorage: async (stream, key, type) => {
    if (storageFails) throw new Error('provider error');
    uploads.push({ key, type, bytes: Buffer.from(await new Response(stream).arrayBuffer()) });
    return `https://cdn.example.test/${key}`;
   },
  },
  '@/lib/db': { db: new Proxy({}, { get() { throw new Error('Image upload must not write album or gallery data'); } }) },
 })('app/api/albums/[slug]/wedding-suite/images/route.ts');
 const context = { params: Promise.resolve({ slug: 'isolated' }) };
 const image = await sharp({ create: { width: 3200, height: 1600, channels: 3, background: '#855477' } }).jpeg().toBuffer();
 const request = (body = image, type = 'image/jpeg', extra = {}) => new NextRequest('https://preview.test/api/albums/isolated/wedding-suite/images', { method: 'PUT', headers: { origin: 'https://preview.test', 'content-type': type, ...extra }, body, duplex: 'half' });
 assert.equal((await route.PUT(request(), context)).status, 401); assert.equal(uploads.length, 0);
 authorized = true; const beforeCsrf = ownerReads;
 assert.equal((await route.PUT(request(image, 'image/jpeg', { origin: 'https://foreign.test' }), context)).status, 403); assert.equal(ownerReads, beforeCsrf);
 allowed = false; assert.equal((await route.PUT(request(), context)).status, 429); allowed = true;
 storage = false; assert.equal((await route.PUT(request(), context)).status, 503); storage = true;
 assert.equal((await route.PUT(request(image, 'image/svg+xml'), context)).status, 400);
 assert.equal((await route.PUT(request(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'), 'image/png'), context)).status, 400);
 assert.equal((await route.PUT(request(Buffer.from('not an image')), context)).status, 400);
 assert.equal((await route.PUT(request(Buffer.alloc(0)), context)).status, 400);
 assert.equal((await route.PUT(request(image, 'image/jpeg', { 'content-length': String(4 * 1024 * 1024) }), context)).status, 413);
 const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(2 * 1024 * 1024)); controller.enqueue(new Uint8Array(2 * 1024 * 1024)); controller.close(); } });
 assert.equal((await route.PUT(request(stream), context)).status, 413);
 assert.equal(uploads.length, 0);
 const response = await route.PUT(request(), context); assert.equal(response.status, 200);
 const result = await response.json(); assert.match(result.url, /^https:\/\/cdn\.example\.test\/albums\/album-only\/wedding-site\/[a-f0-9-]+\.webp$/);
 const info = await sharp(uploads[0].bytes).metadata(); assert.equal(info.format, 'webp'); assert.equal(info.width, 2400); assert.equal(info.height, 1200); assert.equal(info.exif, undefined); assert.equal(uploads[0].type, 'image/webp');
 storageFails = true; assert.equal((await route.PUT(request(), context)).status, 502);
});

test('page image fields round-trip with optional translated captions, preserve older pages, and reject unsafe photo URLs', async () => {
 const { pageDesignSchema } = load('lib/wedding-suite/contracts.ts');
 const { imageCopy } = load('lib/wedding-suite/image-copy.ts');
 const { builderCopy } = load('lib/wedding-suite/builder-copy.ts');
 const { DEFAULT_PAGE } = load('lib/wedding-suite/page-design.ts');
 const page = { ...DEFAULT_PAGE, sections: [{ id: uuid, category: 'custom', title: { en: 'Our story' }, visible: true, fields: [{ id: 'b2c41a03-a4ef-44dc-a332-0c8909770111', type: 'image', text: {}, url: 'https://cdn.example.test/wedding.webp' }] }] };
 assert.equal(pageDesignSchema.safeParse(DEFAULT_PAGE).success, true);
 assert.deepEqual(pageDesignSchema.parse(page), page);
 assert.equal(pageDesignSchema.safeParse({ ...page, sections: [{ ...page.sections[0], fields: [{ ...page.sections[0].fields[0], url: 'javascript:alert(1)' }] }] }).success, false);
 const translated = await load('lib/wedding/translate.ts').translateSuite({ ...config, page: { ...page, sections: [{ ...page.sections[0], fields: [{ ...page.sections[0].fields[0], text: { en: 'A special memory' } }] }] } }, async tasks => tasks.map(task => ({ id: task.id, text: `${task.targetLanguage}: ${task.source}` })));
 assert.equal(translated.page.sections[0].fields[0].url, page.sections[0].fields[0].url);
 for (const lang of contracts.SUITE_LANGS) {
  assert.ok(Object.values(imageCopy(lang)).every(value => value.trim())); assert.ok(builderCopy(lang).image);
  assert.ok(translated.page.sections[0].fields[0].text[lang]);
 }
});

test('wedding artwork storage sends a known content length to the existing Bunny storage API', async () => {
 const originalFetch = globalThis.fetch;
 const names = ['BUNNY_STORAGE_API_KEY','BUNNY_STORAGE_ZONE','BUNNY_CDN_URL'];
 const saved = Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try {
  Object.assign(process.env,{BUNNY_STORAGE_API_KEY:'isolated-dummy',BUNNY_STORAGE_ZONE:'isolated-zone',BUNNY_CDN_URL:'https://cdn.example.test'});
  const bytes = new Uint8Array([1,2,3,4]);
  globalThis.fetch = async (url, request) => {
   assert.equal(url,'https://storage.bunnycdn.com/isolated-zone/albums/test/wedding-site/test.webp');
   assert.equal(request.method,'PUT'); assert.equal(request.headers['Content-Type'],'image/webp'); assert.equal(request.headers['Content-Length'],'4');
   assert.deepEqual(new Uint8Array(await new Response(request.body).arrayBuffer()), bytes);
   return new Response('',{status:201});
  };
  const storage = modules()('lib/storage/bunny.ts');
  assert.equal(await storage.uploadToBunnyStorage(new Blob([bytes]).stream(),'albums/test/wedding-site/test.webp','image/webp',bytes.length),'https://cdn.example.test/albums/test/wedding-site/test.webp');
 } finally {
  globalThis.fetch = originalFetch;
  for(const [name,value]of Object.entries(saved)){if(value===undefined)delete process.env[name];else process.env[name]=value;}
 }
});
