import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { neon } from '@neondatabase/serverless';

/** Activate the explicitly requested eight-place offer only on the real production build. */
export async function prepareWeddingOfferProduction({ env = process.env, connect = neon, readFile = fs.readFile } = {}) {
  if (env.VERCEL_ENV !== 'production') return { prepared: false, reason: 'not-production' };
  if (env.VERCEL_PROJECT_ID !== 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj' || env.VERCEL_GIT_COMMIT_REF !== 'main') throw new Error('Offer activation requires the verified GuestCam project and main branch.');
  if (!env.DATABASE_URL) throw new Error('Production offer database is not configured.');
  const sql = connect(env.DATABASE_URL);
  const columns = await sql`SELECT data_type, numeric_precision, numeric_scale FROM information_schema.columns WHERE table_schema='public' AND table_name='bank_orders' AND column_name='plan_price'`;
  const column = columns[0];
  const exact = column?.data_type === 'numeric' && Number(column.numeric_precision) === 12 && Number(column.numeric_scale) === 2;
  if (!exact && !['integer','bigint','smallint'].includes(column?.data_type)) throw new Error('Unrecognized invoice price storage; review required before campaign activation.');
  const source = await readFile(new URL('./migrations/20261025-wedding-eight-offer.sql', import.meta.url), 'utf8');
  const statements = source.split(';').map(statement => statement.trim()).filter(Boolean).filter(statement => !exact || !statement.includes('ALTER TABLE bank_orders'));
  await sql.transaction([
    sql`SET LOCAL lock_timeout = '5s'`, sql`SET LOCAL statement_timeout = '20s'`,
    sql`SELECT pg_advisory_xact_lock(hashtext('guestcam:wedding-eight-offer:20261025'))`,
    ...statements.map(statement => sql.query(statement)),
  ]);
  return { prepared: true, reason: 'eight-place-offer-ready' };
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  console.log('[wedding offer production]', await prepareWeddingOfferProduction());
}
