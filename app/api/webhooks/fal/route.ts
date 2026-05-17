import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { filmClips, filmGenerations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import type { KlingWebhookPayload } from "@/lib/film/kling";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/fal
 *
 * Receives completion callbacks from fal.ai for each Kling clip.
 * fal sends: { request_id, status: "COMPLETED"|"FAILED", payload, error }
 */
export async function POST(req: NextRequest) {
  let body: KlingWebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { request_id, status, payload, error } = body;
  if (!request_id) return NextResponse.json({ ok: false }, { status: 400 });

  // Find the clip with this fal request ID
  const clip = await db.query.filmClips
    .findFirst({ where: eq(filmClips.falRequestId, request_id) })
    .catch(() => null);

  if (!clip) {
    // Could be a replay or a request from a different environment — ignore
    console.warn(`[fal webhook] unknown request_id: ${request_id}`);
    return NextResponse.json({ ok: true });
  }

  if (status === "COMPLETED") {
    const videoUrl = payload?.video?.url ?? null;

    await db
      .update(filmClips)
      .set({ status: "done", videoUrl, completedAt: new Date() })
      .where(eq(filmClips.id, clip.id));

    await db
      .update(filmGenerations)
      .set({ clipsDone: sql`${filmGenerations.clipsDone} + 1` })
      .where(eq(filmGenerations.id, clip.generationId));

  } else {
    // FAILED
    console.error(`[fal webhook] FAILED request_id=${request_id}:`, error);

    await db
      .update(filmClips)
      .set({
        status: "failed",
        errorMessage: error ?? "fal.ai generation failed",
        completedAt: new Date(),
      })
      .where(eq(filmClips.id, clip.id));

    await db
      .update(filmGenerations)
      .set({ clipsFailed: sql`${filmGenerations.clipsFailed} + 1` })
      .where(eq(filmGenerations.id, clip.generationId));
  }

  return NextResponse.json({ ok: true });
}
