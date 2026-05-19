/**
 * GET /api/img?key=albums/slug/filename.jpg
 *
 * Image proxy — fetches directly from Bunny Storage using the API key.
 * This bypasses the Bunny CDN Pull Zone entirely so images always work
 * regardless of Pull Zone configuration.
 *
 * Aggressive Cache-Control headers mean Vercel's CDN + the browser both
 * cache each image after the first fetch, so per-request cost is minimal.
 */

import { NextRequest, NextResponse } from "next/server";

// Node.js runtime — Edge has a hard 4 MB response-body cap which breaks
// large iPhone photos (5–30 MB).  Node.js serverless functions stream the
// response body without buffering it in memory, so any file size works.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");

  if (!key || !key.startsWith("albums/") || key.includes("..")) {
    return new NextResponse("Invalid key", { status: 400 });
  }

  const storageZone = process.env.BUNNY_STORAGE_ZONE ?? "frank1";
  const apiKey      = process.env.BUNNY_STORAGE_API_KEY ?? "";

  if (!apiKey) {
    return new NextResponse("Storage not configured", { status: 503 });
  }

  const storageUrl = `https://storage.bunnycdn.com/${storageZone}/${key}`;

  let res: Response;
  try {
    res = await fetch(storageUrl, {
      headers: { AccessKey: apiKey },
    });
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const contentType    = res.headers.get("Content-Type") ?? "application/octet-stream";
  const contentLength  = res.headers.get("Content-Length");

  const headers: Record<string, string> = {
    "Content-Type":           contentType,
    // Cache aggressively — file content is immutable once uploaded.
    // Vercel's CDN serves subsequent requests from cache; Bunny is only
    // hit once per unique key.
    "Cache-Control":          "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  // Forward Content-Length so browsers can show download progress and
  // client-zip can accurately report per-file size.
  if (contentLength) headers["Content-Length"] = contentLength;

  // res.body is a ReadableStream — Next.js pipes it straight through
  // to the HTTP response without buffering in memory.
  return new NextResponse(res.body, { headers });
}
