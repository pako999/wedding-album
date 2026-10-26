// Real owner/guest components and production CSS. Preview-host assets deliberately
// require authorization, just like a protected Vercel deployment on another alias.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { build } = require('esbuild'), playwright = require('playwright'), sharp = require('sharp');
const engine = process.env.COVER_BROWSER_ENGINE || 'chromium';
async function assertPhotoPainted(photo) {
 const hero = photo.locator('..');
 const visible = await hero.screenshot({ animations: 'disabled' });
 await photo.evaluate(image => { image.style.visibility = 'hidden'; });
 let hidden;
 try { hidden = await hero.screenshot({ animations: 'disabled' }); }
 finally { await photo.evaluate(image => { image.style.visibility = ''; }); }
 const a = await sharp(visible).removeAlpha().raw().toBuffer(), b = await sharp(hidden).removeAlpha().raw().toBuffer();
 let changed = 0; for (let index = 0; index < a.length; index += 3) if (Math.abs(a[index] - b[index]) + Math.abs(a[index + 1] - b[index + 1]) + Math.abs(a[index + 2] - b[index + 2]) > 20) changed++;
 assert.ok(changed > a.length / 3 * 0.25, 'The photo must actually be painted, not hidden behind a black layer');
}
(async () => {
 const bundle = await build({ stdin: { resolveDir: root, loader: 'tsx', contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSuiteManager} from './components/wedding-suite/WeddingSuiteManager';import {WeddingSuiteGuest} from './components/wedding-suite/WeddingSuiteGuest';createRoot(document.getElementById('root')).render(location.search.includes('guest')?<WeddingSuiteGuest slug="cover-fixture" initialLang="en"/>:<WeddingSuiteManager slug="cover-fixture" lang="en" plan="premium"/>);` }, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', tsconfig: root + '/tsconfig.json', define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://wedding-album-protected-preview.vercel.app"' } });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(file => file.endsWith('.css')).map(file => fs.readFileSync(root + '/.next/static/chunks/' + file, 'utf8')).join('\n');
 const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://fixture.test').pathname;
  if (pathname === '/app.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (pathname === '/app.css') { response.setHeader('Content-Type', 'text/css'); response.end(css); }
  else if (pathname.startsWith('/hero/')) {
   const file = path.resolve(root, 'public', '.' + pathname);
   if (!file.startsWith(root + '/public/hero/') || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
   response.setHeader('Content-Type', 'image/webp'); response.end(fs.readFileSync(file));
  } else { response.setHeader('Content-Type', 'text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 let browser;
 try {
  browser = await playwright[engine].launch(engine === 'chromium' ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
  const errors = [], external = []; page.on('pageerror', error => errors.push(error.message));
  await page.route(/^https:\/\//, route => { external.push(route.request().url()); return route.fulfill({ status: 401, body: 'Protected deployment' }); });
  let config = JSON.parse(fs.readFileSync(root + '/docs/wedding-suite-test-fixture.json', 'utf8'));
  config.story = []; config.travel = [];
  config.page = { title: { en: 'Ana & Marko' }, subtitle: { en: 'We cannot wait to celebrate with you.' }, headingFont: 'elegant', bodyFont: 'modern', background: '#ffffff', textColor: '#272b25', accent: '#465c42', sections: [{ id: '52000000-0000-4000-8000-000000000001', category: 'ceremony', title: { en: 'Our ceremony' }, visible: true, fields: [{ id: '52000000-0000-4000-8000-000000000002', type: 'text', text: { en: 'Our wedding day, together with family and friends. '.repeat(60) } }] }] };
  await page.route('**/api/albums/cover-fixture/wedding-suite/manage*', route => {
   if (route.request().method() === 'PUT') { config = route.request().postDataJSON(); return route.fulfill({ json: { ok: true, config } }); }
   return route.fulfill({ json: { configured: true, config, attendees: [], entries: [], emails: [], guestPath: '/cover-fixture/celebrate', preview: true } });
  });
  await page.route('**/api/albums/cover-fixture/wedding/manage*', route => route.fulfill({ json: { settings: { enabled: false, requestsOpen: true, schedule: [], menu: [], challenges: [] }, eligible: true, published: true, hasDjLink: false } }));
  await page.route('**/api/albums/cover-fixture/wedding-suite', route => route.fulfill({ json: { config, attendee: null, entries: [], language: 'en', album: { id: 'test-cover', slug: 'cover-fixture', name: 'Ana & Marko', date: '2027-07-31', maxPhotos: 1000, photoCount: 0, moderationEnabled: true, passwordProtected: false } } }));
  const base = `http://127.0.0.1:${server.address().port}`;
  await page.goto(base);
  await page.getByRole('checkbox', { name: /Translate missing text/ }).uncheck();
  const builder = page.locator('[data-wedding-builder]');
  const frame = builder.locator('aside > div').last();
  const styles = [['Garden romance', '/hero/wedding-garden-template.webp'], ['Timeless elegance', '/hero/wedding-castle.webp'], ['Modern simplicity', '/hero/wedding-walk.webp']];
  for (const width of [1280, 390]) for (const [label, asset] of styles) {
   await page.setViewportSize({ width, height: 1100 });
   await frame.evaluate(element => { element.scrollTop = element.scrollHeight; });
   assert.ok(await frame.evaluate(element => element.scrollTop > 0), 'The preview must first be scrolled away from its cover');
   await builder.getByRole('button', { name: label, exact: true }).click();
   const photo = builder.locator('aside [data-wedding-page-content] img').first();
   await photo.waitFor();
   assert.equal(await photo.getAttribute('src'), asset, 'Template images must load on the same origin as the editor, without preview-host authorization');
   await photo.evaluate(image => image.decode());
   assert.equal(await frame.evaluate(element => element.scrollTop), 0, 'Selecting a style must bring its photo and names back into view');
   const hero = photo.locator('..');
   await hero.getByRole('heading', { name: 'Ana & Marko', exact: true }).waitFor();
   await assertPhotoPainted(photo);
   await page.waitForSelector('[data-autosave-state="saved"]');
   assert.equal(config.page.coverImageUrl, asset);
   assert.equal(await builder.getByLabel('Wedding page title', { exact: true }).inputValue(), 'Ana & Marko');
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  }
  await page.reload();
  await builder.locator('aside img').first().evaluate(image => image.decode());
  assert.equal(await builder.locator('aside img').first().getAttribute('src'), styles[2][1]);
  await page.goto(base + '/?guest');
  await page.getByRole('heading', { name: 'Ana & Marko', exact: true }).waitFor();
  const guestPhoto = page.locator('[data-wedding-page-content] img');
  await guestPhoto.evaluate(image => image.decode()); assert.equal(await guestPhoto.getAttribute('src'), styles[2][1]);
  await assertPhotoPainted(guestPhoto);
  config.page.coverImageUrl = 'https://wedding-album-old-protected.vercel.app/hero/wedding-castle.webp';
  await page.reload(); await guestPhoto.evaluate(image => image.decode()); assert.equal(await guestPhoto.getAttribute('src'), styles[1][1]);
  assert.deepEqual(external, [], 'Built-in and previously saved template covers must never depend on another deployment');
  assert.deepEqual(errors, []);
  const output = root + '/artifacts/mobile-menu'; fs.mkdirSync(output, { recursive: true });
  await page.locator('[data-wedding-page-content]').screenshot({ path: `${output}/wedding-cover-${engine}-guest.png`, animations: 'disabled' });
  console.log(`PASS covers (${engine}): all three styles visibly paint the selected photo, reset preview scroll, persist through save/reload, and match the actual guest page at 390px/1280px without cross-origin preview requests.`);
 } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); if (process.env.GITHUB_ACTIONS) console.error('::error::' + String(error).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A')); process.exitCode = 1; });
