// Real suite routes, Drizzle queries and PostgreSQL engine; isolated auth identity, rate limit and mail transport.
const fs = require('node:fs'); const path = require('node:path'); const assert = require('node:assert/strict');
const { createRequire } = require('node:module'); const root = path.resolve(__dirname, '..'); const req = createRequire(path.join(root,'package.json'));
const ts = req('typescript'); const { PGlite } = require(process.env.PGLITE_MODULE_PATH || '/tmp/wedding-db-check/node_modules/@electric-sql/pglite');
const { drizzle } = req('drizzle-orm/pg-proxy'); const { getTableConfig } = req('drizzle-orm/pg-core'); const { NextRequest } = req('next/server');
(async () => {
 const pg = new PGlite(); const names = ['DATABASE_URL','VERCEL_ENV','WEDDING_SUITE_DB_HOST','WEDDING_INVITE_SECRET','WEDDING_SUITE_SEND_EMAILS','ALBUM_ACCESS_SECRET']; const saved = Object.fromEntries(names.map(name=>[name,process.env[name]]));
 try {
  Object.assign(process.env,{DATABASE_URL:'postgresql://isolated/wedding-tests',VERCEL_ENV:'preview',WEDDING_SUITE_DB_HOST:'isolated',WEDDING_INVITE_SECRET:'isolated-test-invitation-key-longer-than-32-characters',WEDDING_SUITE_SEND_EMAILS:'1',ALBUM_ACCESS_SECRET:'isolated-test-album-key-longer-than-32-characters'});
  let owner = true, sends = 0; const overrides = { '@/lib/album-ownership':{checkAlbumOwnership:async()=>owner?{ok:true}:{ok:false,status:401}}, '@/lib/rate-limit':{checkRateLimit:async()=>({ok:true})}, '@/lib/storage/bunny':{bunnyDisplayUrl:value=>value}, resend:{Resend:class{constructor(){sends++;throw new Error('Preview must not send mail')}}} };
  const cache=new Map(); const load=file=>{ if(file in overrides)return overrides[file];const full=path.resolve(root,file);if(cache.has(full))return cache.get(full);const output={};cache.set(full,output);const code=ts.transpileModule(fs.readFileSync(full,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports',code)(name=>{if(name in overrides)return overrides[name];if(name.startsWith('@/'))return load(name.slice(2)+'.ts');if(name.startsWith('.'))return load(path.resolve(path.dirname(full),name)+'.ts');return req(name)},output);return output;};
  const schema=load('lib/db/schema.ts');
  // Synthetic core fixtures use actual column types, with only the identity constraint needed by real suite FKs.
  for(const table of [schema.albums,schema.photos,schema.albumFeatureFlags]){const info=getTableConfig(table);const cols=info.columns.map(column=>'"'+column.name+'" '+column.getSQLType()+(column.name==='id'?' PRIMARY KEY':''));await pg.exec('CREATE TABLE "'+info.name+'" ('+cols.join(',')+')');}
  await pg.exec(fs.readFileSync(path.join(root,'scripts/migrations/20260926-wedding-premium.sql'),'utf8'));
  const productionMigration = fs.readFileSync(path.join(root,'scripts/migrations/20261026-wedding-suite-production.sql'),'utf8');
  await pg.exec(productionMigration); await pg.exec(productionMigration);
  const db=drizzle(async(sql,params,method)=>{const result=await pg.query(sql,params);return {rows:method==='all'?result.rows.map(Object.values):result.rows}},{schema});
  overrides['@/lib/db']={db};
  const sql=(strings,...values)=>{const text=strings.map((part,index)=>part+(index<values.length?'$'+(index+1):'')).join('');return {text,values,then:(yes,no)=>pg.query(text,values).then(result=>result.rows).then(yes,no)}};
  sql.transaction=statements=>pg.transaction(async tx=>{const result=[];for(const statement of statements)result.push((await tx.query(statement.text,statement.values)).rows);return result;});overrides['@neondatabase/serverless']={neon:()=>sql};
  await pg.query("INSERT INTO albums(id,slug,owner_clerk_id,couple_name,wedding_date,plan,is_published,moderation_enabled,default_lang,photo_count,pending_count,max_photos) VALUES ('album-a','suite-db','owner','Test couple','2027-07-31','premium',true,true,'en',0,0,1000),('sentinel','unchanged','other','Existing','2026-01-01','plus',true,false,'en',9,0,1000)");
  const before=(await pg.query("SELECT * FROM albums WHERE id='sentinel'")).rows;
  const manage=load('app/api/albums/[slug]/wedding-suite/manage/route.ts');const guest=load('app/api/albums/[slug]/wedding-suite/route.ts');const ctx={params:Promise.resolve({slug:'suite-db'})};const cookies=new Map();
  function request(method,body,jar=cookies,extra={}){return new NextRequest('https://preview.test/api/albums/suite-db/wedding-suite',{method,headers:{origin:'https://preview.test',...(method==='GET'?{}:{'Content-Type':'application/json'}),cookie:[...jar].map(([key,value])=>key+'='+value).join('; '),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});}
  async function invoke(route,method,body,jar=cookies){const response=await route[method](request(method,body,jar),ctx);for(const cookie of response.cookies.getAll())jar.set(cookie.name,cookie.value);return {status:response.status,data:await response.json()};}
  owner=false;assert.equal((await invoke(manage,'GET')).status,401);owner=true;
  const {EMPTY_SUITE}=load('lib/wedding-suite/contracts.ts');
  assert.equal((await invoke(manage,'PUT',{...EMPTY_SUITE,enabled:true})).status,200,'a default capsule with no date must not block other settings');
  assert.equal((await invoke(guest,'GET')).data.config.features.capsule,false,'an undated capsule stays unavailable to guests');
  await pg.query('INSERT INTO wedding_settings (album_id,enabled) VALUES ($1,true)',['album-a']);
  assert.equal((await invoke(guest,'GET')).data.hasWeddingProgram,true,'the shared QR page exposes enabled program and music links');
  const programManage = load('app/api/albums/[slug]/wedding/manage/route.ts');
  const programRequest = (method, body) => new NextRequest('https://isolated-preview.test/api/albums/suite-db/wedding/manage?translate=0', { method, headers: { Origin: 'https://isolated-preview.test', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const existingProgram = { enabled: true, requestsOpen: true, schedule: [{ id: 'ceremony', title: 'Ceremony', detail: 'Garden', time: '16:00' }], menu: [{ id: 'dinner', title: 'Dinner', detail: 'Seasonal' }], challenges: [] };
  assert.equal((await programManage.PUT(programRequest('PUT', existingProgram), ctx)).status, 200);
  const djResponse = await programManage.POST(programRequest('POST'), ctx); assert.equal(djResponse.status, 200);
  const beforeRotation = (await programManage.GET(programRequest('GET'), ctx)).status; assert.equal(beforeRotation, 200);
  assert.equal((await programManage.POST(programRequest('POST'), ctx)).status, 200);
  const afterRotation = await (await programManage.GET(programRequest('GET'), ctx)).json();
  assert.deepEqual(afterRotation.settings, existingProgram, 'rotating the DJ link never replaces existing program/menu');
  assert.equal(afterRotation.hasDjLink, true);
  await pg.query('UPDATE wedding_settings SET enabled=false WHERE album_id=$1',['album-a']);
  assert.equal((await invoke(guest,'GET')).data.hasWeddingProgram,false,'disabled program links stay hidden');
  assert.equal((await invoke(guest,'POST',{action:'entry',kind:'capsule',name:'Guest',message:'Not open yet',photoId:null,language:'en'})).status,403);
  const config=JSON.parse(fs.readFileSync(path.join(root,'docs/wedding-suite-test-fixture.json'),'utf8'));config.defaultLang='en';config.tables[0].capacity=2;config.rsvpDeadline=new Date(Date.now()+86400000).toISOString();config.capsuleUnlockAt=new Date(Date.now()+86400000*10).toISOString();
  config.page=load('lib/wedding-suite/page-templates.ts').sampleWeddingPage();
  assert.equal((await invoke(manage,'PUT',config)).status,200);
  const preserved = (await pg.query('SELECT * FROM wedding_suite_settings')).rows;
  await pg.exec(productionMigration);
  assert.deepEqual((await pg.query('SELECT * FROM wedding_suite_settings')).rows, preserved, 'repeated production migration preserves saved page content');
  assert.equal((await invoke(guest,'GET')).data.config.page.coverImageUrl,'/hero/wedding-garden-template.webp','built-in cover paths survive actual route/database round trips');
  const person=(await invoke(manage,'POST',{action:'attendee',attendee:{name:'Test guest',email:'guest@example.test',language:'en',tableId:config.tables[0].id,allowedCompanions:1}})).data.attendee;
  const deleteAssigned=await invoke(manage,'PUT',{...config,tables:[]});assert.equal(deleteAssigned.status,400);assert.equal(deleteAssigned.data.error,'tableInUse');
  const token=new URL(person.invitePath,'https://preview.test').hash.slice('#invite='.length);
  assert.equal((await invoke(guest,'POST',{action:'invite',token:token+'x'})).status,403);
  assert.equal((await invoke(guest,'POST',{action:'invite',token})).status,200);
  assert.equal((await invoke(guest,'GET')).data.attendee.id,person.id);
  assert.equal((await invoke(guest,'POST',{action:'rsvp',language:'de',notifications:true,attending:'yes',companions:['Companion'],menuId:config.menuOptions[0].id,note:'Private note'})).status,200);
  const second=(await invoke(manage,'POST',{action:'attendee',attendee:{name:'Second guest',email:'second@example.test',language:'en',tableId:config.tables[0].id,allowedCompanions:0}})).data.attendee;
  const otherCookies=new Map();const otherToken=new URL(second.invitePath,'https://preview.test').hash.slice('#invite='.length);
  await invoke(guest,'POST',{action:'invite',token:otherToken},otherCookies);await invoke(guest,'GET',undefined,otherCookies);
  assert.equal((await invoke(guest,'POST',{action:'rsvp',language:'en',notifications:true,attending:'yes',companions:[],menuId:null,note:''},otherCookies)).status,409,'seating capacity must be enforced by the actual SQL update');
  assert.deepEqual((await invoke(guest,'POST',{action:'seating',name:'Second guest'})).data.table,{name:config.tables[0].name});
  await invoke(guest,'POST',{action:'entry',kind:'guestbook',name:'Test guest',message:'Happy memories',photoId:null,language:'en'});
  assert.equal((await invoke(guest,'GET')).data.entries.length,0);
  let entries=(await invoke(manage,'GET')).data.entries;const message=entries.find(entry=>entry.message==='Happy memories');
  assert.equal((await invoke(manage,'POST',{action:'moderate',id:message.id,approved:true})).status,200);
  assert.ok((await invoke(guest,'GET')).data.entries.some(entry=>entry.message==='Happy memories'));
  const photoId='8290faf3-fb3a-43d7-9d14-87e45a142453';await pg.query("INSERT INTO photos(id,album_id,blob_url,status,mime_type) VALUES ($1,'sentinel','https://example.test/video.mp4','published','video/mp4')",[photoId]);
  assert.equal((await invoke(guest,'POST',{action:'entry',kind:'video',name:'Guest',message:'Video wish',photoId,language:'en'})).status,400);
  await pg.query("UPDATE photos SET album_id='album-a' WHERE id=$1",[photoId]);
  assert.equal((await invoke(guest,'POST',{action:'entry',kind:'video',name:'Guest',message:'Video wish',photoId,language:'en'})).status,200);
  await invoke(guest,'POST',{action:'entry',kind:'capsule',name:'Hidden author',message:'Sealed anniversary wish',photoId:null,language:'en'});
  entries=(await invoke(manage,'GET')).data.entries;const capsule=entries.find(entry=>entry.kind==='capsule');assert.equal(capsule.locked,true);assert.equal(capsule.message,undefined);
  assert.equal((await invoke(manage,'POST',{action:'moderate',id:capsule.id,approved:true})).status,409);
  assert.equal((await invoke(manage,'PUT',{...config,capsuleUnlockAt:new Date().toISOString()})).status,409,'existing sealed messages prevent an earlier opening');
  assert.equal((await invoke(manage,'PUT',{...config,capsuleUnlockAt:null})).status,409,'removing the date must not expose sealed messages');
  // Test clock progression through fixture data only, without touching application time or customer data.
  config.capsuleUnlockAt='2020-01-01T00:00:00Z';await pg.query('UPDATE wedding_suite_settings SET config=$1::jsonb WHERE album_id=$2',[JSON.stringify(config),'album-a']);
  assert.equal((await invoke(manage,'POST',{action:'moderate',id:capsule.id,approved:true})).status,200);
  assert.ok((await invoke(guest,'GET')).data.entries.some(entry=>entry.message==='Sealed anniversary wish'));
  config.rsvpDeadline='2020-01-01T00:00:00Z';assert.equal((await invoke(manage,'PUT',config)).status,200);
  assert.equal((await invoke(guest,'POST',{action:'preferences',language:'es',notifications:false})).status,200);
  assert.equal((await invoke(guest,'POST',{action:'rsvp',language:'es',notifications:false,attending:'yes',companions:[],menuId:null,note:''})).status,409);
  const mail=(await invoke(manage,'POST',{action:'email',kind:'invitation',ids:[person.id],requestId:crypto.randomUUID()}));assert.equal(mail.status,200);assert.equal(mail.data.preview,true);assert.equal(sends,0);
  const stored=(await pg.query("SELECT html FROM wedding_suite_emails WHERE kind='invitation'")).rows;assert.ok(stored.some(row=>row.html.includes('<html lang="es">')));
  const {hashAlbumPassword}=load('lib/album-password.ts');await pg.query('UPDATE albums SET password=$1 WHERE id=$2',[await hashAlbumPassword('isolated-password'),'album-a']);
  assert.equal((await invoke(guest,'GET',undefined,new Map())).status,404);
  const headerAllowed=await guest.GET(request('GET',undefined,new Map(),{'x-album-password':'isolated-password'}),ctx);assert.equal(headerAllowed.status,200);
  assert.deepEqual((await pg.query("SELECT * FROM albums WHERE id='sentinel'")).rows,before);
  console.log('PASS suite database: actual route authorization, signed invitation exchange, real RSVP/capacity transactions, seating, moderation, foreign-photo rejection, video wishes, locked/open capsules, deadline preferences, Spanish preview mail with zero sends, album password access and unchanged sentinel album.');
 } finally {for(const [name,value]of Object.entries(saved)){if(value===undefined)delete process.env[name];else process.env[name]=value;}await pg.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
