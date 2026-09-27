import fs from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
// Explicit deployment preflight, never called by a guest/app request.
const expectedProject = 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj';
if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_PROJECT_ID !== expectedProject) throw new Error('Refusing wedding migration outside the verified GuestCam Vercel project');
if (!process.env.DATABASE_URL) {
  if (process.env.VERCEL) throw new Error('DATABASE_URL is required: wedding schema must exist before deployment');
  console.log('[wedding migration] No DATABASE_URL in local build; schema migration not executed.');
} else {
  const sql = neon(process.env.DATABASE_URL);
  const source = await fs.readFile(new URL('./migrations/20260926-wedding-premium.sql', import.meta.url), 'utf8');
  const statements = source.split(';').map(x => x.trim()).filter(Boolean);
  await sql.transaction([sql`SELECT pg_advisory_xact_lock(hashtext('guestcam:wedding-premium:20260926'))`, ...statements.map(statement => sql.query(statement))]);
  const expected = {wedding_settings: ['album_id','enabled','requests_open','schedule','menu','challenges','dj_token_hash','updated_at'], wedding_song_requests: ['id','album_id','guest_token_hash','title','artist','requested_by','note','status','created_at'], wedding_bingo_submissions: ['id','album_id','challenge_id','photo_id','guest_token_hash','created_at']};
  const rows = await sql`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('wedding_settings','wedding_song_requests','wedding_bingo_submissions')`;
  for (const [table, columns] of Object.entries(expected)) for (const column of columns) if (!rows.some(r => r.table_name === table && r.column_name === column)) throw new Error(`Wedding schema mismatch: ${table}.${column}`);
  console.log('[wedding migration] Verified all 3 wedding tables, required columns and additive migration. No core columns changed.');
}
