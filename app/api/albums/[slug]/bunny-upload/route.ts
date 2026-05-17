/**
 * PUT /api/albums/:slug/bunny-upload?key=<storage-key>
 *
 * Streaming proxy: pipes the raw request body directly to Bunny Storage
 * without buffering on the server — bypasses Vercel's parsed-body size limit.
 *
 * The `key` query param is returned by /upload-url as { type: "bunny-storage", key }.
 * Returns: { publicUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { isBunnyStorageConfigured, uploadToBunnyStorage } from "@/lib/storage/bunny";

export const runtime = "nodejs";
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
