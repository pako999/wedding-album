/**
 * Next.js instrumentation hook.
 *
 * Production schema changes must run as an explicit deployment/admin migration,
 * never from a serverless cold start. Running DDL here caused Neon connection
 * spikes and made ordinary page requests responsible for mutating the schema.
 */
export async function register() {
  // Intentionally no database DDL here.
}
