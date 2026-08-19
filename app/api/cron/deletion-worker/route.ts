import { NextRequest, NextResponse } from "next/server";
import { runDeletionWorker } from "@/lib/storage/deletion-queue";
import { cleanupRateLimitBuckets } from "@/lib/rate-limit";

/**
 * Hourly maintenance worker.
 *
 * Drains the durable storage deletion queue (retries failed remote
 * deletes, dead-letters permanent failures) and, in the same run, sweeps
 * expired rate-limit buckets — so that cleanup never happens on a normal
 * user request. Bounded batch per run; whatever is left waits for the
 * next hour.
 *
 * Scheduled at :17 past the hour (see vercel.json), not every 5 minutes,
 * so it costs ~24 invocations/day instead of ~288.
 */

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deletion = await runDeletionWorker(100).catch((err) => {
    console.error("[deletion-worker] queue run failed:", err);
    return { claimed: 0, deleted: 0, retried: 0, dead: 0, error: true };
  });

  const bucketsRemoved = await cleanupRateLimitBuckets().catch((err) => {
    console.error("[deletion-worker] bucket cleanup failed:", err);
    return 0;
  });

  return NextResponse.json({ deletion, bucketsRemoved });
}
