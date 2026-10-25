// Real wedding editor, intercepted authenticated API, Chromium and WebKit.
const fs = require('node:fs'), http = require('node:http'), path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { build } = require('esbuild');
const playwright = require('playwright');
const engine = process.env.AUTOSAVE_BROWSER_ENGINE || 'chromium';
const clone = value => JSON.parse(JSON.stringify(value));
const until = async (predicate, message) => {
 const deadline = Date.now() + 15000;
 while (!predicate()) { if (Date.now() > deadline) throw new Error(message); await new Promise(resolve => setTimeout(resolve, 30)); }
};
(async () => {
 const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSuiteManager} from './components/wedding-suite/WeddingSuiteManager';createRoot(document.getElementById('root')).render(<WeddingSuiteManager slug="autosave-fixture" lang={new URLSearchParams(location.search).get('lang')||'en'} plan="premium"/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, tsconfig: path.join(root, 'tsconfig.json') });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(x => x.endsWith('.css')).map(x => fs.readFileSync(root + '/.next/static/chunks/' + x, 'utf8')).join('\n');
 const server = http.createServer((request, response) => {
  if (request.url === '/fixture.js') { response.setHeader('content-type', 'application/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (request.url === '/fixture.css') { response.setHeader('content-type', 'text/css'); response.end(css); }
  else { response.setHeader('content-type', 'text/html; charset=utf-8'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 let browser;
 try {
  browser = await playwright[engine].launch(engine === 'chromium' ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('dialog', dialog => dialog.accept());
  const errors = []; page.on('pageerror', error => { errors.push(error.message); console.error('Browser error:', error.message); });
  let config = { enabled: false, defaultLang: 'en', features: { guestbook: true, video: true, seating: true, rsvp: true, capsule: true, story: true, travel: true, thanks: true }, welcome: {}, invitation: {}, thankYou: {}, story: [], travel: [], menuOptions: [], tables: [], seatingMapUrl: '', thankYouPhotoUrl: '', capsuleUnlockAt: null, rsvpDeadline: null, maxCompanions: 1 };
  let failLoad = true, failSave = false, holdSave, holdTranslation, active = 0, peak = 0;
  const writes = [], actions = [];
  await page.route('**/api/albums/autosave-fixture/wedding-suite/manage*', async route => {
   const request = route.request();
   if (request.method() === 'PUT') {
    assert.equal(new URL(request.url()).searchParams.get('translate'), '0');
    const snapshot = request.postDataJSON(); writes.push(snapshot); active++; peak = Math.max(peak, active);
    if (holdSave) await holdSave;
    active--;
    if (failSave) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
    config = snapshot; return route.fulfill({ json: { ok: true, config } });
   }
   if (request.method() === 'POST') {
    const body = request.postDataJSON(); actions.push(body.action);
    assert.equal(body.action, 'translate', 'Autosaving must never invite a guest, send email or moderate content');
    if (holdTranslation) await holdTranslation;
    const translated = clone(body.config);
    if (translated.welcome.en) translated.welcome.de = 'Willkommen';
    return route.fulfill({ json: { ok: true, config: translated } });
   }
   if (failLoad) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
   return route.fulfill({ json: { configured: true, config: Object.fromEntries(Object.entries(config).reverse()), attendees: [], entries: [], emails: [], guestPath: '/autosave-fixture/celebrate', preview: true } });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const saved = () => page.waitForSelector('[data-autosave-state="saved"]');
  const welcome = () => page.getByLabel('Welcome message', { exact: true });
  await page.goto(base);
  await page.getByRole('button', { name: 'Reload editor', exact: true }).waitFor();
  assert.equal(await welcome().isDisabled(), true);
  assert.equal(writes.length, 0, 'Loading failure must not write defaults');
  failLoad = false;
  await page.getByRole('button', { name: 'Reload editor', exact: true }).click();
  await saved(); assert.equal(writes.length, 0);
  await page.getByRole('checkbox', { name: /Translate missing text/ }).uncheck();
  await page.getByRole('checkbox', { name: 'Enable the wedding suite', exact: true }).check();
  await saved(); assert.equal(config.enabled, true); assert.equal(config.capsuleUnlockAt, null);
  await page.getByText('The time capsule is a draft until you set its opening date. Other changes still save automatically.', { exact: true }).waitFor();

  const beforeTyping = writes.length;
  await welcome().pressSequentially('Welcome to our wedding', { delay: 15 });
  await saved(); assert.equal(writes.length, beforeTyping + 1, 'Typing must be debounced');
  assert.equal(config.welcome.en, 'Welcome to our wedding');
  await welcome().pressSequentially(' ');
  await page.waitForTimeout(1000);
  assert.equal(await welcome().inputValue(), 'Welcome to our wedding ');
  await welcome().pressSequentially('day', { delay: 15 }); await saved();
  assert.equal(config.welcome.en, 'Welcome to our wedding day');
  await page.getByRole('button', { name: '+ Add table', exact: true }).click();
  await page.getByRole('button', { name: '+ Add table', exact: true }).click();
  const menu = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Meal choice', exact: true }) }).last();
  await menu.getByRole('button', { name: '+ Add entry', exact: true }).click();
  await saved(); assert.deepEqual(config.menuOptions[0].title, {}, 'An added empty menu row is a valid draft');
  await menu.getByRole('textbox').fill('Vegetarian');
  await saved(); assert.equal(config.tables.length, 2); assert.equal(config.menuOptions[0].title.en, 'Vegetarian');

  let release;
  holdSave = new Promise(resolve => { release = resolve; });
  const beforeSlow = writes.length;
  await welcome().fill('First edit');
  await until(() => writes.length > beforeSlow, 'Slow write did not start');
  assert.equal(await welcome().isEnabled(), true, 'Saving must not lock the editor');
  await welcome().fill('Newest edit while saving');
  await page.getByRole('button', { name: '+ Add table', exact: true }).click();
  holdSave = null; release();
  await saved(); assert.equal(config.welcome.en, 'Newest edit while saving'); assert.equal(config.tables.length, 3); assert.equal(peak, 1);
  const seating = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Find your table', exact: true }) }).last();
  await seating.getByRole('button', { name: 'Remove', exact: true }).last().click();
  await saved(); assert.equal(config.tables.length, 2, 'Removing a table must autosave');
  await page.getByLabel('Seats', { exact: true }).first().fill('0');
  await page.waitForSelector('[data-autosave-state="invalid"]');
  const invalidWrites = writes.length;
  await page.reload();
  await page.waitForSelector('[data-autosave-state="invalid"]');
  assert.equal(await page.getByLabel('Seats', { exact: true }).first().inputValue(), '0', 'An unfinished input must survive reload');
  assert.equal(writes.length, invalidWrites);
  await page.getByRole('checkbox', { name: /Translate missing text/ }).uncheck();
  await page.getByLabel('Seats', { exact: true }).first().fill('6');
  await saved(); assert.equal(writes.length, invalidWrites + 1); assert.equal(config.tables[0].capacity, 6);

  failSave = true;
  await welcome().fill('Recover me after a failed save');
  await page.waitForSelector('[data-autosave-state="error"]');
  await page.getByRole('button', { name: 'Retry saving', exact: true }).waitFor();
  assert.equal(await welcome().inputValue(), 'Recover me after a failed save');
  assert.ok(await page.evaluate(() => Object.keys(sessionStorage).some(key => key.startsWith('wedding-suite-draft:'))));
  failSave = false; await page.reload(); await saved();
  assert.equal(config.welcome.en, 'Recover me after a failed save');
  failSave = true;
  await welcome().fill('Retry on reconnection'); await page.waitForSelector('[data-autosave-state="error"]');
  failSave = false; await page.evaluate(() => window.dispatchEvent(new Event('online'))); await saved();
  assert.equal(config.welcome.en, 'Retry on reconnection');

  // A newer server version must never be silently replaced by an old local draft.
  failSave = true; await welcome().fill('My local draft'); await page.waitForSelector('[data-autosave-state="error"]');
  config.welcome.en = 'A newer server edit'; failSave = false;
  const conflictWrites = writes.length;
  await page.reload(); await page.getByRole('button', { name: 'Keep saved version', exact: true }).waitFor();
  assert.equal(writes.length, conflictWrites); assert.equal(await welcome().isDisabled(), true);
  await page.getByRole('button', { name: 'Keep saved version', exact: true }).click();
  await saved(); assert.equal(await welcome().inputValue(), 'A newer server edit');

  let releaseTranslation;
  holdTranslation = new Promise(resolve => { releaseTranslation = resolve; });
  await page.getByRole('checkbox', { name: /Translate missing text/ }).check();
  await until(() => actions.includes('translate'), 'Background translation did not start');
  await page.getByLabel('Content language', { exact: true }).selectOption('de');
  await welcome().fill('Meine eigene Korrektur');
  await saved(); assert.equal(config.welcome.de, 'Meine eigene Korrektur', 'Manual text must save while AI is pending');
  holdTranslation = null; releaseTranslation();
  await page.getByText('Text saved. Preparing missing translations…', { exact: true }).waitFor({ state: 'hidden' });
  await page.getByRole('checkbox', { name: /Translate missing text/ }).uncheck();
  assert.equal(await welcome().inputValue(), 'Meine eigene Korrektur'); assert.equal(config.welcome.de, 'Meine eigene Korrektur');
  assert.ok(actions.every(action => action === 'translate'));

  for (const width of [320, 390, 768, 1280]) {
   await page.setViewportSize({ width, height: 844 });
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Editor overflow at ${width}px`);
  }
  // Slovenian review image uses the real editor and synthetic fixture data.
  await page.goto(base + '/?lang=sl'); await saved();
  const output = path.join(root, 'artifacts/mobile-menu'); fs.mkdirSync(output, { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('heading', { name: 'Poišči svojo mizo', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, `wedding-autosave-${engine}.png`) });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('heading', { name: 'Izbira menija', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, `wedding-autosave-${engine}-mobile.png`) });
  assert.deepEqual(errors, []);
  console.log(`PASS autosave (${engine}): load retry, debounce, enabled capsule draft, tables/menu, sequential writes while editing, validation, failure/reload recovery, online retry, conflict choice, AI/manual-edit safety, no email or guest mutations, and 320–1280px layouts.`);
 } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
