import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);const ts=require('typescript');
const read=p=>fs.readFileSync(p,'utf8');
function loadTs(file){const code=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},fileName:file,reportDiagnostics:true});const errors=code.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error)??[];assert.equal(errors.length,0,`${file}: syntax errors`);const mod={exports:{}};new Function('module','exports','require',code.outputText)(mod,mod.exports,require);return mod.exports;}
const contracts=loadTs('lib/wedding/contracts.ts');const copy=loadTs('lib/wedding/copy.ts');const keys=Object.keys(copy.WEDDING_COPY.sl).sort();let checks=0;
function check(ok,label){assert.ok(ok,label);checks++;console.log(`PASS wedding: ${label}`);}
for(const lang of contracts.WEDDING_LANGS){const t=copy.weddingCopy(lang);check(JSON.stringify(Object.keys(t).sort())===JSON.stringify(keys),`${lang}: complete translation keys`);check(Object.values(t).every(v=>typeof v==='string'?v.trim().length>0:Array.isArray(v)&&v.length===9),`${lang}: nonempty translations and nine bingo prompts`);check(fs.existsSync(`app${contracts.WEDDING_PATHS[lang]}/page.tsx`),`${lang}: dedicated landing page`);const settings={...contracts.EMPTY_WEDDING,challenges:copy.defaultChallenges(lang)};check(contracts.parseWeddingSettings(settings)?.challenges.length===9,`${lang}: default bingo rows validate`);}
check(copy.weddingCopy('sl').plan==='Poročni premium','Slovenian plan name matches request');
check(contracts.parseWeddingSettings({...contracts.EMPTY_WEDDING,challenges:[{id:'a',title:'A',detail:''},{id:'a',title:'B',detail:''}]})===null,'reject duplicate challenge IDs');
check(contracts.parseWeddingSettings({...contracts.EMPTY_WEDDING,schedule:[{id:'a',title:'A',detail:'',time:'29:80'}]})===null,'reject invalid times');
check(contracts.parseWeddingSettings({...contracts.EMPTY_WEDDING,enabled:'true'})===null,'reject coerced booleans');
check(contracts.parseWeddingSettings({...contracts.EMPTY_WEDDING,challenges:Array.from({length:26},(_,i)=>({id:`a${i}`,title:'A',detail:''}))})===null,'challenge count is bounded');
check(contracts.parseWeddingSettings({...contracts.EMPTY_WEDDING,challenges:[{id:'../other',title:'A',detail:''}]})===null,'reject unsafe IDs');
const db=read('lib/wedding/schema.ts'),migration=read('scripts/migrations/20260926-wedding-premium.sql');
for(const name of ['wedding_settings','wedding_song_requests','wedding_bingo_submissions'])check(db.includes(name)&&migration.includes(`CREATE TABLE IF NOT EXISTS ${name}`),`${name}: typed schema has explicit idempotent migration`);
check(!/ALTER\s+TABLE|DROP\s+TABLE|TRUNCATE|DELETE\s+FROM/i.test(migration),'migration is additive, no existing data mutation');
check(!/bingoChallengeId|weddingSettings|weddingBingoSubmissions/.test(read('lib/db/schema.ts')),'core albums/photos schema remains unchanged');
check(read('lib/wedding/server.ts').includes('checkAlbumOwnership(album)'),'manage routes reuse verified ownership');
check(read('lib/wedding/server.ts').includes('hasAlbumRequestAccess(req, slug, album)'),'guest routes enforce existing password access');
check(read('lib/wedding/server.ts').includes('timingSafeEqual'),'DJ links use constant-time hashed secret comparison');
check(read('app/api/albums/[slug]/wedding/dj/route.ts').includes('eq(weddingSongRequests.albumId, access.album.id)'),'DJ writes are album-scoped');
const upload=read('components/album/UploadModal.tsx');check((upload.match(/await saveUpload\(albumSlug, \{\s*bingoChallengeId,/g)||[]).length===6,'all six upload paths preserve challenge ID');
check(read('app/api/albums/[slug]/save-upload/route.ts').includes('await db.batch([photoInsert, db.insert(weddingBingoSubmissions)'),'bingo and photo metadata share an atomic transaction');
check(read('app/api/albums/[slug]/wedding/route.ts').includes("eq(photos.status, 'published')"),'bingo does not reveal unapproved submissions');
check(read('components/wedding/WeddingDj.tsx').includes('if(!document.hidden)'),'automatic refresh skips hidden DJ tabs');
check(read('components/wedding/HeroVideo.tsx').includes('preload="none"'),'hero does not auto-download both videos');
const pkg=JSON.parse(read('package.json'));check(pkg.scripts.build.indexOf('db:migrate:wedding')<pkg.scripts.build.indexOf('next build'),'schema preflight runs before application build');
// Syntax-check all new files independently of environment-dependent Next generation.
for(const base of ['lib/wedding','components/wedding','app/api/albums/[slug]/wedding']){function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,f.name);if(f.isDirectory())walk(full);else if(/\.tsx?$/.test(full)){const result=ts.transpileModule(read(full),{fileName:full,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});check(!(result.diagnostics??[]).some(d=>d.category===ts.DiagnosticCategory.Error),`${full}: valid syntax`);}}}walk(base);}
console.log(`Wedding regression passed: ${checks} checks, 6 languages.`);
