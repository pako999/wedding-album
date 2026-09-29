// Run after `npx next build`; browser tooling is installed by the verification workflow.
// The real menu, routing helpers, translations, logo and production CSS are used.
// Only Next's Link is replaced with a native anchor in this isolated UI fixture.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { build } from 'esbuild';
import { chromium, webkit } from 'playwright';

const root = process.cwd();
const temp = fs.mkdtempSync(path.join(root, '.mobile-menu-check-'));
const artifacts = path.join(root, 'artifacts/mobile-menu');
fs.mkdirSync(artifacts, { recursive: true });
function cssFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? cssFiles(file) : file.endsWith('.css') ? [file] : [];
  });
}
const styles = cssFiles(path.join(root, '.next/static'));
assert.ok(styles.length, 'Production styles must exist');
const css = styles.map(file => fs.readFileSync(file, 'utf8')).join('\n');
const script = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HomeMobileMenu, buildHomeMobileMenuLinks } from './components/HomeMobileMenu';
import { WEDDING_PATHS, WEDDING_LANGS } from './lib/wedding/contracts';
import { weddingCopy } from './lib/wedding/copy';
import { localePublicPath } from './lib/urls';
const params = new URLSearchParams(location.search);
const lang = params.get('lang') || 'sl';
const signedIn = params.get('signedIn') === '1';
const homeLinks = [
  {href:'#how',label:'Kako deluje'}, {href:'#events',label:'Dogodki'},
  {href:'#templates',label:'Predloge'}, {href:'#wall',label:'Live Wall'},
  {href:'#pricing',label:'Cenik'}, {href:'#business',label:'Za podjetja'},
  {href:'/blog',label:'Blog'},
];
for (const language of WEDDING_LANGS) {
  const expected = localePublicPath(language, WEDDING_PATHS[language]);
  const legacy = [{href:'#business',label:'Business'}, {href:'/blog',label:'Blog'}, {href:'/contact',label:'Contact'}, {href:'/future-feature',label:'Future feature'}];
  const before = JSON.stringify(legacy);
  const withDuplicate = [...legacy, {href:WEDDING_PATHS[language],label:'duplicate'}, {href:'https://example.test'+expected,label:'duplicate'}];
  const result = buildHomeMobileMenuLinks(language, withDuplicate);
  if (result.filter(link => link.href === expected).length !== 1 || result[0].label !== weddingCopy(language).nav) throw new Error('Wedding link missing/duplicated: '+language);
  if (!legacy.every(link => result.some(item => item.href === link.href))) throw new Error('Supplied navigation was lost: '+language);
  if (JSON.stringify(legacy) !== before) throw new Error('Input links were mutated');
}
window.__menuTests = { passed: true, weddingHref: localePublicPath(lang, WEDDING_PATHS[lang]), weddingLabel: weddingCopy(lang).nav };
const labels = {open:'Open menu',close:'Close menu',language:'Language',languageAria:'Change language',signIn:'Sign in',dashboard:'Dashboard',cta:'Create gallery'};
createRoot(document.getElementById('root')).render(
  <main style={{overflow:'hidden'}}>
    <header style={{position:'fixed',top:0,left:0,right:0,height:72,backdropFilter:'blur(24px)',zIndex:50,background:'#fffdf8',borderBottom:'1px solid #ccc'}}>
      <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px'}}>
        <span>Guestcam</span><HomeMobileMenu lang={lang} signedIn={signedIn} links={homeLinks} labels={labels}/>
      </div>
    </header>
    <div style={{height:900,paddingTop:120}}>Background content</div>
    <section id='how' style={{height:900}}>How it works</section>
    <section id='pricing' style={{height:1400}}>Pricing</section>
    <button id='background-action' style={{position:'fixed',bottom:20,left:20,zIndex:2147483647}}>Background widget</button>
  </main>
);
`;
await build({
  stdin: { contents: script, resolveDir: root, sourcefile: 'mobile-menu-fixture.tsx', loader: 'tsx' },
  outfile: path.join(temp, 'fixture.js'), bundle: true, platform: 'browser', format: 'iife', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_APP_URL': '"https://www.guestcam.si"' },
  plugins: [{ name: 'native-next-link', setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'next-link', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: "import React from 'react'; export default function Link({href,prefetch,replace,scroll,onNavigate,...props}) {return <a href={href} {...props}/>}", loader: 'jsx', resolveDir: root }));
  }}],
});
const js = fs.readFileSync(path.join(temp, 'fixture.js'));
const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>';
const server = http.createServer((req, res) => {
  if (req.url === '/fixture.js') { res.setHeader('content-type','application/javascript'); res.end(js); }
  else if (req.url === '/fixture.css') { res.setHeader('content-type','text/css'); res.end(css); }
  else { res.setHeader('content-type','text/html'); res.end(html); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const viewports = [{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:1023,height:768},{width:844,height:390}];
const languages = ['sl','hr','sr','en','de','es'];
const results = [];
try {
  for (const [engine, browserType] of [['chromium',chromium],['webkit',webkit]]) {
    const browser = await browserType.launch();
    try {
      for (const viewport of viewports) {
        const context = await browser.newContext({viewport,hasTouch:true});
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(String(error)));
        for (const lang of languages) {
          await page.goto(`${base}/?lang=${lang}`);
          await page.waitForFunction(() => window.__menuTests?.passed);
          const expected = await page.evaluate(() => window.__menuTests);
          const trigger = page.getByRole('button',{name:'Open menu',exact:true});
          assert.ok(await trigger.isVisible(), 'Menu button must exist below 1024px');
          await trigger.click();
          const dialog = page.getByRole('dialog');
          await dialog.waitFor({state:'visible'});
          assert.ok(await dialog.evaluate(el => el.matches(':modal')), 'Use the browser top layer');
          const box = await dialog.boundingBox();
          assert.ok(Math.abs(box.x)<2 && Math.abs(box.y)<2 && Math.abs(box.width-viewport.width)<2 && Math.abs(box.height-viewport.height)<2, `Not full-screen: ${engine}/${lang}/${viewport.width} ${JSON.stringify(box)}`);
          const wedding = dialog.locator(`nav a[href="${expected.weddingHref}"]`);
          assert.equal(await wedding.count(),1);
          assert.equal((await wedding.textContent()).replace('↗','').trim(),expected.weddingLabel);
          assert.ok(await wedding.evaluate(el => parseFloat(getComputedStyle(el).fontSize)>=24), 'Large navigation type');
          const weddingBox = await wedding.boundingBox();
          assert.ok(weddingBox.y>=0 && weddingBox.y+weddingBox.height<viewport.height,'Wedding link visible immediately');
          const cta = dialog.getByRole('link',{name:'Create gallery →',exact:true});
          const ctaBox = await cta.boundingBox();
          assert.ok(ctaBox && ctaBox.y>=0 && ctaBox.y+ctaBox.height<=viewport.height,'CTA is reachable above safe area');
          assert.equal(await dialog.locator('section a').count(),6,'Every language remains available');
          assert.ok(await dialog.evaluate(el => el.scrollWidth<=el.clientWidth),'No horizontal overflow');
          const covered = await page.evaluate(() => {
            const widget=document.getElementById('background-action'); const b=widget.getBoundingClientRect();
            return document.querySelector('dialog').contains(document.elementFromPoint(b.x+5,b.y+5));
          });
          assert.ok(covered,'Even high-z-index background widgets stay behind navigation');
          await page.keyboard.press('Tab');
          assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Keyboard focus stays in menu');
          if (lang==='sl' && viewport.width===390) await page.screenshot({path:path.join(artifacts,`${engine}-sl-390.png`)});
          const scroller = dialog.locator('div.overflow-y-auto');
          await scroller.evaluate(el => { el.scrollTop=el.scrollHeight; });
          assert.ok(await scroller.evaluate(el => el.scrollHeight<=el.clientHeight || el.scrollTop>0),'Long menus scroll independently');
          await page.keyboard.press('Escape');
          await dialog.waitFor({state:'hidden'});
          assert.equal(await page.evaluate(() => document.body.style.position),'');
          assert.ok(await trigger.evaluate(el => document.activeElement===el),'Focus returns to hamburger');
          results.push({engine,lang,...viewport,passed:true});
        }
        assert.deepEqual(errors,[],'No client-side runtime errors');
        await context.close();
      }
      const page = await browser.newPage({viewport:{width:390,height:844}});
      await page.goto(`${base}/?lang=sl`);
      await page.waitForFunction(() => window.__menuTests?.passed);
      await page.evaluate(() => window.scrollTo(0,500));
      await page.getByRole('button',{name:'Open menu',exact:true}).click();
      await page.getByRole('button',{name:'Close menu',exact:true}).click();
      await page.waitForFunction(() => Math.abs(window.scrollY-500)<2);
      await page.getByRole('button',{name:'Open menu',exact:true}).click();
      await page.getByRole('dialog').locator('a[href="#pricing"]').click();
      await page.waitForFunction(() => window.location.hash==='#pricing' && window.scrollY>900);
      assert.equal(await page.evaluate(() => document.body.style.position),'','Anchor navigation releases body lock');
      await page.getByRole('button',{name:'Open menu',exact:true}).click();
      await page.setViewportSize({width:1100,height:800});
      await page.getByRole('dialog').waitFor({state:'hidden'});
      assert.equal(await page.evaluate(() => document.body.style.position),'','Desktop resize releases body lock');
      assert.ok(!(await page.getByRole('button',{name:'Open menu',exact:true}).isVisible()));
      await page.setViewportSize({width:390,height:844});
      await page.goto(`${base}/?lang=sl&signedIn=1`);
      await page.getByRole('button',{name:'Open menu',exact:true}).click();
      assert.equal(await page.getByRole('dialog').getByRole('link',{name:'Dashboard →',exact:true}).count(),1);
      assert.equal(await page.getByRole('dialog').getByRole('link',{name:'Create gallery →',exact:true}).count(),0);
      await page.getByRole('dialog').locator('nav a[href="/porocni-paket"]').click();
      await page.waitForURL('**/porocni-paket');
      assert.equal(await page.locator('dialog[open]').count(),0,'Wedding link navigates and closes menu');
      results.push({engine,interactionChecks:'close, scroll restore, anchor, resize, auth, wedding navigation',passed:true});
      await page.close();
    } finally { await browser.close(); }
  }
  fs.writeFileSync(path.join(artifacts,'results.json'),JSON.stringify(results,null,2));
  console.log(`PASS: ${results.length} mobile-menu viewport/language and interaction checks.`);
} finally {
  await new Promise(resolve => server.close(resolve));
  fs.rmSync(temp,{recursive:true,force:true});
}
