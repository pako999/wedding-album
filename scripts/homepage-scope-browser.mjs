/** Public-page UI checks, isolated from Clerk, payments and customer databases. */
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { chromium, expect } from '@playwright/test';
const copySource = await fs.readFile('lib/wedding/copy.ts', 'utf8');
const copyCode = ts.transpileModule(copySource, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const copyModule = {exports:{}}; new Function('module','exports',copyCode)(copyModule,copyModule.exports);
const copy = copyModule.exports.WEDDING_COPY;
const layout = await fs.readFile('app/layout.tsx','utf8');
const proxy = await fs.readFile('proxy.ts','utf8');
const testPath = 'app/dev/homepage-scope-ci';
const output = 'wedding-test-results/homepage-scope';
const origin = 'http://127.0.0.1:3001';
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
let server, browser, page;
await fs.mkdir(output,{recursive:true});
try {
 await fs.writeFile('app/layout.tsx', "import './globals.css'; export default function Layout({children}:{children:React.ReactNode}) {return <html lang=\"en\"><body>{children}</body></html>;}");
 await fs.rename('proxy.ts','proxy.ts.scope-backup');
 await fs.mkdir(testPath,{recursive:true});
 await fs.writeFile(`${testPath}/page.tsx`, `import { GuestcamHomePage } from '@/components/GuestcamHomePage'; import { LocalizedGuestcamHomePageV3 } from '@/components/LocalizedGuestcamHomePageV3'; import { WeddingLandingPage } from '@/components/wedding/WeddingLandingPage'; import { weddingLang } from '@/lib/wedding/contracts'; export default async function Page({searchParams}:{searchParams:Promise<{view?:string;lang?:string}>}) { const query=await searchParams; const lang=weddingLang(query.lang); if(query.view==='wedding')return <WeddingLandingPage lang={lang}/>; return lang==='sl'?<GuestcamHomePage/>:<LocalizedGuestcamHomePageV3 lang={lang}/>; }`);
 const log = await fs.open(`${output}/server.log`,'w');
 const env = {...process.env, NEXT_TELEMETRY_DISABLED:'1'}; delete env.DATABASE_URL;
 server=spawn('node',['node_modules/next/dist/bin/next','dev','--port','3001'],{env,stdio:['ignore',log.fd,log.fd]});
 let ready=false;
 for(let attempt=0;attempt<90;attempt++){try {const response=await fetch(`${origin}/dev/homepage-scope-ci?lang=sl`);if(response.ok){ready=true;break;}}catch{}await delay(1000);}
 assert.ok(ready,'Isolated homepage server did not become ready');
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({serviceWorkers:'block'});page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 // Do not download external videos or contact customer/marketing services.
 await context.route(url=>url.origin!==origin,route=>route.abort());
 for(const lang of ['sl','hr','sr','en','de','es']){
  const t=copy[lang];
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});
   const response=await page.goto(`${origin}/dev/homepage-scope-ci?lang=${lang}`,{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   const hero=page.locator('main > section').first();
   assert.equal(await hero.locator('video').count(),0,`${lang}: redesigned video hero remains`);
   assert.equal(await hero.locator('img').count(),3,`${lang}: original three hero photos not restored`);
   await expect(hero.locator('a[href="/demo"]')).toBeVisible();
   await expect(page.locator('#pricing article')).toHaveCount(4);
   const premium=page.locator('#pricing article').last();
   await expect(premium).toContainText(t.plan);
   for(const key of ['schedule','menu','songs','bingo'])await expect(premium).toContainText(t[key]);
   const detail=premium.getByRole('link',{name:`${t.nav} →`,exact:true});
   await expect(detail).toBeVisible();
   const href=await detail.getAttribute('href');assert.ok(href&&!href.includes('dashboard'),`${lang}: no wedding detail link`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang}/${width}: viewport overflow`);
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${output}/home-${lang}-${width}.png`});
   await premium.screenshot({path:`${output}/pricing-${lang}-${width}.png`});
   await page.goto(`${origin}/dev/homepage-scope-ci?view=wedding&lang=${lang}`,{waitUntil:'networkidle'});
   await expect(page.locator('h1')).toHaveText(t.title);
   for(const key of ['schedule','menu','songs','bingo'])await expect(page.locator('main')).toContainText(t[key]);
   await expect(page.locator('[role=group] button')).toHaveCount(3);
   await page.locator('[role=group] button').last().click();
   await expect(page.locator('[role=group] button').last()).toHaveAttribute('aria-pressed','true');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`wedding/${lang}/${width}: viewport overflow`);
   await page.screenshot({path:`${output}/wedding-${lang}-${width}.png`,fullPage:true});
   console.log(`PASS ${lang} ${width}px: original homepage, upgraded pricing, separate wedding page and interactive DJ preview`);
  }
 }
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: 24 public-page viewport checks across all six languages; no JavaScript page errors. No customer data accessed.');
 await fs.writeFile(`${output}/result.txt`,'PASS: 24 public-page viewport checks, six languages, original homepage, wedding pricing and separate wedding page.');
} catch(error) {
 await fs.writeFile(`${output}/error.txt`,String(error?.stack??error));
 await page?.screenshot({path:`${output}/failure.png`,fullPage:true}).catch(()=>{});
 throw error;
} finally {
 await browser?.close();server?.kill('SIGTERM');
 await fs.writeFile('app/layout.tsx',layout);await fs.writeFile('proxy.ts',proxy);
 await fs.rm('proxy.ts.scope-backup',{force:true});await fs.rm(testPath,{recursive:true,force:true});
}
