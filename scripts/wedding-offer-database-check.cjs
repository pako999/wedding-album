// Isolated PostgreSQL-engine checks. Install @electric-sql/pglite@0.3.14 outside the checkout.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const appRequire = createRequire(path.join(root, 'package.json'));
const ts = appRequire('typescript');
const { PGlite } = require(process.env.PGLITE_MODULE_PATH || '/tmp/wedding-db-check/node_modules/@electric-sql/pglite');
function load(file) {
  const full = path.resolve(root, file); const output = {};
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', code)(name => name.startsWith('.') ? load(path.relative(root, path.resolve(path.dirname(full), name)) + '.ts') : appRequire(name), output);
  return output;
}
(async () => {
  const pg = new PGlite();
  try {
    await pg.exec("CREATE TABLE bank_orders (id text PRIMARY KEY, plan_price integer NOT NULL); INSERT INTO bank_orders VALUES ('historical',84); CREATE TABLE albums(id text PRIMARY KEY, plan text); INSERT INTO albums VALUES ('existing','premium');");
    const migration = fs.readFileSync(path.join(root, 'scripts/migrations/20261025-wedding-launch-offer.sql'), 'utf8');
    await pg.transaction(tx => tx.exec(migration));
    await pg.transaction(tx => tx.exec(migration));
    assert.equal((await pg.query("SELECT plan_price FROM bank_orders WHERE id='historical'")).rows[0].plan_price, '84.00');
    await pg.query('INSERT INTO bank_orders VALUES ($1,$2)', ['decimal-invoice', '132.30']);
    assert.equal((await pg.query("SELECT plan_price FROM bank_orders WHERE id='decimal-invoice'")).rows[0].plan_price, '132.30');
    const sql = async (strings, ...values) => (await pg.query(strings.map((text, index) => text + (index < values.length ? '$' + (index + 1) : '')).join(''), values)).rows;
    const { createWeddingOfferStore } = load('lib/wedding-offer.ts'); const store = createWeddingOfferStore(() => sql);
    assert.equal((await store.quote()).remaining, 20);
    const duplicates = await Promise.allSettled([store.reserve('same-account', 'one', 'card'), store.reserve('same-account', 'two', 'card')]);
    const duplicateClaims = duplicates.filter(result => result.status === 'fulfilled' && result.value).map(result => result.value);
    assert.equal(duplicateClaims.length, 1); assert.equal((await store.quote()).remaining, 19);
    await store.releaseRejected(duplicateClaims[0].attemptId); assert.equal((await store.quote()).remaining, 20);
    const starts = await Promise.all(Array.from({ length: 40 }, (_, i) => store.reserve('customer-' + i, 'album-' + i, i % 2 ? 'card' : 'invoice')));
    assert.equal(starts.filter(Boolean).length, 20, 'forty simultaneous attempts can claim only twenty slots');
    assert.equal((await store.quote()).remaining, 0);
    assert.equal((await store.quote()).priceCents, 18900);
    const claim = starts[0]; await store.bind(claim.attemptId, 'bank:one');
    await store.settleBank('one', true); await store.settleBank('one', true);
    assert.equal((await store.quote('customer-0')).eligible, false);
    await store.settleBank('one', false);
    assert.equal((await store.quote()).remaining, 0, 'paid purchases and refunds never reopen a used launch place');
    const canceled = starts[1]; await store.bind(canceled.attemptId, 'tr_cancel');
    await store.settle(canceled.attemptId, 'tr_other', 'album-1', false);
    assert.equal((await store.quote()).remaining, 0, 'unrelated payment cannot release a reservation');
    await store.settle(canceled.attemptId, 'tr_cancel', 'album-1', false);
    await store.settle(canceled.attemptId, 'tr_cancel', 'album-1', false);
    assert.equal((await store.quote()).remaining, 1);
    assert.equal((await store.quote()).priceCents, 13230);
    const last = await store.reserve('last-customer', 'last-album', 'card');
    assert.ok(last); assert.equal(await store.reserve('last-customer', 'other-album', 'card'), null);
    await store.releaseRejected(last.attemptId); assert.equal((await store.quote()).remaining, 1);
    // A missing/uninitialized campaign must not fabricate twenty places or a discounted price.
    await pg.exec('DROP TABLE wedding_offer_slots');
    await store.settleBank('historical', true);
    assert.equal((await store.quote()).verified, false); assert.equal((await store.quote()).remaining, null);
    assert.equal((await store.quote()).priceCents, 18900);
    assert.deepEqual((await pg.query('SELECT * FROM albums')).rows, [{ id: 'existing', plan: 'premium' }]);
    const clean = new PGlite();
    try {
      await clean.exec("CREATE TABLE albums(slug text); INSERT INTO albums VALUES ('wedding-suite-demo'); CREATE TABLE bank_orders(id text, plan_price integer NOT NULL);");
      const tagged = (strings, ...values) => ({ text: strings.map((text, index) => text + (index < values.length ? '$' + (index + 1) : '')).join(''), values });
      tagged.query = text => ({ text, values: [] });
      tagged.transaction = statements => clean.transaction(async tx => { const results = []; for (const statement of statements) results.push((await tx.query(statement.text, statement.values)).rows); return results; });
      const { prepareWeddingOfferPreview } = await import(require('node:url').pathToFileURL(path.join(root, 'scripts/prepare-wedding-offer-preview.mjs')).href);
      const env = { VERCEL_ENV:'preview', VERCEL_GIT_COMMIT_REF:'feat/wedding-suite-multilingual-preview', VERCEL_PROJECT_ID:'prj_EDblP7nig2nLLZTQlxnrkusvxoSj', DATABASE_URL:'postgresql://isolated/preview', WEDDING_SUITE_DB_HOST:'isolated' };
      assert.equal((await prepareWeddingOfferPreview({ env, connect: () => tagged })).prepared, true);
      await clean.exec("UPDATE wedding_offer_slots SET state='paid', customer_id='verified-test-customer', attempt_id='verified-test-attempt' WHERE slot=1");
      assert.equal((await prepareWeddingOfferPreview({ env, connect: () => tagged })).prepared, true);
      assert.equal((await clean.query("SELECT count(*)::int AS available FROM wedding_offer_slots WHERE state='available'")).rows[0].available, 19, 'preview rebuild must never reset paid inventory');
      await clean.exec("INSERT INTO albums VALUES ('non-demo-album')");
      assert.equal((await prepareWeddingOfferPreview({ env, connect: () => tagged })).reason, 'existing-data-requires-manual-review');
    } finally { await clean.close(); }
    console.log('PASS offer database: real PostgreSQL engine, idempotent migration, exact €132.30, forty competing attempts capped at twenty, account uniqueness, paid/cancel idempotency, verified releases, safe unavailable fallback, unchanged existing albums and guarded preview rebuilds preserving used inventory.');
  } finally { await pg.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
