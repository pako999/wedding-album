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
  const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSettingsCard} from './components/wedding/WeddingSettingsCard';createRoot(document.getElementById('root')).render(<WeddingSettingsCard slug="translation-fixture" lang="en" plan="premium"/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, tsconfig: path.join(root, 'tsconfig.json') });
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
    let saved = 0, warning = false;
    await page.route('**/api/albums/translation-fixture/wedding/manage*', async route => {
      if (route.request().method() === 'PUT') {
        assert.equal(new URL(route.request().url()).searchParams.get('translate'), '1');
        settings = route.request().postDataJSON(); saved++;
        return route.fulfill({ json: { ok: true, settings, translationWarning: warning } });
      }
      return route.fulfill({ json: { settings, eligible: true, published: true, hasDjLink: false } });
    });
    // The suite is independently tested by the unit tests; no real DB requests.
    await page.route('**/api/albums/translation-fixture/wedding-suite/manage*', route => route.fulfill({ status: 503, json: { error: 'unavailable' } }));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const editor = page.locator('#wedding-settings');
    await editor.locator('input[maxlength="160"]').first().waitFor();
    await editor.getByLabel('Text language', { exact: true }).selectOption('de');
    await editor.locator('input[maxlength="160"]').nth(0).fill('Trauung korrigiert');
    await editor.getByLabel('Category', { exact: true }).selectOption('menu');
    await editor.locator('input[maxlength="160"]').first().fill('Abendessen korrigiert');
    await editor.getByRole('button', { name: 'Save settings', exact: true }).first().click();
    await editor.getByRole('button', { name: 'Save settings', exact: true }).first().waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('#wedding-settings fieldset').disabled);
    assert.equal(saved, 1);
    assert.equal(settings.schedule[0].translations.de.title, 'Trauung korrigiert');
    assert.equal(settings.menu[0].translations.de.title, 'Abendessen korrigiert');
    assert.equal(settings.schedule[0].title, 'Ceremony');
    assert.equal(settings.schedule[0].time, '18:00');
    await editor.locator('aside').getByText('Trauung korrigiert', { exact: true }).waitFor();
    await editor.getByLabel('Category', { exact: true }).selectOption('schedule');
    await editor.getByLabel('Text language', { exact: true }).selectOption('en');
    assert.equal(await editor.locator('input[maxlength="160"]').first().inputValue(), 'Ceremony');
    await editor.getByLabel('Text language', { exact: true }).selectOption('de');
    assert.equal(await editor.locator('input[maxlength="160"]').first().inputValue(), 'Trauung korrigiert');
    warning = true;
    await editor.getByRole('button', { name: 'Save settings', exact: true }).first().click();
    await editor.getByText('Your text was saved, but automatic translations could not be completed. Try again or enter them manually.', { exact: true }).waitFor();
    assert.equal(saved, 2); assert.deepEqual(errors, []);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Editor must fit mobile viewport');
    console.log('PASS translation browser: manual menu/timeline corrections, source preservation, guest preview, language switching, automatic-save flag and visible AI failure warning at 390px.');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
