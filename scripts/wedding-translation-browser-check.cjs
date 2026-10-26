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
  const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSettingsCard} from './components/wedding/WeddingSettingsCard';createRoot(document.getElementById('root')).render(<WeddingSettingsCard slug="translation-fixture" lang="en" plan="premium"/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' }, tsconfig: path.join(root, 'tsconfig.json') });
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
    let settings = { enabled: true, requestsOpen: true, schedule: [{ id: 'ceremony', title: 'Ceremony', detail: 'Garden', time: '18:00', sourceLang: 'en' }], menu: [{ id: 'dinner', title: 'Dinner', detail: 'Vegetarian', sourceLang: 'en' }], challenges: [] };
    let saved = 0;
    const config = { enabled: true, defaultLang: 'en', features: { guestbook: true, video: true, seating: true, rsvp: true, capsule: false, story: true, travel: true, thanks: true }, welcome: {}, invitation: {}, thankYou: {}, story: [], travel: [], menuOptions: [], tables: [], seatingMapUrl: '', thankYouPhotoUrl: '', capsuleUnlockAt: null, rsvpDeadline: null, maxCompanions: 1 };
    await page.route('**/api/albums/translation-fixture/wedding/manage*', async route => {
      if (route.request().method() === 'PUT') {
        assert.equal(new URL(route.request().url()).searchParams.get('translate'), '0');
        settings = route.request().postDataJSON(); saved++;
        return route.fulfill({ json: { ok: true, settings } });
      }
      if (route.request().method() === 'POST') return route.fulfill({ status: 503, json: { error: 'unavailable' } });
      return route.fulfill({ json: { settings, eligible: true, published: true, hasDjLink: false } });
    });
    await page.route('**/api/albums/translation-fixture/wedding-suite/manage*', route => route.fulfill({ json: { config, configured: true, attendees: [], entries: [], emails: [], guestPath: '/translation-fixture/celebrate', preview: true } }));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const editor = page.locator('[data-wedding-program-editor]');
    await editor.getByLabel('Title', { exact: true }).waitFor();
    await page.getByLabel('Content language', { exact: true }).selectOption('de');
    await editor.getByLabel('Title', { exact: true }).fill('Trauung korrigiert');
    await editor.getByLabel('Category', { exact: true }).selectOption('menu');
    await editor.getByLabel('Title', { exact: true }).fill('Abendessen korrigiert');
    await page.waitForSelector('[data-program-save-state="saved"]');
    assert.ok(saved >= 1);
    assert.equal(settings.schedule[0].translations.de.title, 'Trauung korrigiert');
    assert.equal(settings.menu[0].translations.de.title, 'Abendessen korrigiert');
    assert.equal(settings.schedule[0].title, 'Ceremony');
    assert.equal(settings.schedule[0].time, '18:00');
    await editor.locator('aside').getByText('Trauung korrigiert', { exact: true }).waitFor();
    await editor.getByLabel('Category', { exact: true }).selectOption('schedule');
    await page.getByLabel('Content language', { exact: true }).selectOption('en');
    assert.equal(await editor.getByLabel('Title', { exact: true }).inputValue(), 'Ceremony');
    await page.getByLabel('Content language', { exact: true }).selectOption('de');
    assert.equal(await editor.getByLabel('Title', { exact: true }).inputValue(), 'Trauung korrigiert');
    await editor.getByText('Your text was saved, but automatic translations could not be completed. Try again or enter them manually.', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Editor must fit mobile viewport');
    console.log('PASS translation browser: manual menu/timeline corrections, source preservation, guest preview, language switching, automatic-save flag and visible AI failure warning at 390px.');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
