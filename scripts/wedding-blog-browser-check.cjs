// Render the real server article and blog loaders; isolate the Clerk/navigation shell.
const fs = require('node:fs'); const http = require('node:http'); const path = require('node:path');
const assert = require('node:assert/strict'); const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '..'); const req = createRequire(path.join(root, 'package.json'));
const { build } = req('esbuild'); const { chromium } = req('playwright');
(async () => {
 const result = await build({ stdin: { contents: `import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {BlogPostPage} from './components/BlogPostPage';import {getPost,getAllPosts,getTranslationMap} from './lib/blog';export async function article(lang,slug){const post=await getPost(lang,slug);return {html:renderToStaticMarkup(await BlogPostPage({post})),translations:await getTranslationMap(post.translationKey),first:(await getAllPosts(lang))[0]};}`, resolveDir:root,loader:'tsx' },bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',tsconfig:path.join(root,'tsconfig.json'),define:{'process.env.NEXT_PUBLIC_APP_URL':'"https://www.guestcam.si"'},plugins:[{name:'navigation-shell',setup(builder){
  builder.onResolve({filter:/^(next\/link|@\/components\/(SiteHeader|SeoFooter))$/},args=>({path:args.path,namespace:'fixture'}));
  builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({resolveDir:root,loader:'jsx',contents:args.path==='next/link'?'export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}':args.path.endsWith('SiteHeader')?'export function SiteHeader(){return <header>Guestcam</header>}':'export function SeoFooter(){return <footer>Guestcam</footer>}'}));
 }}]});
 const artifact='/tmp/wedding-blog-render-check.cjs';fs.writeFileSync(artifact,result.outputFiles[0].text);const {article}=require(artifact);
 const articles={};
 for(const lang of ['sl','hr','sr','en','de','es']){
  const filename=fs.readdirSync(path.join(root,'content/blog',lang)).find(file=>JSON.parse(fs.readFileSync(path.join(root,'content/blog',lang,file))).translationKey==='wedding-website-suite-guide-2026');
  const post=JSON.parse(fs.readFileSync(path.join(root,'content/blog',lang,filename)));const rendered=await article(lang,post.slug);
  for(const code of ['sl','hr','sr','en','de','es']) assert.ok(rendered.translations[code],`Missing ${code} alternate`);
  assert.equal(rendered.first.slug,post.slug,'New article is not first in the blog index');
  articles[lang]={...rendered,post};
 }
 const css=fs.readdirSync(root+'/.next/static/chunks').filter(x=>x.endsWith('.css')).map(x=>fs.readFileSync(root+'/.next/static/chunks/'+x,'utf8')).join('\n');
 const server=http.createServer((request,response)=>{
  if(request.url==='/fixture.css'){response.setHeader('content-type','text/css');response.end(css);return;}
  const lang=new URL(request.url,'http://localhost').searchParams.get('lang')||'en';
  response.setHeader('content-type','text/html; charset=utf-8');response.end(`<html lang="${lang}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body>${articles[lang].html}</body></html>`);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage();
  await page.route('https://www.guestcam.si/hero/**',route=>{const file=path.join(root,'public',new URL(route.request().url()).pathname);return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.png')?'image/png':'image/webp'});});
  const packages={sl:'/porocni-paket',hr:'/hr/vjencani-paket',sr:'/vencani-paket',en:'/en/wedding-package',de:'/de/hochzeitspaket',es:'/paquete-boda'};
  for(const [lang,{post}] of Object.entries(articles))for(const width of [320,1280]){
   await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:${server.address().port}/?lang=${lang}`);
   await page.getByRole('heading',{name:post.title,exact:true}).waitFor();
   const cta=post.content.find(block=>block.type==='cta');assert.equal(await page.getByRole('link',{name:cta.text+' →',exact:true}).getAttribute('href'),packages[lang]);
   assert.equal(await page.locator('article img').count(),3);
   for(const image of await page.locator('img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}
   assert.ok(await page.evaluate(()=>Array.from(document.images).every(image=>image.complete&&image.naturalWidth>0)));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} article overflows at ${width}px`);
   const schema=await page.locator('script[type="application/ld+json"]').allTextContents();
   assert.ok(schema.join('').includes(new URL(post.coverImage,'https://www.guestcam.si').href),'Article schema needs an absolute first-party image');
   assert.ok((await page.locator('body').innerText()).includes('189'));
   assert.ok((await page.locator('body').innerText()).match(/113[,.]40/));
  }
  console.log('PASS wedding blog: all six translations render at 320/1280px, translated package links, real illustrations load, reciprocal alternates, newest-first blog listing, absolute schema images and accurate pricing. Clerk shell is isolated.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
