// Real checkout component and currency math; isolated Next routing and intercepted quote/payment responses.
const fs = require('node:fs'); const http = require('node:http'); const path = require('node:path'); const assert = require('node:assert/strict');
const { createRequire } = require('node:module'); const root = path.resolve(__dirname, '..'); const req = createRequire(path.join(root, 'package.json'));
const { build } = req('esbuild'); const { chromium } = req('playwright');
(async () => {
 const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {UpgradePage} from './components/dashboard/UpgradePage';createRoot(document.getElementById('root')).render(<UpgradePage lang="en" album={{slug:'offer-checkout',coupleName:'Test couple',plan:'free',weddingDate:'2027-07-31'}}/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: path.join(root, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_FB_PIXEL_ID': '""', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' }, plugins: [{ name: 'next-fixture-shell', setup(builder) {
  builder.onResolve({ filter: /^(next\/link|next\/image|next\/navigation|@\/components\/(SiteHeader|SeoFooter))$/ }, args => ({ path: args.path, namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ resolveDir: root, loader: 'jsx', contents: args.path === 'next/navigation' ? 'export function useSearchParams(){return new URLSearchParams(location.search)}' : args.path === 'next/link' ? 'export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}' : args.path === 'next/image' ? 'export default function Image({fill,priority,quality,sizes,...props}){return <img {...props} style={fill?{position:"absolute",width:"100%",height:"100%"}:undefined}/>}' : args.path.endsWith('SiteHeader') ? 'export function SiteHeader(){return <header>Guestcam</header>}' : 'export function SeoFooter(){return <footer>Guestcam</footer>}' }));
 }}] });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(x => x.endsWith('.css')).map(x => fs.readFileSync(root + '/.next/static/chunks/' + x, 'utf8')).join('\n');
 const server = http.createServer((request, response) => {
  if (request.url === '/fixture.js') { response.setHeader('content-type','application/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (request.url === '/fixture.css') { response.setHeader('content-type','text/css'); response.end(css); }
  else if (request.url.startsWith('/hero/') || request.url.startsWith('/print/')) { const filename = path.resolve(root, 'public', '.' + request.url); if (!filename.startsWith(root + '/public/') || !fs.existsSync(filename)) { response.writeHead(404); response.end(); return; } response.setHeader('content-type', filename.endsWith('.png') ? 'image/png' : 'image/webp'); response.end(fs.readFileSync(filename)); }
  else { response.setHeader('content-type','text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); let browser;
 try {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  let quote = {verified:true,remaining:1,capacity:20,eligible:true,pending:false,priceCents:13230};
  const page = await browser.newPage({viewport:{width:390,height:900}}); const errors=[]; const payments=[]; const invoices=[];
  page.on('pageerror',error=>{errors.push(error.message);console.error('Browser error:',error.message)});page.on('dialog',dialog=>dialog.dismiss());
  await page.route('**/api/wedding-offer**',route=>route.fulfill({json:quote}));
  await page.route('**/api/discount/validate',route=>route.fulfill({json:{valid:true,percentOff:15,discountCodeId:'test-code',finalCents:11246}}));
  await page.route('**/api/checkout',route=>{payments.push(route.request().postDataJSON());quote={...quote,remaining:0,eligible:false,priceCents:18900};return route.fulfill({status:409,json:{error:'price_changed'}})});
  await page.route('**/api/bank-order',route=>{invoices.push(route.request().postDataJSON());return route.fulfill({json:{success:true}})});
  const base=`http://127.0.0.1:${server.address().port}/?plan=premium`;
  await page.goto(base);await page.waitForFunction(()=>document.body.innerText.includes('132.30')).catch(async error=>{console.error((await page.locator('body').innerText()).slice(0,1800));throw error});
  await page.locator('input[type=checkbox]').last().check();
  const card=page.getByRole('button',{name:/^Confirm order & continue to payment/});
  await Promise.all([page.waitForResponse(response=>response.url().endsWith('/api/checkout')),card.click()]);
  assert.equal(payments[0].expectedPlanCents,13230);
  await page.waitForFunction(()=>document.body.innerText.includes('189'));
  quote={...quote,remaining:1,eligible:true,priceCents:13230};
  await page.reload();await page.waitForFunction(()=>document.body.innerText.includes('132.30')).catch(async error=>{console.error((await page.locator('body').innerText()).slice(0,1800));throw error});
  await page.locator('input.font-mono').fill('TEST');await page.locator('input.font-mono').press('Enter');
  await page.waitForFunction(()=>document.body.innerText.includes('112.46'));
  await page.getByRole('button',{name:/Bank transfer \/ invoice/}).click();
  await page.getByPlaceholder('Full name *',{exact:true}).fill('Test buyer');
  await page.getByPlaceholder('Email address *',{exact:true}).fill('buyer@example.test');
  await page.getByPlaceholder('Street and number *',{exact:true}).fill('Test street 1');
  await page.getByPlaceholder('City *',{exact:true}).fill('Test city');
  await page.locator('input[type=checkbox]').last().check();
  await Promise.all([page.waitForResponse(response=>response.url().endsWith('/api/bank-order')),page.getByRole('button',{name:/^Submit invoice order/}).click()]);
  assert.equal(invoices[0].expectedPlanCents,11246);assert.equal(invoices[0].discountCode,'TEST');
  assert.deepEqual(errors,[]);
  console.log('PASS checkout browser: verified €132.30 display/request, sold-out repricing protection and exact €112.46 discounted invoice request at 390px.');
 } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
