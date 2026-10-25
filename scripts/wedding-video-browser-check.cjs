// Real recorder with Chromium synthetic camera/audio; no real camera or external requests.
const fs = require('node:fs'); const http = require('node:http'); const path = require('node:path'); const assert = require('node:assert/strict');
const { createRequire } = require('node:module'); const root = path.resolve(__dirname, '..'); const req = createRequire(path.join(root, 'package.json'));
const { build } = req('esbuild'); const { chromium } = req('playwright');
(async () => {
 const bundle = await build({ stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {VideoRecorder} from './components/wedding-suite/VideoRecorder';createRoot(document.getElementById('root')).render(<VideoRecorder lang="en" onFile={file=>{window.recordedFile=file;window.recorded={name:file.name,size:file.size,type:file.type}}}/>);`, resolveDir: root, loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', tsconfig: path.join(root, 'tsconfig.json'), define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_FB_PIXEL_ID': '""', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' }, plugins: [{ name: 'next-fixture-shell', setup(builder) {
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
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'] });
  const page = await browser.newPage({viewport:{width:390,height:900},permissions:['camera','microphone']}); const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{window.mediaRequests=0;window.mediaStreams=[];const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=async options=>{window.mediaRequests++;const stream=await original(options);window.mediaStreams.push(stream);return stream;}});
  const base=`http://127.0.0.1:${server.address().port}`;
  await page.goto(base);
  await page.getByRole('button',{name:/Record video/}).evaluate(button=>{button.click();button.click()});
  await page.getByRole('button',{name:'Stop recording',exact:true}).waitFor();
  await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Stop recording',exact:true}).click();
  await page.waitForFunction(()=>window.recorded?.size>0);
  assert.equal(await page.evaluate(()=>window.mediaRequests),1,'rapid clicks must not create multiple camera streams');
  assert.ok(await page.evaluate(()=>window.mediaStreams.every(stream=>stream.getTracks().every(track=>track.readyState==='ended'))));
  const recorded=await page.evaluate(()=>window.recorded);assert.ok(recorded.type.startsWith('video/'));
  await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError')};window.recorded=null});
  await page.getByRole('button',{name:/Record video/}).click();await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('input[type=file]').isEnabled(),true);
  await page.locator('input[type=file]').setInputFiles({name:'fallback.webm',mimeType:'video/webm',buffer:Buffer.from('isolated-upload-fixture')});
  assert.equal(await page.evaluate(()=>window.recorded.name),'fallback.webm');
  await page.evaluate(()=>{window.MediaRecorder=undefined});await page.getByRole('button',{name:/Record video/}).click();
  assert.equal(await page.locator('input[type=file]').isEnabled(),true);assert.deepEqual(errors,[]);
  console.log('PASS video browser: actual synthetic camera/audio recording, nonempty video File, rapid-click single-stream guard, stopped tracks and upload fallback after denied/unsupported recording at 390px.');
 } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
