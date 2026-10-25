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

function fixture(rows = []) {
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
 const server = modules({ '@/lib/db':{ db }, '@/lib/wedding/server':{ digest:value=>require('node:crypto').createHash('sha256').update(value).digest('hex'), reply:Response.json },
  '@/lib/album-request-access':{}, '@/lib/storage/bunny':{ bunnyDisplayUrl:value=>value }, resend:{ Resend:class { constructor(){sendCalls++;throw new Error('Sending must not occur in preview');} } },
 })('lib/wedding-suite/server.ts');
 return { server, inserts, sendCalls:()=>sendCalls };
}
const oldEnv = { VERCEL_ENV:process.env.VERCEL_ENV, WEDDING_SUITE_SEND_EMAILS:process.env.WEDDING_SUITE_SEND_EMAILS, WEDDING_INVITE_SECRET:process.env.WEDDING_INVITE_SECRET };
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
 assert.equal(adminPlanLabel('premium','sl'),'Poročni premium');
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
