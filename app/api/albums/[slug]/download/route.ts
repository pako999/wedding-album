import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Legacy server-side ZIP endpoint.
 *
 * Guestcam now downloads albums through /download-urls + the client-side
 * ZipDownloader. That path supports current Bunny S3 photos, historical Bunny
 * Storage objects and Bunny Stream videos without buffering an entire album in
 * a Vercel function.
 *
 * Keep this route explicit rather than silently producing incomplete archives
 * for old callers. The dashboard does not use it anymore.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "legacy_download_retired",
      message: "Use the current dashboard ZIP download flow.",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    },
  );
}
