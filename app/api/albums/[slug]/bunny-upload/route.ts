/**
 * PUT /api/albums/:slug/bunny-upload?key=<storage-key>
 *
 * Edge proxy — buffers the request body as an ArrayBuffer, then PUTs it to
 * Bunny Storage in a single reliable request.
 *
 * Why buffer instead of stream?
 * Passing a ReadableStream from one fetch() to another inside an Edge function
 * can silently produce 0-byte uploads (the stream is considered "already used"
 * by the V8 runtime). Buffering with req.arrayBuffer() is the reliable
 * alternative; Vercel Edge allows up to ~50 MB in memory per invocation which
 * covers any phone photo.
 *
 * The `key` query param is returned by /upload-url as { type: "bunny-storage", key }.
 * Returns: { publicUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

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

  const contentType = req.headers.get("content-type") ?? "application/octet-stream";

  try {
    // Buffer entire body — avoids the ReadableStream double-consume bug in Edge
    const buffer = await req.arrayBuffer();

    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty file body" }, { status: 400 });
    }

    const endpoint = `https://storage.bunnycdn.com/${storageZone()}/${key}`;

    const bunnyRes = await fetch(endpoint, {
      method: "PUT",
      headers: {
        AccessKey: storageApiKey(),
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
      },
      body: buffer,
    });

    if (!bunnyRes.ok) {
      const msg = await bunnyRes.text().catch(() => bunnyRes.statusText);
      console.error(`[bunny-upload] Bunny error ${bunnyRes.status}:`, msg);
      return NextResponse.json(
        { error: `Storage error (${bunnyRes.status}): ${msg}` },
        { status: 502 },
      );
    }

    const publicUrl = `${cdnUrl()}/${key}`;
    return NextResponse.json({ publicUrl });
  } catch (err) {
    console.error("[bunny-upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
