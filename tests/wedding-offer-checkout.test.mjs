import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
function modules(overrides) {
 const cache = new Map();
 const load = file => {
  if (file in overrides) return overrides[file];
  const full = path.resolve(root, file); if (cache.has(full)) return cache.get(full);
  const output = {}; cache.set(full, output);
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', code)(name => {
   if (name in overrides) return overrides[name];
   if (name.startsWith('@/')) return load(name.slice(2) + '.ts');
   if (name.startsWith('.')) return load(path.resolve(path.dirname(full), name) + '.ts');
   return require(name);
  }, output);
  return output;
 };
 return load;
}
const attemptId = 'a2c41a03-a4ef-44dc-a332-0c8909770111';
class Rejection extends Error { constructor(status) { super('provider_rejected'); this.status = status; } }
function fixture({ eligible = true, reserve = true, pending = false, authorized = true, failure = null, discountValid = false } = {}) {
 let calls = 0, reservations = 0, releases = 0, payment, invoice;
 const quote = { verified: true, remaining: eligible ? 1 : 0, capacity: 20, eligible, pending, priceCents: eligible ? 11340 : 18900 };
 const album = { id: 'album-a', slug: 'demo', ownerClerkId: 'customer-a', ownerEmail: 'test@example.test', notifyEmail: 'test@example.test', defaultLang: 'en' };
 const offer = { quote: async () => quote, reserve: async () => { reservations++; return reserve ? { attemptId, slot: 20 } : null; }, bind: async () => {}, releaseRejected: async () => { releases++; } };
 const db = { query: { albums: { findFirst: async () => album } }, update: () => ({ set: () => ({ where: async () => {} }) }), insert: () => ({ values: value => ({ onConflictDoNothing: async () => {}, returning: async () => { invoice = value; return [{ id: 'invoice-a' }]; } }) }) };
 const load = modules({
  '@/lib/wedding-offer': { weddingOffer: offer }, '@/lib/db': { db },
  '@clerk/nextjs/server': { auth: async () => ({ userId: authorized ? 'customer-a' : null }), currentUser: async () => null },
  '@/lib/album-ownership': { checkAlbumOwnership: async () => ({ ok: authorized, status: 403, error: 'Forbidden' }) },
  '@/lib/mollie': { mollieConfigured: () => true, MollieError: Rejection, createPayment: async value => { calls++; payment = value; if (failure) throw failure; return { id: 'tr_test123', checkoutUrl: 'https://checkout.example.test/pay' }; } },
  '@/lib/discount': { validateDiscount: async () => ({ valid: discountValid, error: 'invalid_code', finalCents: 9639, finalPrice: 96.39 }), incrementDiscountUsage: async () => {} },
  '@/lib/affiliate/attribution': { getAffiliateRefFromCookie: async () => null }, '@/lib/referral/attribution': { getGuestRefFromCookie: async () => null },
  '@/lib/stand-orders': { recordStandOrder: async () => {} },
  '@/lib/email/notifications': { sendBankOrderConfirmation: async () => {}, sendAdminBankOrderEmail: async () => {} },
  '@/lib/telegram': { notifyTelegram: async () => true, htmlEscape: value => value },
 });
 const run = async (method, body = {}) => load(method === 'card' ? 'app/api/checkout/route.ts' : 'app/api/bank-order/route.ts').POST({ nextUrl: new URL('https://preview.example.test/api/checkout'), json: async () => ({ planId: 'premium', albumSlug: 'demo', locale: 'en', expectedPlanCents: 11340, ...body }) });
 return { run, state: () => ({ calls, reservations, releases, payment, invoice }) };
}
test('card checkout charges exactly 11340 cents and binds its own offer metadata/idempotency key', async () => {
 const f = fixture(); assert.equal((await f.run('card')).status, 200);
 assert.equal(f.state().payment.amountCents, 11340);
 assert.equal(f.state().payment.metadata.weddingOfferAttempt, attemptId);
 assert.equal(f.state().payment.idempotencyKey, attemptId);
 assert.equal(f.state().reservations, 1);
});
test('stale price, lost final slot, pending checkout and unauthorized customer never create a payment', async () => {
 for (const options of [{ eligible: false }, { reserve: false }, { pending: true }, { authorized: false }]) {
  const f = fixture(options); const res = await f.run('card'); assert.ok([401,409].includes(res.status)); assert.equal(f.state().calls, 0);
 }
 const f = fixture({ eligible: false }); assert.equal((await f.run('card', { expectedPlanCents: 18900 })).status, 200);
 assert.equal(f.state().payment.amountCents, 18900); assert.equal(f.state().reservations, 0);
});
test('only a definitive provider rejection releases an unbound place; uncertain errors retain it for reconciliation', async () => {
 const rejected = fixture({ failure: new Rejection(422) }); assert.equal((await rejected.run('card')).status, 422); assert.equal(rejected.state().releases, 1);
 const uncertain = fixture({ failure: new Error('connection_lost') }); assert.equal((await uncertain.run('card')).status, 500); assert.equal(uncertain.state().releases, 0);
});
test('invoices persist 113.40 euros and a decimal discount without truncation', async () => {
 const f = fixture(); assert.equal((await f.run('invoice')).status, 200); assert.equal(f.state().invoice.planPrice, 113.40);
 const discount = fixture({ discountValid: true }); assert.equal((await discount.run('invoice', { discountCode: 'TEST', expectedPlanCents: 9639 })).status, 200); assert.equal(discount.state().invoice.planPrice, 96.39);
});
test('invalid invoice codes and stale quotes do not create invoices or reserve campaign stock', async () => {
 for (const [options, body] of [[{}, { discountCode: 'INVALID' }], [{ eligible: false }, {}], [{ authorized: false }, {}]]) {
  const f = fixture(options); assert.ok((await f.run('invoice', body)).status >= 400); assert.equal(f.state().reservations, 0); assert.equal(f.state().invoice, undefined);
 }
});
test('other plans keep existing prices and do not reserve wedding campaign places', async () => {
 const f = fixture(); assert.equal((await f.run('card', { planId: 'basic' })).status, 200); assert.equal(f.state().payment.amountCents, 3900); assert.equal(f.state().reservations, 0);
});
test('webhooks settle campaign inventory only after fetching the provider payment', async () => {
 for (const status of ['canceled','expired','failed','paid','refunded']) {
  const transitions = []; let fetched = false;
  const route = modules({
   '@/lib/wedding-offer': { weddingOffer: { settle: async (...args) => { assert.equal(fetched, true); transitions.push(args); } } },
   '@/lib/mollie': { mollieConfigured: () => true, isPaidStatus: value => value === 'paid', isRefundedStatus: value => value === 'refunded', getPayment: async () => { fetched = true; return { status, metadata: { albumSlug: 'demo', planId: 'premium', weddingOfferAttempt: attemptId } }; } },
   '@/lib/webhook-idempotency': { claimWebhookEvent: async () => true },
   '@/lib/paddle-reconcile': { applyPlanToAlbum: async () => ({ plan: 'premium', status: 'already_applied' }) },
   '@/lib/db': { db: { query: { affiliateCommissions: { findFirst: async () => null } } } },
  })('app/api/webhooks/mollie/route.ts');
  assert.equal((await route.POST({ text: async () => 'id=tr_test123' })).status, 200);
  assert.deepEqual(transitions, [[attemptId, 'tr_test123', 'demo', ['paid','refunded'].includes(status)]]);
 }
});

test('preview initializer never connects in production, on other branches or to an unpinned host', async () => {
 const { prepareWeddingOfferPreview } = await import('../scripts/prepare-wedding-offer-preview.mjs');
 let calls = 0;
 const base = { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feat/wedding-suite-multilingual-preview', VERCEL_PROJECT_ID: 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj', DATABASE_URL: 'postgresql://isolated/preview', WEDDING_SUITE_DB_HOST: 'isolated' };
 for (const patch of [{ VERCEL_ENV: 'production' }, { VERCEL_GIT_COMMIT_REF: 'main' }, { WEDDING_SUITE_DB_HOST: 'other-host' }, { VERCEL_PROJECT_ID: 'other-project' }]) {
  const result = await prepareWeddingOfferPreview({ env: { ...base, ...patch }, connect: () => { calls++; throw new Error('must not connect'); } });
  assert.equal(result.prepared, false);
 }
 assert.equal(calls, 0);
});

test('preview initializer refuses databases containing non-demo albums or invoices', async () => {
 const { prepareWeddingOfferPreview } = await import('../scripts/prepare-wedding-offer-preview.mjs');
 const env = { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feat/wedding-suite-multilingual-preview', VERCEL_PROJECT_ID: 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj', DATABASE_URL: 'postgresql://isolated/preview', WEDDING_SUITE_DB_HOST: 'isolated' };
 for (const counts of [[{ total: 2, demo: 1 }, { total: 0 }], [{ total: 1, demo: 1 }, { total: 1 }]]) {
  const sql = () => ({}); sql.transaction = async () => counts.map(row => [row]);
  const result = await prepareWeddingOfferPreview({ env, connect: () => sql, readFile: async () => { throw new Error('migration must not be read'); } });
  assert.equal(result.reason, 'existing-data-requires-manual-review');
 }
});

test('only the verified empty/demo preview can apply the idempotent inventory migration', async () => {
 const { prepareWeddingOfferPreview } = await import('../scripts/prepare-wedding-offer-preview.mjs');
 const env = { VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'feat/wedding-suite-multilingual-preview', VERCEL_PROJECT_ID: 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj', DATABASE_URL: 'postgresql://isolated/preview', WEDDING_SUITE_DB_HOST: 'isolated' };
 let transactions = 0, statements = 0;
 const sql = () => ({}); sql.query = () => { statements++; return {}; };
 sql.transaction = async () => ++transactions === 1 ? [[{ total: 1, demo: 1 }], [{ total: 0 }]] : [];
 const result = await prepareWeddingOfferPreview({ env, connect: () => sql, readFile: async () => 'CREATE TABLE test_only(id text); INSERT INTO test_only VALUES (1);' });
 assert.equal(result.prepared, true); assert.equal(transactions, 2); assert.equal(statements, 2);
});

test('production offer initializer only connects in the verified production project on main', async () => {
 const { prepareWeddingOfferProduction } = await import('../scripts/prepare-wedding-offer-production.mjs');
 let connections = 0; const connect = () => { connections++; throw new Error('must not connect'); };
 assert.equal((await prepareWeddingOfferProduction({env:{VERCEL_ENV:'preview'},connect})).prepared,false);
 const env = {VERCEL_ENV:'production',VERCEL_PROJECT_ID:'wrong',VERCEL_GIT_COMMIT_REF:'main'};
 await assert.rejects(prepareWeddingOfferProduction({env,connect}),/verified GuestCam/);
 await assert.rejects(prepareWeddingOfferProduction({env:{...env,VERCEL_PROJECT_ID:'prj_EDblP7nig2nLLZTQlxnrkusvxoSj'},connect}),/database is not configured/);
 assert.equal(connections,0);
});

test('production-target feature branch builds skip offer activation without touching the database', async () => {
 const { prepareWeddingOfferProduction } = await import('../scripts/prepare-wedding-offer-production.mjs');
 const env = { VERCEL_ENV: 'production', VERCEL_PROJECT_ID: 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj', DATABASE_URL: 'postgresql://must-not-connect/production' };
 const unexpected = () => { assert.fail('a non-main build must not access the campaign database or migration'); };
 for (const branch of ['fix/wedding-autosave', 'feat/wedding-suite-multilingual-preview', '', undefined]) {
  assert.deepEqual(await prepareWeddingOfferProduction({ env: { ...env, VERCEL_GIT_COMMIT_REF: branch }, connect: unexpected, readFile: unexpected }), {
   prepared: false, reason: 'not-production-main-branch',
  });
 }
 await assert.rejects(prepareWeddingOfferProduction({ env: { ...env, VERCEL_PROJECT_ID: 'other-project', VERCEL_GIT_COMMIT_REF: 'fix/wedding-autosave' }, connect: unexpected, readFile: unexpected }), /verified GuestCam/);
});

test('verified main builds still activate the offer with locks and propagate database failures', async () => {
 const { prepareWeddingOfferProduction } = await import('../scripts/prepare-wedding-offer-production.mjs');
 const env = { VERCEL_ENV: 'production', VERCEL_PROJECT_ID: 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj', VERCEL_GIT_COMMIT_REF: 'main', DATABASE_URL: 'postgresql://test-only/production' };
 let connections = 0, migrations = 0;
 const statements = [];
 const sql = (strings) => {
  const statement = strings.join(''); statements.push(statement);
  return statement.includes('information_schema.columns') ? [{ data_type: 'numeric', numeric_precision: 12, numeric_scale: 2 }] : {};
 };
 sql.query = statement => { statements.push(statement); return {}; };
 sql.transaction = async queries => { assert.equal(queries.length, 4); migrations++; };
 const args = { env, connect: url => { assert.equal(url, env.DATABASE_URL); connections++; return sql; }, readFile: async () => 'ALTER TABLE bank_orders ALTER COLUMN plan_price TYPE numeric(12,2); INSERT INTO test_campaign VALUES (1);' };
 assert.deepEqual(await prepareWeddingOfferProduction(args), { prepared: true, reason: 'twenty-place-offer-ready' });
 assert.equal(connections, 1); assert.equal(migrations, 1);
 assert.ok(statements.some(statement => statement.includes('pg_advisory_xact_lock')));
 assert.ok(statements.some(statement => statement.includes('lock_timeout')));
 assert.ok(statements.includes('INSERT INTO test_campaign VALUES (1)'));
 assert.ok(!statements.some(statement => statement.startsWith('ALTER TABLE')));
 sql.transaction = async () => { throw new Error('database unavailable'); };
 await assert.rejects(prepareWeddingOfferProduction(args), /database unavailable/);
});
