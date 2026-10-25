// Run after npm run build; requires the cloud runtime's Playwright and Chromium.
// Real editors and guest views; only authenticated API responses are intercepted.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..');
const req = createRequire(path.join(root, 'package.json'));
const { build } = req('esbuild');
const { chromium } = req('playwright');
(async () => {
  const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSuiteManager} from './components/wedding-suite/WeddingSuiteManager';import {WeddingSuiteGuest} from './components/wedding-suite/WeddingSuiteGuest';createRoot(document.getElementById('root')).render(location.search.includes('guest')?<WeddingSuiteGuest slug="builder-fixture" initialLang="en"/>:<WeddingSuiteManager slug="builder-fixture" lang="en" plan="premium"/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, tsconfig: path.join(root, 'tsconfig.json') });
  const css = fs.readdirSync(root + '/.next/static/chunks').filter(x => x.endsWith('.css')).map(x => fs.readFileSync(root + '/.next/static/chunks/' + x, 'utf8')).join('\n');
  const server = http.createServer((request, response) => {
    if (request.url === '/fixture.js') { response.setHeader('content-type', 'application/javascript'); response.end(bundle.outputFiles[0].text); }
    else if (request.url === '/fixture.css') { response.setHeader('content-type', 'text/css'); response.end(css); }
    else { response.setHeader('content-type', 'text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let config = { enabled: true, defaultLang: 'en', features: { guestbook: true, video: true, seating: true, rsvp: true, capsule: true, story: true, travel: true, thanks: true }, welcome: {}, invitation: {}, thankYou: {}, story: [], travel: [], menuOptions: [], tables: [], seatingMapUrl: '', thankYouPhotoUrl: '', capsuleUnlockAt: '2027-10-30T12:00:00Z', rsvpDeadline: null, maxCompanions: 1 };
    let saved = 0;
    await page.route('**/api/albums/builder-fixture/wedding-suite/manage*', async route => {
      if (route.request().method() === 'PUT') { config = route.request().postDataJSON(); saved++; return route.fulfill({ json: { ok: true, config } }); }
      return route.fulfill({ json: { configured: true, config, attendees: [], entries: [], emails: [], guestPath: '/builder-fixture/celebrate', preview: true } });
    });
    await page.route('**/api/albums/builder-fixture/wedding-suite', route => route.fulfill({ json: { config, language: 'en', attendee: null, entries: [], album: { id: 'test', slug: 'builder-fixture', name: 'Original album name', date: '2027-07-31', maxPhotos: 1000, photoCount: 0, moderationEnabled: true, passwordProtected: false } } }));
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base);
    const editor = page.locator('[data-wedding-builder]');
    await editor.getByLabel('Wedding page title', { exact: true }).fill('Ana & Marko');
    await editor.getByLabel('Heading font', { exact: true }).selectOption('classic');
    await editor.getByLabel('Background color', { exact: true }).fill('#f8e8ef');
    await editor.getByLabel('Accent color', { exact: true }).fill('#78324a');
    await editor.getByLabel('Add category', { exact: true }).selectOption('ceremony');
    await editor.getByRole('button', { name: '+ Add category', exact: true }).click();
    await editor.getByLabel('Category title', { exact: true }).fill('Our ceremony');
    await editor.getByRole('button', { name: '+ Add field', exact: true }).click();
    let fields = editor.locator('[data-page-field]');
    await fields.nth(0).locator('textarea, input:not([type="color"])').first().fill('Meet us in the garden at 18:00.');
    await fields.nth(0).getByLabel('Font 1', { exact: true }).selectOption('handwritten');
    await fields.nth(0).getByLabel('Text color 1', { exact: true }).fill('#123456');
    await editor.getByLabel('Field type', { exact: true }).selectOption('heading');
    await editor.getByRole('button', { name: '+ Add field', exact: true }).click();
    await fields.nth(1).locator('textarea, input:not([type="color"])').first().fill('A day to remember');
    await fields.nth(1).getByRole('button', { name: 'Move up 2', exact: true }).click();
    assert.equal(await fields.nth(0).locator('textarea, input:not([type="color"])').first().inputValue(), 'A day to remember');
    // Actual HTML drag/drop must preserve the field's text and formatting.
    await fields.nth(1).getByRole('button', { name: 'Drag to reorder 2', exact: true }).dragTo(fields.nth(0));
    assert.equal(await fields.nth(0).locator('textarea, input:not([type="color"])').first().inputValue(), 'Meet us in the garden at 18:00.');
    await editor.getByLabel('Field type', { exact: true }).selectOption('link');
    await editor.getByRole('button', { name: '+ Add field', exact: true }).click();
    await fields.nth(2).getByLabel('Link', { exact: true }).fill('Directions');
    await fields.nth(2).getByLabel('Website address', { exact: true }).fill('https://example.test/venue');
    const preview = editor.getByRole('complementary', { name: 'Page preview' });
    await preview.getByText('Our ceremony', { exact: true }).waitFor();
    assert.equal(await preview.getByText('Meet us in the garden at 18:00.', { exact: true }).evaluate(el => getComputedStyle(el).color), 'rgb(18, 52, 86)');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await page.waitForFunction(() => !document.querySelector('#wedding-suite').disabled);
    assert.equal(saved, 1); assert.equal(config.page.sections[0].fields[0].font, 'handwritten');
    assert.equal(config.page.sections[0].fields[2].url, 'https://example.test/venue');
    await page.reload();
    await editor.getByLabel('Wedding page title', { exact: true }).waitFor();
    assert.equal(await editor.getByLabel('Wedding page title', { exact: true }).inputValue(), 'Ana & Marko');
    if (process.env.WEDDING_GUIDE_OUTPUT_DIR) {
      fs.mkdirSync(process.env.WEDDING_GUIDE_OUTPUT_DIR, { recursive: true });
      await page.setViewportSize({ width: 1280, height: 900 });
      await editor.getByRole('complementary', { name: 'Page preview' }).screenshot({ path: path.join(process.env.WEDDING_GUIDE_OUTPUT_DIR, 'wedding-page-guide.png') });
      await editor.locator('details').first().screenshot({ path: path.join(process.env.WEDDING_GUIDE_OUTPUT_DIR, 'wedding-style-guide.png') });
      await page.setViewportSize({ width: 390, height: 900 });
    }
    await page.getByLabel('Content language', { exact: true }).selectOption('de');
    await editor.getByLabel('Category title', { exact: true }).fill('Unsere Trauung');
    await fields.nth(0).locator('textarea, input:not([type="color"])').first().fill('Wir sehen uns im Garten.');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await page.waitForFunction(() => !document.querySelector('#wedding-suite').disabled);
    assert.equal(config.page.sections[0].title.en, 'Our ceremony');
    assert.equal(config.page.sections[0].title.de, 'Unsere Trauung');
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Editor overflows at ${width}px`);
    }
    await editor.getByRole('complementary', { name: 'Page preview' }).screenshot({ path: '/tmp/wedding-page-builder-preview.png' });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(base + '/?guest=1');
    await page.getByRole('heading', { name: 'Ana & Marko', exact: true }).waitFor();
    await page.getByText('Meet us in the garden at 18:00.', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: /Directions/ }).getAttribute('href'), 'https://example.test/venue');
    assert.equal(await page.locator('main').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(248, 232, 239)');
    assert.equal(await page.getByText('Meet us in the garden at 18:00.', { exact: true }).evaluate(el => getComputedStyle(el).color), 'rgb(18, 52, 86)');
    await page.getByLabel('Language', { exact: true }).selectOption('de');
    await page.getByText('Unsere Trauung', { exact: true }).waitFor();
    await page.getByText('Wir sehen uns im Garten.', { exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.deepEqual(errors, []);
    // A hidden category must never appear in the guest output.
    config.page.sections[0].visible = false;
    await page.reload();
    await page.getByRole('heading', { name: 'Ana & Marko', exact: true }).waitFor();
    assert.equal(await page.getByText('Our ceremony', { exact: true }).count(), 0);
    console.log('PASS page builder browser: categories, typed fields, fonts/colors, arrow and drag reordering, save/reload, manual languages, guest styling and hidden sections at 390px.');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
