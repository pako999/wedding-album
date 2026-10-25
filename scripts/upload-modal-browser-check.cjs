// Isolated UI check: real upload component and CSS, intercepted storage/metadata requests.
// Run after npm run build. Requires Playwright (provided by the cloud runtime).
const fs = require('node:fs');
const http = require('node:http');
const assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const req = createRequire(path.join(root, 'package.json'));
const {build} = req('esbuild');
const {chromium} = req('playwright');
(async()=>{
const output=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {UploadModal} from './components/album/UploadModal';import {translations} from './lib/i18n/translations';
const p=new URLSearchParams(location.search);const lang=p.get('lang')||'en';const mode=p.get('mode')||'normal';window.media=[];const t=translations[lang];window.expected=mode==='upload_only'?t.uploadOnlyNote:mode==='moderated'?t.moderationPendingNote:t.approvalNote;
createRoot(document.getElementById('root')).render(<UploadModal albumSlug="isolated-browser-album" albumId="isolated-id" uploaderName="Test guest" maxPhotos={1000} currentCount={0} lang={lang} uploadOnlyMode={mode==='upload_only'} moderationEnabled={mode==='moderated'} onMediaUploaded={m=>window.media.push(m)} onClose={()=>{}} onSuccess={()=>{}} />);`,resolveDir:root,loader:'tsx',sourcefile:'upload-fixture.tsx'},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},tsconfig:root+'/tsconfig.json'});
const css=fs.readdirSync(root+'/.next/static/chunks').filter(x=>x.endsWith('.css')).map(x=>fs.readFileSync(root+'/.next/static/chunks/'+x,'utf8')).join('\n');
const server=http.createServer((r,s)=>{if(r.url==='/fixture.js'){s.setHeader('content-type','application/javascript');s.end(output.outputFiles[0].text)}else if(r.url==='/fixture.css'){s.setHeader('content-type','text/css');s.end(css)}else{s.setHeader('content-type','text/html');s.end('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;let cases=0;
try{
browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),headless:true,args:['--no-sandbox']});
for(const lang of ['sl','hr','sr','en','de','es'])for(const mode of ['normal','upload_only','moderated']){
 const page=await browser.newPage({viewport:{width:320,height:700}});const errors=[];let saved=0;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/albums/isolated-browser-album/upload-url',r=>r.fulfill({json:{type:'r2',presignedUrl:`http://127.0.0.1:${server.address().port}/ci-upload`,publicUrl:'https://example.invalid/test.png',key:'test.png'}}));
 await page.route('**/ci-upload',r=>r.fulfill({status:200,body:''}));
 await page.route('**/api/albums/isolated-browser-album/save-upload',r=>{saved++;return r.fulfill({json:{success:true,photoId:'isolated-photo',status:mode==='moderated'?'pending':'published'}})});
 await page.goto(`http://127.0.0.1:${server.address().port}/?lang=${lang}&mode=${mode}`);
 await page.locator('input[type=file]').setInputFiles({name:'very-long-wedding-photo-name-for-small-mobile-screen.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF9sAAAAASUVORK5CYII=','base64')});
 const expected=await page.evaluate(()=>window.expected);
 await page.getByText(expected,{exact:true}).waitFor();
 assert.equal(saved,1);assert.equal(await page.evaluate(()=>window.media[0]?.id),'isolated-photo');
 assert.deepEqual(errors,[]);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang}/${mode} overflows`);
 cases++;await page.close();
}
console.log(`PASS browser: ${cases} upload cases across six languages at 320px; normal, hidden-gallery and moderation messages; original upload and suite attachment callback.`);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
