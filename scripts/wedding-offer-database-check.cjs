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
    const legacyMigration = fs.readFileSync(path.join(root, 'scripts/migrations/20261025-wedding-eight-offer.sql'), 'utf8');
    const expandedMigration = fs.readFileSync(path.join(root, 'scripts/migrations/20261026-wedding-twenty-offer.sql'), 'utf8');
    const migration = fs.readFileSync(path.join(root, 'scripts/migrations/20261026-wedding-batch-offer.sql'), 'utf8');
    await pg.transaction(tx => tx.exec(legacyMigration));
    assert.equal((await pg.query("SELECT plan_price FROM bank_orders WHERE id='historical'")).rows[0].plan_price, '84.00');
    await pg.query('INSERT INTO bank_orders VALUES ($1,$2)', ['decimal-invoice', '113.40']);
    assert.equal((await pg.query("SELECT plan_price FROM bank_orders WHERE id='decimal-invoice'")).rows[0].plan_price, '113.40');
    const sql = async (strings, ...values) => (await pg.query(strings.map((text, index) => text + (index < values.length ? '$' + (index + 1) : '')).join(''), values)).rows;
    const { createWeddingOfferStore } = load('lib/wedding-offer.ts'); const store = createWeddingOfferStore(() => sql);
    assert.equal((await store.quote()).verified, true, 'the existing eight-row batch must keep its discount during rollout');
    assert.equal((await store.quote()).remaining, 8);
    assert.equal((await store.quote()).capacity, 20);
    assert.equal((await store.quote()).priceCents, 11340);
    const oldPaid = await store.reserve('existing-paid', 'existing-paid-album', 'card');
    const oldPending = await store.reserve('existing-pending', 'existing-pending-album', 'invoice');
    await store.bind(oldPaid.attemptId, 'tr_existing_paid');
    await store.settle(oldPaid.attemptId, 'tr_existing_paid', 'existing-paid-album', true);
    await store.bind(oldPending.attemptId, 'bank:existing-pending');
    const originalRows = (await pg.query('SELECT * FROM wedding_offer_slots ORDER BY slot')).rows;
    await pg.transaction(tx => tx.exec(expandedMigration));
    assert.equal((await store.quote()).remaining, 6, 'unreleased higher slots must not inflate the current batch');
    await pg.exec("UPDATE wedding_offer_slots SET state='paid', customer_id='earlier-extra-paid', attempt_id='earlier-extra-paid', album_slug='earlier-extra', payment_ref='tr_extra' WHERE slot=9; UPDATE wedding_offer_slots SET state='reserved', customer_id='earlier-extra-pending', attempt_id='earlier-extra-pending', album_slug='earlier-extra-pending', payment_ref='tr_extra_pending' WHERE slot=10;");
    await pg.transaction(tx => tx.exec(migration));
    await pg.transaction(tx => tx.exec(migration));
    assert.deepEqual((await pg.query('SELECT * FROM wedding_offer_slots WHERE slot<=8 ORDER BY slot')).rows, originalRows, 'expansion must preserve every old place, payment reference and reservation');
    assert.equal((await store.quote()).capacity, 20);
    assert.equal((await store.quote()).remaining, 6);
    assert.equal((await pg.query("SELECT count(*)::int AS total FROM wedding_offer_slots WHERE state='unreleased'")).rows[0].total, 10);
    assert.equal((await pg.query('SELECT state FROM wedding_offer_slots WHERE slot=9')).rows[0].state, 'paid');
    assert.equal((await pg.query('SELECT state FROM wedding_offer_slots WHERE slot=10')).rows[0].state, 'reserved');
    await store.settle('earlier-extra-pending', 'tr_extra_pending', 'earlier-extra-pending', false);
    assert.equal((await store.quote()).remaining, 6, 'cancelled prior-batch higher slots must not enter the active batch');
    assert.equal((await store.quote('existing-paid')).eligible, false);
    assert.equal((await store.quote('existing-pending')).pending, true);
    assert.equal(await store.reserve('existing-paid', 'another-album', 'card'), null);
    const temporary = await Promise.all(Array.from({length:2}, (_,index) => store.reserve('temporary-'+index, 'temporary-album-'+index, 'card')));
    assert.equal((await store.quote()).remaining, 4);
    for (const claim of temporary) await store.releaseRejected(claim.attemptId);
    assert.equal((await store.quote()).remaining, 6, 'verified unpaid rejections return their places');
    const duplicates = await Promise.allSettled([store.reserve('same-account', 'one', 'card'), store.reserve('same-account', 'two', 'card')]);
    const duplicateClaims = duplicates.filter(result => result.status === 'fulfilled' && result.value).map(result => result.value);
    assert.equal(duplicateClaims.length, 1); assert.equal((await store.quote()).remaining, 5);
    await store.releaseRejected(duplicateClaims[0].attemptId); assert.equal((await store.quote()).remaining, 6);
    const starts = await Promise.all(Array.from({ length: 40 }, (_, i) => store.reserve('customer-' + i, 'album-' + i, i % 2 ? 'card' : 'invoice')));
    assert.equal(starts.filter(Boolean).length, 6, 'forty competing attempts can claim only the six remaining released places');
    assert.equal((await pg.query("SELECT count(*)::int AS used FROM wedding_offer_slots WHERE state IN ('reserved','paid')")).rows[0].used, 9);
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
    assert.equal((await store.quote()).priceCents, 11340);
    const last = await store.reserve('last-customer', 'last-album', 'card');
    assert.ok(last); assert.equal(await store.reserve('last-customer', 'other-album', 'card'), null);
    await store.releaseRejected(last.attemptId); assert.equal((await store.quote()).remaining, 1);
    // Production activation preserves historical campaigns and all claimed places on rebuild.
    await pg.exec("INSERT INTO wedding_offer_slots(campaign_id,slot,state,customer_id,attempt_id,album_slug,payment_ref) VALUES ('wedding-launch-189-30-20261025',1,'reserved','historical-customer','historical-attempt','historical-album','bank:historical-offer')");
    const productionSql = (strings, ...values) => ({ text: strings.map((text,index)=>text+(index<values.length?'$'+(index+1):'')).join(''),values });
    // Neon represents tagged statements as lazy promises; mirror that interface in the test adapter.
    const lazyConnect = () => {
      const tagged = (strings,...values) => {const statement=productionSql(strings,...values);statement.then=(resolve,reject)=>pg.query(statement.text,statement.values).then(result=>result.rows).then(resolve,reject);return statement;};
      tagged.query=text=>({text,values:[]});
      tagged.transaction=statements=>pg.transaction(async tx=>{const rows=[];for(const statement of statements)rows.push((await tx.query(statement.text,statement.values)).rows);return rows;});
      return tagged;
    };
    const {prepareWeddingOfferProduction}=await import(require('node:url').pathToFileURL(path.join(root,'scripts/prepare-wedding-offer-production.mjs')).href);
    const productionEnv={VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',VERCEL_PROJECT_ID:'prj_EDblP7nig2nLLZTQlxnrkusvxoSj',DATABASE_URL:'postgresql://isolated/test'};
    const before=await store.quote();
    assert.equal((await prepareWeddingOfferProduction({env:productionEnv,connect:lazyConnect})).prepared,true);
    assert.equal((await store.quote()).remaining,before.remaining,'production redeploy must preserve reservations');
    await store.settleBank('historical-offer',true);
    assert.equal((await pg.query("SELECT state FROM wedding_offer_slots WHERE attempt_id='historical-attempt'")).rows[0].state,'paid','earlier campaign payments still settle after switching the active campaign');
    assert.equal((await store.quote()).remaining,before.remaining,'earlier campaign cannot consume new inventory');
    // A missing/uninitialized campaign must not fabricate places or a discounted price.
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
      assert.equal((await clean.query("SELECT count(*)::int AS available FROM wedding_offer_slots WHERE state='available'")).rows[0].available, 7, 'preview rebuild must never reset paid inventory');
      await clean.exec("INSERT INTO albums VALUES ('non-demo-album')");
      assert.equal((await prepareWeddingOfferPreview({ env, connect: () => tagged })).reason, 'existing-data-requires-manual-review');
    } finally { await clean.close(); }
    console.log('PASS offer database: deployed eight-row stock retains €113.40 and a real 8/20 quote, twelve extra places remain unreleased, prior paid/pending claims survive migration, forty attempts respect released stock, paid/cancel callbacks remain compatible, existing albums and invoice values are preserved.');
  } finally { await pg.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
