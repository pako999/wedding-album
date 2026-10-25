// Real package page, feature cards, images and inventory widget. Only Next routing/auth shell and API data are isolated.
const fs = require('node:fs'); const http = require('node:http'); const path = require('node:path'); const assert = require('node:assert/strict');
const { createRequire } = require('node:module'); const root = path.resolve(__dirname, '..'); const req = createRequire(path.join(root, 'package.json'));
const { build } = req('esbuild'); const { chromium, webkit } = req('playwright');
(async () => {
 const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingLandingPage} from './components/wedding/WeddingLandingPage';createRoot(document.getElementById('root')).render(<WeddingLandingPage lang={new URLSearchParams(location.search).get('lang')||'en'}/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: path.join(root, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' }, plugins: [{ name: 'next-fixture-shell', setup(builder) {
  builder.onResolve({ filter: /^(next\/link|next\/image|@clerk\/nextjs\/server|@\/components\/HeaderAuthButtons)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ resolveDir: root, loader: 'jsx', contents: args.path === 'next/link' ? 'export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}' : args.path === 'next/image' ? 'export default function Image({fill,priority,quality,sizes,...props}){return <img {...props} style={fill?{position:"absolute",width:"100%",height:"100%"}:undefined}/>}' : args.path === '@clerk/nextjs/server' ? 'export function auth(){return {userId:null}}' : 'export function HeaderAuthButtons(){return null}' }));
  builder.onLoad({filter:/SiteHeader\.tsx$/}, args=>({resolveDir:path.dirname(args.path),loader:'tsx',contents:fs.readFileSync(args.path,'utf8').replace('export async function SiteHeader','export function SiteHeader').replace('const session = await auth();','const session = {userId:null};')}));
 }}] });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(x => x.endsWith('.css')).map(x => fs.readFileSync(root + '/.next/static/chunks/' + x, 'utf8')).join('\n');
 const server = http.createServer((request, response) => {
  if (request.url === '/fixture.js') { response.setHeader('content-type','application/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (request.url === '/fixture.css') { response.setHeader('content-type','text/css'); response.end(css+'\nhtml{--font-dm-sans:"DM Sans","DM Sans Fallback";--font-cormorant:"Cormorant Garamond","Cormorant Garamond Fallback"}'); }
  else if (request.url.startsWith('/media/')) { const file=path.join(root,'.next/static/media',path.basename(request.url)); if(!fs.existsSync(file)){response.writeHead(404);response.end();return;} response.setHeader('content-type','font/woff2');response.end(fs.readFileSync(file)); }
  else if (request.url.startsWith('/hero/')) { const filename = path.resolve(root, 'public', '.' + request.url); if (!filename.startsWith(root + '/public/hero/') || !fs.existsSync(filename)) { response.writeHead(404); response.end(); return; } response.setHeader('content-type', filename.endsWith('.png') ? 'image/png' : 'image/webp'); response.end(fs.readFileSync(filename)); }
  else { response.setHeader('content-type','text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); let browser;
 try {
  browser = await (process.env.PACKAGE_BROWSER_ENGINE==='webkit'?webkit:chromium).launch(process.env.PACKAGE_BROWSER_ENGINE==='webkit'?{}:{ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined), headless: true, args: ['--no-sandbox'] });
  let remaining = 8; let available = true; const errors = [];
  async function context() { const ctx = await browser.newContext(); await ctx.route('**/api/wedding-offer', route => route.fulfill({ json: { verified: available, remaining: available ? remaining : null, capacity: 8, eligible: available && remaining > 0, pending: false, priceCents: available && remaining > 0 ? 11340 : 18900 } })); return ctx; }
  const first = await context(); const page = await first.newPage(); page.on('pageerror', error => { errors.push(error.message); console.error('Browser error:', error.message); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const lang of ['sl','hr','sr','en','de','es']) for (const width of [320,375,390,430,1280]) for (const largeText of [false,true]) {
   await page.setViewportSize({ width, height: 900 }); await page.goto(base + '/?lang=' + lang);
   if(largeText)await page.addStyleTag({content:'html{font-size:20px!important}'});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForFunction(() => /113[,.]40/.test(document.querySelector('[data-wedding-offer]')?.textContent || ''), {timeout:10000}).catch(async error => { console.error('Rendered content:', (await page.locator('body').innerText()).slice(0,1000)); throw error; });
   assert.equal(await page.locator('[data-wedding-offer-banner]').count(), 1);
   assert.ok((await page.locator('[data-wedding-offer-banner]').innerText()).includes('40%'));
   assert.equal(await page.locator('#features article').count(), 15); assert.equal(await page.locator('#guide article').count(), 3);
   const guideLink = await page.locator('#guide > div > a').getAttribute('href');
   assert.ok(guideLink.startsWith(['sl','sr','es'].includes(lang) ? '/blog/' : `/${lang}/blog/`), `${lang} guide link uses the wrong public language path`);
   assert.ok(await page.locator('[data-wedding-offer]').first().innerText().then(text => /113[,.]40/.test(text)));
   assert.ok(await page.evaluate(() => Array.from(document.images).every(image => image.complete && image.naturalWidth > 0)));
   const clipped=await page.locator('header, header nav, main > section:first-child, main h1, main > section:first-child > div, [data-wedding-offer], [data-wedding-offer-banner]').evaluateAll(nodes=>nodes.map(node=>({tag:node.tagName,x:node.getBoundingClientRect().x,right:node.getBoundingClientRect().right,width:node.getBoundingClientRect().width})).filter(box=>box.x < -1 || box.right > innerWidth+1));
   assert.deepEqual(clipped,[],`${lang}/${width}px/largeText=${largeText} content is clipped even if the body hides overflow`);
   if(width<1024)assert.ok(await page.locator('header').first().locator('button[aria-haspopup="dialog"]').first().isVisible());
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${lang} page overflows at ${width}px`);
  }
  // A stale client router must not be required for the public offer link.
  await page.goto(base + '/?lang=en');
  await page.locator('[data-wedding-offer-banner] a').waitFor();
  await page.evaluate(() => { window.__oldDocument = true; });
  await page.locator('[data-wedding-offer-banner] a').click();
  await page.waitForURL('**/en/wedding-package');
  assert.equal(await page.evaluate(() => window.__oldDocument), undefined, 'Public offer click must create a fresh document');
  // A second cookie jar sees the same global inventory, and visits never decrement it.
  const second = await context(); const visitor = await second.newPage(); await visitor.goto(base + '/?lang=en');
  await visitor.getByText('8 of 8 discounted packages available', { exact: true }).first().waitFor(); assert.equal(remaining,8);
  remaining = 7; await page.goto(base + '/?lang=en'); await page.getByText('7 of 8 discounted packages available', { exact: true }).first().waitFor();
  await visitor.reload(); await visitor.getByText('7 of 8 discounted packages available', { exact: true }).first().waitFor();
  // Remember consenting visitors across a week; genuine inventory alone sets the count.
  assert.ok(!(await page.context().cookies()).some(cookie => cookie.name === 'gc_wedding_offer_seen'));
  await first.addInitScript(() => { window.Cookiebot = {consent:{marketing:true}}; });
  await first.addCookies([{name:'gc_wedding_offer_seen',value:'wedding-launch-189-40-eight-20261025~'+(Date.now()-7*86400000),url:base}]);
  remaining = 4; await page.reload();
  await page.getByText('Welcome back — check the remaining packages.',{exact:true}).waitFor();
  await page.getByText('4 of 8 discounted packages available',{exact:true}).first().waitFor();
  assert.equal(remaining,4,'Returning visits never fabricate or decrement inventory');
  await page.evaluate(()=>{window.Cookiebot.consent.marketing=false;window.dispatchEvent(new Event('CookiebotOnDecline'));});
  await page.waitForFunction(()=>!document.cookie.split(';').some(cookie=>cookie.trim().startsWith('gc_wedding_offer_seen=')));
  let remembered;
  for(let attempt=0;attempt<20;attempt++){remembered=(await page.context().cookies()).some(cookie=>cookie.name==='gc_wedding_offer_seen');if(!remembered)break;await page.waitForTimeout(50);}
  assert.equal(remembered,false,'Consent withdrawal must remove the returning-visitor cookie');
  remaining = 0; await page.reload(); await page.getByText('Standard package price', { exact: true }).first().waitFor();
  assert.ok(!await page.locator('[data-wedding-offer]').first().innerText().then(text => text.includes('113')));
  available = false; await page.reload(); await page.getByText('Standard package price', { exact: true }).first().waitFor();
  assert.ok(!await page.locator('[data-wedding-offer]').first().innerText().then(text => text.includes('of 8')));
  assert.deepEqual(errors,[]);
  console.log('PASS package browser: six languages at five widths from 320–1280px, real header/footer, default/larger text and unclipped content bounds, fifteen feature groups, three illustrated guides, exact launch price, shared availability across cookie jars, exhaustion and unavailable-inventory fallback.');
 } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error('::error title=Wedding page layout::'+String(error.stack||error).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A')); process.exitCode = 1; });
