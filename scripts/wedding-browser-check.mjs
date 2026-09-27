/** Isolated UI test. No Clerk credentials or customer database access. */
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const layout=await fs.readFile('app/layout.tsx','utf8'),proxy=await fs.readFile('proxy.ts','utf8');
const testPath='app/dev/wedding-ci';let server,browser,page;
await fs.mkdir('wedding-test-results',{recursive:true});
try {
 await fs.writeFile('app/layout.tsx',`import './globals.css'; export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}`);
 await fs.rename('proxy.ts','proxy.ts.ci-backup');
 await fs.mkdir(testPath,{recursive:true});
 await fs.writeFile(`${testPath}/page.tsx`, `import {WeddingGuest} from '@/components/wedding/WeddingGuest';import {WeddingDj} from '@/components/wedding/WeddingDj';import {WeddingSettingsCard} from '@/components/wedding/WeddingSettingsCard';import {WeddingWalkthrough} from '@/components/wedding/WeddingWalkthrough';import {HomeWeddingHero} from '@/components/wedding/HomeWeddingHero';import {weddingLang} from '@/lib/wedding/contracts';import {weddingCopy} from '@/lib/wedding/copy';export default async function Page({searchParams}:{searchParams:Promise<{view:string;lang:string}>}) {const q=await searchParams;const lang=weddingLang(q.lang);const t=weddingCopy(lang);if(q.view==='guest')return <WeddingGuest slug="wedding-ci" initialLang={lang}/>;if(q.view==='dj')return <WeddingDj slug="wedding-ci" initialLang={lang}/>;if(q.view==='admin')return <main className="mx-auto max-w-3xl p-4"><WeddingSettingsCard slug="wedding-ci" lang={lang} plan="premium"/></main>;if(q.view==='hero')return <HomeWeddingHero lang={lang} title={t.title} accent={t.plan} lead={t.subtitle} start={t.cta} note={t.included}/>;return <main className="mx-auto max-w-6xl p-4"><WeddingWalkthrough lang={lang}/></main>;}`);
 const log=await fs.open('wedding-test-results/dev-server.log','w');
 server=spawn('node',['node_modules/next/dist/bin/next','dev','--port','3001'],{env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore',log.fd,log.fd]});
 for(let i=0;i<90;i++){try{const r=await fetch('http://127.0.0.1:3001/dev/wedding-ci?view=walkthrough&lang=en');if(r.ok)break;}catch{}await delay(1000);}
 browser=await chromium.launch({headless:true});const context=await browser.newContext();page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const settings={enabled:true,requestsOpen:true,schedule:[{id:'s1',time:'18:00',title:'Ceremony',detail:'Garden'}],menu:[{id:'m1',title:'Dinner',detail:'Vegetarian option available'}],challenges:[{id:'challenge-1',title:'Photo with the couple',detail:''},{id:'challenge-2',title:'Dance floor',detail:''}]};let songs=[];let savedBingo=null;let managed=false;
 await context.route('**/api/albums/wedding-ci/wedding/manage',async route=>{const method=route.request().method();if(method==='PUT'){managed=true;Object.assign(settings,route.request().postDataJSON());}await route.fulfill({json:method==='POST'?{path:`/wedding-ci/dj#token=${'a'.repeat(43)}`}:{settings,eligible:true,published:true,hasDjLink:false}});});
 await context.route('**/api/albums/wedding-ci/wedding/dj',async route=>{if(route.request().method()==='PATCH'){const {id,status}=route.request().postDataJSON();songs=songs.map(s=>s.id===id?{...s,status}:s);}assert.match(route.request().headers().authorization??'',/^Bearer a{43}$/);await route.fulfill({json:{name:'Ana & Marko',requestsOpen:true,songs}});});
 await context.route('**/api/albums/wedding-ci/wedding',async route=>{if(route.request().method()==='POST'){songs.push({...route.request().postDataJSON(),id:'song-1',status:'new',createdAt:new Date().toISOString()});return route.fulfill({status:201,json:{ok:true}});}await route.fulfill({json:{...settings,name:'Ana & Marko',date:'2026-10-01',albumId:'ci-album',maxPhotos:99999,photoCount:0,moderationEnabled:true,requireGuestData:false,allowBingoUpload:true,completed:{},mine:{},latestPhotos:{},myRequests:songs}});});
 await context.route('**/api/albums/wedding-ci/upload-url',route=>route.fulfill({json:{type:'bunny-s3',presignedUrl:'http://127.0.0.1:3001/ci-upload',publicUrl:'/api/bunny-s3-file/albums/ci-album/ci.png',key:'albums/ci-album/ci.png'}}));
 await context.route('**/ci-upload',route=>route.fulfill({status:200,body:''}));
 await context.route('**/api/albums/wedding-ci/save-upload',async route=>{savedBingo=route.request().postDataJSON().bingoChallengeId;await route.fulfill({json:{success:true,photoId:'ci-photo',status:'pending'}});});
 async function visit(view,lang='en',width=390){await page.setViewportSize({width,height:900});await page.goto(`http://127.0.0.1:3001/dev/wedding-ci?view=${view}&lang=${lang}`,{waitUntil:'networkidle'});await page.waitForTimeout(250);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${view}/${lang} overflows ${width}px`);}
 for(const lang of ['sl','hr','sr','en','de','es']){await visit('walkthrough',lang);assert.equal(await page.locator('[role=group] button').count(),3);await page.locator('[role=group] button').nth(2).click();await page.screenshot({path:`wedding-test-results/dj-preview-${lang}-mobile.png`,fullPage:true});}
 await visit('admin');await page.getByRole('button',{name:'Save settings',exact:true}).first().click();await page.waitForTimeout(100);assert.ok(managed,'owner settings save not sent');await page.screenshot({path:'wedding-test-results/admin-mobile.png',fullPage:true});
 await visit('guest');await page.locator('input[name=title]').fill('One more time');await page.locator('input[name=requestedBy]').fill('CI guest');await page.locator('form').first().locator('button[type=submit], button:not([type])').last().click();await page.waitForTimeout(150);assert.equal(songs.length,1,'song request not saved');
 await page.locator('article').filter({hasText:'Photo with the couple'}).getByRole('button').click();await page.getByRole('dialog').locator('input').fill('CI guest');await page.getByRole('dialog').locator('button').first().click();await page.locator('input[type=file]').setInputFiles({name:'ci.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jF9sAAAAASUVORK5CYII=','base64')});
 const uploadButton=page.getByRole('button',{name:/^Upload \(1\)$/});await uploadButton.click();for(let i=0;i<30&&!savedBingo;i++)await delay(100);assert.equal(savedBingo,'challenge-1','bingo challenge lost in upload');await page.screenshot({path:'wedding-test-results/bingo-upload-mobile.png',fullPage:true});
 await page.goto(`http://127.0.0.1:3001/dev/wedding-ci?view=dj&lang=en#token=${'a'.repeat(43)}`,{waitUntil:'networkidle'});await page.locator('article select').selectOption('played');await page.waitForTimeout(150);assert.equal(songs[0].status,'played','DJ status did not persist');assert.ok(!page.url().includes('#token'),'DJ token was not removed from URL');await page.screenshot({path:'wedding-test-results/dj-mobile.png',fullPage:true});
 await visit('hero','sl',1440);await page.screenshot({path:'wedding-test-results/hero-desktop.png',fullPage:true});await visit('hero','sl',390);await page.screenshot({path:'wedding-test-results/hero-mobile.png',fullPage:true});
 await visit('walkthrough','sl',1440);await page.screenshot({path:'wedding-test-results/walkthrough-desktop.png',fullPage:true});
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS browser: all six locales, 390/1440px no overflow, owner save, guest song, bingo upload, DJ update, screenshots and no page errors.');
} catch (error) {
 await fs.writeFile('wedding-test-results/error.txt',String(error?.stack??error));
 await page?.screenshot({path:'wedding-test-results/failure.png',fullPage:true}).catch(()=>{});
 throw error;
} finally {
 await browser?.close();server?.kill('SIGTERM');await fs.writeFile('app/layout.tsx',layout);await fs.writeFile('proxy.ts',proxy);await fs.rm('proxy.ts.ci-backup',{force:true});await fs.rm(testPath,{recursive:true,force:true});
}
