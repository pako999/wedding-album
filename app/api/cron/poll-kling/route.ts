import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { filmClips, filmGenerations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { pollKlingJob } from "@/lib/film/kling";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/cron/poll-kling
 *
 * Polls Kling AI for all "processing" film clips and updates their status.
 * Called by Vercel Cron every 2 minutes (see vercel.json).
 * Also called client-side by FilmStudio as a fallback.
 */
export async function GET(req: NextRequest) {
  // Protect: only Vercel Cron or internal calls (Authorization header or secret param)
  const authHeader = req.headers.get("authorization");
  const secret = req.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  // Fail closed if CRON_SECRET is not configured.
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }
  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManual     = secret === cronSecret;
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all clips currently being processed
  const processing = await db.query.filmClips
    .findMany({
      where: eq(filmClips.status, "processing"),
      columns: { id: true, falRequestId: true, generationId: true },
    })
    .catch(() => []);

  if (processing.length === 0) {
    return NextResponse.json({ polled: 0 });
  }

  let done = 0, failed = 0;

  await Promise.allSettled(
    processing.map(async (clip) => {
      if (!clip.falRequestId) return;
      try {
        const result = await pollKlingJob(clip.falRequestId);

        if (result.status === "done") {
          await db.update(filmClips).set({
            status: "done",
            videoUrl: result.videoUrl ?? null,
            completedAt: new Date(),
          }).where(eq(filmClips.id, clip.id));

          await db.update(filmGenerations).set({
            clipsDone: sql`${filmGenerations.clipsDone} + 1`,
          }).where(eq(filmGenerations.id, clip.generationId));

          done++;
        } else if (result.status === "failed") {
          await db.update(filmClips).set({
            status: "failed",
            errorMessage: "Kling generation failed",
            completedAt: new Date(),
          }).where(eq(filmClips.id, clip.id));

          await db.update(filmGenerations).set({
            clipsFailed: sql`${filmGenerations.clipsFailed} + 1`,
          }).where(eq(filmGenerations.id, clip.generationId));

          failed++;
        }
        // status === "processing" → leave as-is, will be polled next time
      } catch (err) {
        console.error(`[poll-kling] clip ${clip.id}:`, err);
      }
    })
  );

  return NextResponse.json({
    polled: processing.length,
    done,
    failed,
    stillProcessing: processing.length - done - failed,
  });
}
