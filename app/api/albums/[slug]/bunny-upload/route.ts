/**
 * PUT /api/albums/:slug/bunny-upload?key=<storage-key>
 *
 * Node.js proxy — buffers the request body as an ArrayBuffer, then PUTs it to
 * Bunny Storage in a single reliable request.
 *
 * Why Node.js (not Edge)?
 * Vercel Edge functions have a hard 4.5 MB request-body limit, which is smaller
 * than a typical iPhone photo (5–30 MB). Node.js serverless functions have no
 * such limit — they're bounded only by memory (1 GB default) and maxDuration.
 *
 * Why arrayBuffer() instead of streaming?
 * Passing a ReadableStream from one fetch() to another can silently produce
 * 0-byte uploads in some runtimes. req.arrayBuffer() buffers the whole file
 * and then sends it as a single PUT — reliable for files up to ~500 MB.
 *
 * The `key` query param is returned by /upload-url as { type: "bunny-storage", key }.
 * Returns: { publicUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { isBunnyStorageConfigured } from "@/lib/storage/bunny";

// Node.js runtime — no 4.5 MB Edge body-size cap; supports large phone photos
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — enough for a 50 MB photo on a slow connection

const storageApiKey = () => process.env.BUNNY_STORAGE_API_KEY ?? "";
const storageZone   = () => process.env.BUNNY_STORAGE_ZONE ?? "frank1";
const cdnUrl        = () => process.env.BUNNY_CDN_URL ?? "https://frfr1.b-cdn.net";

export async function PUT(
  req: NextRequest,
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
