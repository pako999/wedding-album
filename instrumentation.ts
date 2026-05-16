/**
 * Next.js instrumentation hook — runs once per server instance on startup.
 * Used to apply DB migrations so the schema is always up to date.
 */
export async function register() {
  // Only run in the Node.js runtime (not edge), and only on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("./lib/db/migrations");
    await runMigrations();
  }
}
