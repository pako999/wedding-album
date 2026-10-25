// Real package page, feature cards, images and inventory widget. Only Next routing/auth shell and API data are isolated.
const fs = require('node:fs'); const http = require('node:http'); const path = require('node:path'); const assert = require('node:assert/strict');
const { createRequire } = require('node:module'); const root = path.resolve(__dirname, '..'); const req = createRequire(path.join(root, 'package.json'));
const { build } = req('esbuild'); const { chromium } = req('playwright');
(async () => {
 const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingLandingPage} from './components/wedding/WeddingLandingPage';createRoot(document.getElementById('root')).render(<WeddingLandingPage lang={new URLSearchParams(location.search).get('lang')||'en'}/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: path.join(root, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' }, plugins: [{ name: 'next-fixture-shell', setup(builder) {
  builder.onResolve({ filter: /^(next\/link|next\/image|@\/components\/(SiteHeader|SeoFooter))$/ }, args => ({ path: args.path, namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ resolveDir: root, loader: 'jsx', contents: args.path === 'next/link' ? 'export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}' : args.path === 'next/image' ? 'export default function Image({fill,priority,quality,sizes,...props}){return <img {...props} style={fill?{position:"absolute",width:"100%",height:"100%"}:undefined}/>}' : args.path.endsWith('SiteHeader') ? 'export function SiteHeader(){return <header>Guestcam</header>}' : 'export function SeoFooter(){return <footer>Guestcam</footer>}' }));
 }}] });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(x => x.endsWith('.css')).map(x => fs.readFileSync(root + '/.next/static/chunks/' + x, 'utf8')).join('\n');
 const server = http.createServer((request, response) => {
  if (request.url === '/fixture.js') { response.setHeader('content-type','application/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (request.url === '/fixture.css') { response.setHeader('content-type','text/css'); response.end(css); }
  else if (request.url.startsWith('/hero/')) { const filename = path.resolve(root, 'public', '.' + request.url); if (!filename.startsWith(root + '/public/hero/') || !fs.existsSync(filename)) { response.writeHead(404); response.end(); return; } response.setHeader('content-type', filename.endsWith('.png') ? 'image/png' : 'image/webp'); response.end(fs.readFileSync(filename)); }
  else { response.setHeader('content-type','text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); let browser;
 try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  let remaining = 20; let available = true; const errors = [];
  async function context() { const ctx = await browser.newContext(); await ctx.route('**/api/wedding-offer', route => route.fulfill({ json: { verified: available, remaining: available ? remaining : null, capacity: 20, eligible: available && remaining > 0, pending: false, priceCents: available && remaining > 0 ? 13230 : 18900 } })); return ctx; }
  const first = await context(); const page = await first.newPage(); page.on('pageerror', error => { errors.push(error.message); console.error('Browser error:', error.message); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const lang of ['sl','hr','sr','en','de','es']) for (const width of [320,1280]) {
   await page.setViewportSize({ width, height: 900 }); await page.goto(base + '/?lang=' + lang);
   await page.waitForFunction(() => document.querySelector('[data-wedding-offer]')?.textContent.includes('20'), {timeout:10000}).catch(async error => { console.error('Rendered content:', (await page.locator('body').innerText()).slice(0,1000)); throw error; });
   assert.equal(await page.locator('#features article').count(), 15); assert.equal(await page.locator('#guide article').count(), 3);
   assert.ok(await page.locator('[data-wedding-offer]').first().innerText().then(text => /132[,.]30/.test(text)));
   assert.ok(await page.evaluate(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0)));
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${lang} page overflows at ${width}px`);
  }
  // A second cookie jar sees the same global inventory, and visits never decrement it.
  const second = await context(); const visitor = await second.newPage(); await visitor.goto(base + '/?lang=en');
  await visitor.getByText('20 of 20 discounted packages available', { exact: true }).first().waitFor(); assert.equal(remaining,20);
  remaining = 19; await page.goto(base + '/?lang=en'); await page.getByText('19 of 20 discounted packages available', { exact: true }).first().waitFor();
  await visitor.reload(); await visitor.getByText('19 of 20 discounted packages available', { exact: true }).first().waitFor();
  remaining = 0; await page.reload(); await page.getByText('Standard package price', { exact: true }).first().waitFor();
  assert.ok(!await page.locator('[data-wedding-offer]').first().innerText().then(text => text.includes('132')));
  available = false; await page.reload(); await page.getByText('Standard package price', { exact: true }).first().waitFor();
  assert.ok(!await page.locator('[data-wedding-offer]').first().innerText().then(text => text.includes('of 20')));
  assert.deepEqual(errors,[]);
  console.log('PASS package browser: six languages at 320/1280px, fifteen feature groups, three illustrated guides, exact launch price, shared availability across cookie jars, exhaustion and unavailable-inventory fallback.');
 } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
