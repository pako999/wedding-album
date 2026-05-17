/**
 * PUT /api/albums/:slug/bunny-upload?key=<storage-key>
 *
 * Edge streaming proxy: pipes the raw request body directly to Bunny Storage.
 * Running as Edge runtime means Vercel does NOT buffer the request body,
 * so files of any size (phone RAW photos, 15–30 MB) pass through without hitting
 * the 4.5 MB serverless function body limit.
 *
 * The `key` query param is returned by /upload-url as { type: "bunny-storage", key }.
 * Returns: { publicUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { isBunnyStorageConfigured, uploadToBunnyStorage } from "@/lib/storage/bunny";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params: _params }: { params: Promise<{ slug: string }> },
) {
  if (!isBunnyStorageConfigured()) {
    return NextResponse.json({ error: "Bunny Storage not configured" }, { status: 501 });
  }

  const key = req.nextUrl.searchParams.get("key");
  if (!key || !key.startsWith("albums/")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  if (!req.body) {
    return NextResponse.json({ error: "No body" }, { status: 400 });
  }

  const contentType =
    req.headers.get("content-type") ?? "application/octet-stream";

  try {
    const publicUrl = await uploadToBunnyStorage(req.body, key, contentType);
    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error("[bunny-upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
