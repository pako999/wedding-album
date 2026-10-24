import type { Config } from 'drizzle-kit';
export default { schema: ['./lib/db/schema.ts', './lib/wedding/schema.ts', './lib/wedding-suite/schema.ts'], dialect: 'postgresql' } satisfies Config;
