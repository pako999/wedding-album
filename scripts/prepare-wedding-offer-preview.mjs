import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { neon } from '@neondatabase/serverless';

/** Bootstrap only the original, demonstrably isolated wedding-suite preview. */
export async function prepareWeddingOfferPreview({ env = process.env, connect = neon, readFile = fs.readFile } = {}) {
  const skip = reason => ({ prepared: false, reason });
  if (env.VERCEL_ENV !== 'preview' || env.VERCEL_GIT_COMMIT_REF !== 'feat/wedding-suite-multilingual-preview') return skip('not-the-isolated-preview');
  if (env.VERCEL_PROJECT_ID !== 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj') return skip('project-not-verified');
  if (!env.DATABASE_URL || !env.WEDDING_SUITE_DB_HOST) return skip('database-binding-not-verified');
  try {
    if (new URL(env.DATABASE_URL).hostname !== env.WEDDING_SUITE_DB_HOST) return skip('database-host-mismatch');
    const sql = connect(env.DATABASE_URL);
    const [albums, invoices] = await sql.transaction([
      sql`SELECT count(*)::int AS total, count(*) FILTER (WHERE slug = 'wedding-suite-demo')::int AS demo FROM albums`,
      sql`SELECT count(*)::int AS total FROM bank_orders`,
    ]);
    if (Number(albums[0]?.total) !== Number(albums[0]?.demo) || Number(albums[0]?.total) > 1 || Number(invoices[0]?.total) !== 0) return skip('existing-data-requires-manual-review');
    const source = await readFile(new URL('./migrations/20261026-wedding-twenty-offer.sql', import.meta.url), 'utf8');
    await sql.transaction(source.split(';').map(statement => statement.trim()).filter(Boolean).map(statement => sql.query(statement)));
    return { prepared: true, reason: 'isolated-preview-inventory-initialized' };
  } catch {
    // No connection strings, customer data or credentials in deployment logs.
    return skip('preview-database-unavailable-or-incompatible');
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  console.log('[wedding offer preview]', await prepareWeddingOfferPreview());
}
