// Real unified editor + browser image decoding. Storage/auth are intercepted; no customer writes.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { build } = require('esbuild'), playwright = require('playwright'), sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const engine = process.env.WEDDING_UPLOAD_ENGINE || 'chromium';
function report(error) {
 console.error(error);
 if(process.env.GITHUB_ACTIONS)console.error('::error::'+String(error?.stack || error).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A'));
}
process.on('unhandledRejection', error => { report(error); process.exit(1); });
process.on('uncaughtException', error => { report(error); process.exit(1); });
(async () => {
 const bundle = await build({ stdin: { resolveDir: root, loader: 'tsx', contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSuiteManager} from './components/wedding-suite/WeddingSuiteManager';import {WeddingSuiteGuest} from './components/wedding-suite/WeddingSuiteGuest';import {imageCopy} from './lib/wedding-suite/image-copy';import {builderCopy} from './lib/wedding-suite/builder-copy';import {presentationCopy} from './lib/wedding-suite/presentation-copy';import {TRANSLATION_COPY} from './components/wedding/TranslationOptions';const lang=new URLSearchParams(location.search).get('lang')||'sl';window.fixtureCopy={image:imageCopy(lang),builder:builderCopy(lang),presentation:presentationCopy(lang),translation:TRANSLATION_COPY[lang]};createRoot(document.getElementById('root')).render(location.search.includes('guest')?<WeddingSuiteGuest slug="image-fixture" initialLang={lang}/>:<WeddingSuiteManager slug="image-fixture" lang={lang} plan="premium"/>);` }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: root + '/tsconfig.json', define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' } });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(file => file.endsWith('.css')).map(file => fs.readFileSync(root + '/.next/static/chunks/' + file, 'utf8')).join('\n');
 const errors = [], images = new Map();
 let uploadCount = 0, failUpload = false, holdUpload;
 const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://fixture.test').pathname;
  if (pathname === '/api/albums/image-fixture/wedding-suite/images') {
   // WebKit's network inspector can omit Blob request bodies. Read the real HTTP
   // upload instead, so this checks the bytes that the API actually receives.
   try {
    assert.equal(request.method,'PUT'); const chunks=[]; for await (const chunk of request) chunks.push(chunk); const bytes=Buffer.concat(chunks);
    assert.ok(bytes.length && bytes.length<=3*1024*1024); const meta=await sharp(bytes).metadata(); assert.equal(Math.max(meta.width,meta.height),2400);
    assert.ok(['image/webp','image/jpeg'].includes(request.headers['content-type']));
    const id=++uploadCount; if(holdUpload)await holdUpload;
    response.setHeader('Content-Type','application/json');
    if(failUpload){response.writeHead(502);response.end(JSON.stringify({error:'unavailable'}));return;}
    const url=`https://wedding-images.example.test/photo-${id}.webp`;images.set(url,await sharp(bytes).webp().toBuffer());response.end(JSON.stringify({url}));
   } catch(error) {errors.push(String(error));report(error);response.writeHead(500);response.end('{}');}
  }
  else if (pathname === '/app.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (pathname === '/app.css') { response.setHeader('Content-Type', 'text/css'); response.end(css); }
  else if (pathname.startsWith('/hero/')) { const file = path.resolve(root, 'public', '.' + pathname); if (!file.startsWith(root + '/public/hero/') || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; } response.setHeader('Content-Type', 'image/webp'); response.end(fs.readFileSync(file)); }
  else { response.setHeader('Content-Type', 'text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 let browser;
 try {
  browser = await playwright[engine].launch(engine === 'chromium' ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  page.on('dialog', dialog => { void dialog.accept().catch(() => {}); }); page.on('pageerror', error => errors.push(error.message));
  const languages = ['sl','hr','sr','en','de','es'];
  let config = JSON.parse(fs.readFileSync(root + '/docs/wedding-suite-test-fixture.json', 'utf8'));
  config.story = []; config.travel = []; config.page = { title: Object.fromEntries(languages.map(lang => [lang,'Ana & Marko'])), headingFont: 'elegant', bodyFont: 'modern', background: '#fcfaf6', textColor: '#1c1917', accent: '#92400e', coverImageUrl: '/hero/wedding-garden-template.webp', sections: [{ id: 'a2c41a03-a4ef-44dc-a332-0c8909770111', category: 'custom', title: { sl: 'Najina zgodba', en: 'Our story' }, visible: true, fields: [] }] };
  const file = { name: 'wedding-photo.jpg', mimeType: 'image/jpeg', buffer: await sharp(root + '/public/hero/wedding-walk.webp').resize({ width: 3600 }).jpeg({ quality: 93 }).toBuffer() };
  await page.route('https://wedding-images.example.test/**', route => { const bytes = images.get(route.request().url()); return route.fulfill({ status: bytes ? 200 : 404, contentType: 'image/webp', body: bytes || '' }); });
  await page.route('**/api/albums/image-fixture/wedding-suite/manage*', route => {
   if (route.request().method() === 'PUT') { config = route.request().postDataJSON(); return route.fulfill({ json: { config } }); }
   return route.fulfill({ json: { config, configured: true, attendees: [], entries: [], emails: [], guestPath: '/image-fixture/celebrate', preview: true } });
  });
  await page.route('**/api/albums/image-fixture/wedding/manage*', route => route.fulfill({ json: { settings: { enabled:false, requestsOpen:true, schedule:[],menu:[],challenges:[] }, eligible:true,published:true,hasDjLink:false } }));
  await page.route('**/api/albums/image-fixture/wedding-suite', route => route.fulfill({ json: { config, entries:[],attendee:null,language:'sl',album:{id:'fixture',slug:'image-fixture',name:'Ana & Marko',date:'2027-07-31',maxPhotos:1000,photoCount:0,moderationEnabled:true,passwordProtected:false} } }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const saved = () => page.waitForSelector('[data-autosave-state="saved"]');
  await page.goto(base + '/?lang=sl'); await saved();
  let copy = await page.evaluate(() => window.fixtureCopy);
  await page.getByRole('checkbox',{name:copy.translation.auto,exact:true}).uncheck();
  const builder = page.locator('[data-wedding-builder]');
  const cover = builder.locator('details').filter({has:page.locator(`summary`,{hasText:copy.presentation.cover})}).first();
  await cover.locator('summary').click();
  let release; holdUpload = new Promise(resolve => { release = resolve; });
  await cover.locator('input[type="file"]').setInputFiles(file);
  await page.waitForSelector('[data-autosave-state="uploading"]');
  await builder.getByLabel(copy.builder.pageTitle,{exact:true}).fill('Ana & Marko · najin dan');
  holdUpload = null; release(); await saved();
  assert.equal(config.page.title.sl,'Ana & Marko · najin dan'); assert.equal(config.page.coverImageUrl,'https://wedding-images.example.test/photo-1.webp');
  await builder.locator('aside [data-wedding-cover] img').evaluate(image => image.decode());
  const previous = config.page.coverImageUrl;
  failUpload = true; await cover.locator('input[type="file"]').setInputFiles(file); await cover.getByRole('alert').waitFor(); assert.equal(config.page.coverImageUrl,previous);
  failUpload = false; await cover.locator('input[type="file"]').setInputFiles(file); await saved(); assert.notEqual(config.page.coverImageUrl,previous);
  const beforeInvalid = uploadCount;
  await cover.locator('input[type="file"]').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('not a photo')}); await cover.getByText(copy.image.invalid_image,{exact:true}).waitFor();
  await cover.locator('input[type="file"]').setInputFiles({name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(26*1024*1024)}); await cover.getByText(copy.image.too_large,{exact:true}).waitFor(); assert.equal(uploadCount,beforeInvalid);
  holdUpload = new Promise(resolve => { release = resolve; });
  await cover.locator('input[type="file"]').setInputFiles(file); await page.waitForSelector('[data-autosave-state="uploading"]');
  await builder.getByRole('button',{name:copy.presentation.modern,exact:true}).click(); holdUpload = null; release(); await saved();
  assert.equal(config.page.coverImageUrl,'/hero/wedding-walk.webp'); await cover.getByText(copy.image.superseded,{exact:true}).waitFor();
  await cover.locator('input[type="file"]').setInputFiles(file); await saved();
  const finalCover = config.page.coverImageUrl;
  await builder.getByLabel(copy.builder.fieldType,{exact:true}).selectOption('image'); await builder.getByRole('button',{name:'+ '+copy.builder.addField,exact:true}).click();
  const field = builder.locator('[data-page-field]').last(); await field.getByLabel(copy.image.caption,{exact:true}).fill('Najin prvi skupni spomin');
  await field.locator('input[type="file"]').setInputFiles(file); await saved();
  const contentImage = config.page.sections[0].fields[0].url; assert.ok(contentImage.startsWith('https://wedding-images.example.test/'));
  await builder.locator('aside figure img').evaluate(image=>image.decode());
  await page.reload(); await saved(); assert.equal(config.page.coverImageUrl,finalCover); assert.equal(config.page.sections[0].fields[0].url,contentImage);
  await page.getByRole('checkbox',{name:copy.translation.auto,exact:true}).uncheck();
  for (const width of [320,390,1280]) { await page.setViewportSize({width,height:1000}); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`upload controls overflow at ${width}`); }
  const output = root + '/artifacts/mobile-menu'; fs.mkdirSync(output,{recursive:true});
  await page.setViewportSize({width:1280,height:1000}); await builder.locator('details').first().locator('summary').click(); await builder.getByLabel(copy.builder.pageTitle,{exact:true}).scrollIntoViewIfNeeded(); await page.screenshot({path:output+`/wedding-image-upload-${engine}.png`});
  await page.goto(base+'/?guest=1&lang=sl'); await page.locator('[data-wedding-page-content] figure img').waitFor();
  assert.equal(await page.locator('[data-wedding-page-content] figure img').getAttribute('src'),contentImage); await page.getByText('Najin prvi skupni spomin',{exact:true}).waitFor();
  for (const lang of languages) {
   await page.goto(base+'/?lang='+lang); await saved(); copy = await page.evaluate(()=>window.fixtureCopy); await page.getByRole('checkbox',{name:copy.translation.auto,exact:true}).uncheck();
   const details = builder.locator('details').first(); await details.locator('summary').click();
   await details.getByRole('button',{name:copy.image.upload,exact:true}).waitFor();
   if (lang === 'sl') { await details.getByRole('button',{name:copy.image.remove+' · '+copy.presentation.cover,exact:true}).click(); await saved(); assert.equal(config.page.coverImageUrl,''); }
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS wedding image uploads (${engine}): real image decoding/resize, cover + section photos, autosave/reload, actual guest rendering, pending-edit safety, replacement safety, failure/retry, invalid/oversize rejection, six locales and 320–1280px controls.`);
 } finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); }
})().catch(error=>{report(error);process.exitCode=1;});
