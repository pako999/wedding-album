// Real unified editor, native HTTPS uploads and browser decoding; isolated fixture data only.
const fs = require('node:fs'), path = require('node:path'), https = require('node:https'), os = require('node:os');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { build } = require('esbuild'), playwright = require('playwright'), sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const engine = process.env.WEDDING_UPLOAD_ENGINE || 'chromium';
async function until(predicate, message) {
 const deadline=Date.now()+20_000;
 while(!predicate()){if(Date.now()>deadline)throw new Error(message);await new Promise(resolve=>setTimeout(resolve,30));}
}
function report(error) {
 console.error(error);
 if(process.env.GITHUB_ACTIONS)console.error('::error::'+String(error?.stack || error).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A'));
}
process.on('unhandledRejection', error => { report(error); process.exit(1); });
process.on('uncaughtException', error => { report(error); process.exit(1); });
(async () => {
 const bundle = await build({ stdin: { resolveDir: root, loader: 'tsx', contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {WeddingSuiteManager} from './components/wedding-suite/WeddingSuiteManager';import {WeddingSuiteGuest} from './components/wedding-suite/WeddingSuiteGuest';import {imageCopy} from './lib/wedding-suite/image-copy';import {builderCopy} from './lib/wedding-suite/builder-copy';import {presentationCopy} from './lib/wedding-suite/presentation-copy';import {TRANSLATION_COPY} from './components/wedding/TranslationOptions';const lang=new URLSearchParams(location.search).get('lang')||'sl';window.fixtureCopy={image:imageCopy(lang),builder:builderCopy(lang),presentation:presentationCopy(lang),translation:TRANSLATION_COPY[lang]};createRoot(document.getElementById('root')).render(location.search.includes('guest')?<WeddingSuiteGuest slug="image-fixture" initialLang={lang}/>:<WeddingSuiteManager slug="image-fixture" lang={lang} plan="premium"/>);` }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: root + '/tsconfig.json', define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' } });
 const css = fs.readdirSync(root + '/.next/static/chunks').filter(file => file.endsWith('.css')).map(file => fs.readFileSync(root + '/.next/static/chunks/' + file, 'utf8')).join('\n');
 const languages = ['sl','hr','sr','en','de','es'];
 let config = JSON.parse(fs.readFileSync(root + '/docs/wedding-suite-test-fixture.json', 'utf8'));
 config.story = []; config.travel = []; config.page = { title: Object.fromEntries(languages.map(lang => [lang,'Ana & Marko'])), headingFont: 'elegant', bodyFont: 'modern', background: '#fcfaf6', textColor: '#1c1917', accent: '#92400e', coverImageUrl: '/hero/wedding-garden-template.webp', sections: [{ id: 'a2c41a03-a4ef-44dc-a332-0c8909770111', category: 'custom', title: { sl: 'Najina zgodba', en: 'Our story' }, visible: true, fields: [] }] };
 const errors = [], images = new Map();
 let uploadCount = 0, failUpload = false, holdUpload;
 const tlsDir=fs.mkdtempSync(path.join(os.tmpdir(),'wedding-upload-tls-'));
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',tlsDir+'/key.pem','-out',tlsDir+'/cert.pem','-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1,DNS:localhost'],{stdio:'ignore'});
 const json=(response,data,status=200)=>{const bytes=Buffer.from(JSON.stringify(data));response.writeHead(status,{'Content-Type':'application/json','Content-Length':bytes.length});response.end(bytes);};
 const read=async request=>{const chunks=[];for await(const chunk of request)chunks.push(chunk);return Buffer.concat(chunks);};
 const server = https.createServer({key:fs.readFileSync(tlsDir+'/key.pem'),cert:fs.readFileSync(tlsDir+'/cert.pem')},async (request, response) => {
  const pathname = new URL(request.url, 'http://fixture.test').pathname;
  if (pathname === '/api/albums/image-fixture/wedding-suite/images') {
   // No Playwright route interception: WebKit sends the native Blob body to TLS.
   try {
    assert.equal(request.method,'PUT'); const bytes=await read(request);
    assert.ok(bytes.length && bytes.length<=3*1024*1024); const meta=await sharp(bytes).metadata(); assert.equal(Math.max(meta.width,meta.height),2400);
    assert.ok(['image/webp','image/jpeg'].includes(request.headers['content-type']));
    const id=++uploadCount; if(holdUpload)await holdUpload;
    if(failUpload){json(response,{error:'unavailable'},502);return;}
    const url=`https://${request.headers.host}/photos/photo-${id}.webp`;images.set(url,await sharp(bytes).webp().toBuffer());json(response,{url});
   } catch(error) {errors.push(String(error));report(error);response.writeHead(500);response.end('{}');}
  }
  else if(pathname==='/api/albums/image-fixture/wedding-suite/manage'){
   if(request.method==='PUT'){config=JSON.parse(await read(request));json(response,{config});}
   else if(request.method==='POST'){const body=JSON.parse(await read(request));assert.equal(body.action,'translate');json(response,{config:body.config});}
   else json(response,{config,configured:true,attendees:[],entries:[],emails:[],guestPath:'/image-fixture/celebrate',preview:true});
  }
  else if(pathname==='/api/albums/image-fixture/wedding/manage')json(response,{settings:{enabled:false,requestsOpen:true,schedule:[],menu:[],challenges:[]},eligible:true,published:true,hasDjLink:false});
  else if(pathname==='/api/albums/image-fixture/wedding-suite')json(response,{config,entries:[],attendee:null,language:'sl',album:{id:'fixture',slug:'image-fixture',name:'Ana & Marko',date:'2027-07-31',maxPhotos:1000,photoCount:0,moderationEnabled:true,passwordProtected:false}});
  else if(pathname.startsWith('/photos/')){const bytes=images.get(`https://${request.headers.host}${pathname}`);response.writeHead(bytes?200:404,{'Content-Type':'image/webp'});response.end(bytes||'');}
  else if (pathname === '/app.js') { response.setHeader('Content-Type', 'text/javascript'); response.end(bundle.outputFiles[0].text); }
  else if (pathname === '/app.css') { response.setHeader('Content-Type', 'text/css'); response.end(css); }
  else if (pathname.startsWith('/hero/')) { const file = path.resolve(root, 'public', '.' + pathname); if (!file.startsWith(root + '/public/hero/') || !fs.existsSync(file)) { response.writeHead(404); response.end(); return; } response.setHeader('Content-Type', 'image/webp'); response.end(fs.readFileSync(file)); }
  else { response.setHeader('Content-Type', 'text/html'); response.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script src="/app.js"></script></body></html>'); }
 });
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 let browser;
 try {
  browser = await playwright[engine].launch(engine === 'chromium' ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, ignoreHTTPSErrors:true });
  page.on('dialog', dialog => { void dialog.accept().catch(() => {}); }); page.on('pageerror', error => errors.push(error.message));
  const file = { name: 'wedding-photo.jpg', mimeType: 'image/jpeg', buffer: await sharp(root + '/public/hero/wedding-walk.webp').resize({ width: 3600 }).jpeg({ quality: 93 }).toBuffer() };
  const base = `https://127.0.0.1:${server.address().port}`;
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
  holdUpload = null; release(); await until(()=>config.page.coverImageUrl===base+'/photos/photo-1.webp','First cover did not autosave'); await saved();
  assert.equal(config.page.title.sl,'Ana & Marko · najin dan'); assert.equal(config.page.coverImageUrl,base+'/photos/photo-1.webp');
  await builder.locator('aside [data-wedding-cover] img').evaluate(image => image.decode());
  const previous = config.page.coverImageUrl;
  failUpload = true; await cover.locator('input[type="file"]').setInputFiles(file); await cover.getByRole('alert').waitFor(); assert.equal(config.page.coverImageUrl,previous);
  failUpload = false; await cover.locator('input[type="file"]').setInputFiles(file); await until(()=>config.page.coverImageUrl!==previous,'Retried cover did not autosave'); await saved(); assert.notEqual(config.page.coverImageUrl,previous);
  const beforeInvalid = uploadCount;
  await cover.locator('input[type="file"]').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('not a photo')}); await cover.getByText(copy.image.invalid_image,{exact:true}).waitFor();
  await cover.locator('input[type="file"]').setInputFiles({name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(26*1024*1024)}); await cover.getByText(copy.image.too_large,{exact:true}).waitFor(); assert.equal(uploadCount,beforeInvalid);
  const beforeSuperseded=uploadCount;holdUpload = new Promise(resolve => { release = resolve; });
  await cover.locator('input[type="file"]').setInputFiles(file); await until(()=>uploadCount>beforeSuperseded,'Superseded upload did not reach the server: '+errors.join('; '));
  await builder.getByRole('button',{name:copy.presentation.modern,exact:true}).click(); holdUpload = null; release(); await cover.getByText(copy.image.superseded,{exact:true}).waitFor(); await until(()=>config.page.coverImageUrl==='/hero/wedding-walk.webp','Newer template did not autosave'); await saved();
  assert.equal(config.page.coverImageUrl,'/hero/wedding-walk.webp');
  await cover.locator('input[type="file"]').setInputFiles(file); await until(()=>config.page.coverImageUrl.startsWith(base+'/photos/'),'Final cover did not autosave'); await saved();
  let finalCover = config.page.coverImageUrl;
  await builder.getByLabel(copy.builder.fieldType,{exact:true}).selectOption('image'); await builder.getByRole('button',{name:'+ '+copy.builder.addField,exact:true}).click();
  const field = builder.locator('[data-page-field]').last(); await field.getByLabel(copy.image.caption,{exact:true}).fill('Najin prvi skupni spomin');
  await field.locator('input[type="file"]').setInputFiles(file); await until(()=>!!config.page.sections[0].fields[0]?.url,'Section photo did not autosave'); await saved();
  let contentImage = config.page.sections[0].fields[0].url; assert.ok(contentImage.startsWith(base+'/photos/'));
  await builder.locator('aside figure img').evaluate(image=>image.decode());
  // Overlapping uploads preserve both URLs and text, even when WebKit serializes their HTTP transport.
  const beforeParallel=uploadCount;holdUpload=new Promise(resolve=>{release=resolve;});
  await cover.locator('input[type="file"]').setInputFiles(file);await field.locator('input[type="file"]').setInputFiles(file);
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('[data-wedding-builder] input[type=file]')).filter(input=>input.disabled).length===2);
  await until(()=>uploadCount>beforeParallel,'Overlapping uploads did not start');
  await field.getByLabel(copy.image.caption,{exact:true}).fill('Najin poročni spomin');holdUpload=null;release();
  await until(()=>config.page.coverImageUrl!==finalCover&&config.page.sections[0].fields[0].url!==contentImage,'Parallel photo updates overwrote each other');await saved();
  finalCover=config.page.coverImageUrl;contentImage=config.page.sections[0].fields[0].url;assert.equal(config.page.sections[0].fields[0].text.sl,'Najin poročni spomin');
  const seating=page.locator('section').filter({has:page.getByRole('heading',{name:'Poišči svojo mizo',exact:true})}).last();
  const previousMap=config.seatingMapUrl;await seating.locator('input[type="file"]').setInputFiles(file);
  await until(()=>config.seatingMapUrl!==previousMap&&config.seatingMapUrl.startsWith(base+'/photos/'),'Seating map did not autosave');await saved();const seatingMap=config.seatingMapUrl;
  await page.reload(); await saved(); assert.equal(config.page.coverImageUrl,finalCover); assert.equal(config.page.sections[0].fields[0].url,contentImage);assert.equal(config.seatingMapUrl,seatingMap);
  await page.getByRole('checkbox',{name:copy.translation.auto,exact:true}).uncheck();
  for (const width of [320,390,1280]) { await page.setViewportSize({width,height:1000}); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`upload controls overflow at ${width}`); }
  const output = root + '/artifacts/mobile-menu'; fs.mkdirSync(output,{recursive:true});
  await page.setViewportSize({width:1280,height:1000}); await builder.locator('details').first().locator('summary').click(); await builder.getByLabel(copy.builder.pageTitle,{exact:true}).scrollIntoViewIfNeeded(); await page.screenshot({path:output+`/wedding-image-upload-${engine}.png`});
  await page.goto(base+'/?guest=1&lang=sl'); await page.locator('[data-wedding-page-content] figure img').waitFor();
  assert.equal(await page.locator('[data-wedding-page-content] figure img').getAttribute('src'),contentImage); await page.getByText('Najin poročni spomin',{exact:true}).waitFor();
  await page.getByRole('button',{name:/Poišči svojo mizo/}).click();const guestMap=page.getByRole('img',{name:'Poišči svojo mizo',exact:true});await guestMap.waitFor();assert.equal(await guestMap.getAttribute('src'),seatingMap);await guestMap.evaluate(image=>image.decode());
  for (const lang of languages) {
   await page.goto(base+'/?lang='+lang); await saved(); copy = await page.evaluate(()=>window.fixtureCopy); await page.getByRole('checkbox',{name:copy.translation.auto,exact:true}).uncheck();
   const details = builder.locator('details').first(); await details.locator('summary').click();
   await details.getByRole('button',{name:copy.image.upload,exact:true}).waitFor();
   if (lang === 'sl') { await details.getByRole('button',{name:copy.image.remove+' · '+copy.presentation.cover,exact:true}).click(); await until(()=>config.page.coverImageUrl==='','Removed cover did not autosave'); await saved(); assert.equal(config.page.coverImageUrl,''); }
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS wedding image uploads (${engine}): real image decoding/resize, cover + section + seating-map photos, autosave/reload, actual guest rendering, pending-edit safety, replacement safety, failure/retry, invalid/oversize rejection, six locales and 320–1280px controls.`);
 } finally { await browser?.close(); await new Promise(resolve=>server.close(resolve)); fs.rmSync(tlsDir,{recursive:true,force:true}); }
})().catch(error=>{report(error);process.exitCode=1;});
