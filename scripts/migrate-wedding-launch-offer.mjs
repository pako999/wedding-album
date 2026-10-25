import fs from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.argv.includes('--apply')) throw new Error('Explicit --apply is required after reviewing the offer migration and target database.');
if (!process.env.DATABASE_URL || !process.env.WEDDING_OFFER_DB_HOST) throw new Error('DATABASE_URL and the reviewed WEDDING_OFFER_DB_HOST are required.');
if (new URL(process.env.DATABASE_URL).hostname !== process.env.WEDDING_OFFER_DB_HOST) throw new Error('Offer migration target does not match the reviewed database host.');
const expectedProject = 'prj_EDblP7nig2nLLZTQlxnrkusvxoSj';
if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_PROJECT_ID !== expectedProject) throw new Error('Refusing offer migration outside the GuestCam project.');
const sql = neon(process.env.DATABASE_URL);
const source = await fs.readFile(new URL('./migrations/20261025-wedding-eight-offer.sql', import.meta.url), 'utf8');
const statements = source.split(';').map(statement => statement.trim()).filter(Boolean);
await sql.transaction(statements.map(statement => sql.query(statement)));
console.log('Offer migration completed: exact-decimal invoices and eight durable launch slots. Existing album/photo rows were not modified.');
