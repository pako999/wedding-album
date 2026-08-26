import { NextRequest, NextResponse } from "next/server";
import {
  createBunnyS3PresignedRead,
  isBunnyS3Configured,
} from "@/lib/storage/bunny-s3";

export const runtime = "nodejs";

function validKey(key: string): boolean {
  return (
    key.startsWith("albums/") &&
    !key.includes("..") &&
    !key.includes("\\") &&
    !key.includes("//") &&
    key.length <= 1024
  );
}

/**
 * Stable read URL for objects stored in the NEW Bunny S3 zone.
 *
 * Legacy Guestcam photos keep using BUNNY_CDN_URL and the old storage zone.
 * New S3 photos use this route so the two zones can coexist without rebasing
 * a new object's key onto the old pull zone.
 *
 * If BUNNY_S3_CDN_URL is configured, the browser is redirected to that pull
 * zone. Otherwise we fall back to a short-lived signed S3 GET URL. The image
 * bytes never pass through Vercel in either case.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params;
  const key = Array.isArray(segments) ? segments.join("/") : "";

  if (!validKey(key)) {
    return NextResponse.json({ error: "Invalid storage key" }, { status: 400 });
  }

  if (!isBunnyS3Configured()) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const s3Cdn = (process.env.BUNNY_S3_CDN_URL ?? "")
    .trim()
    .replace(/\/+$/, "");

  try {
    if (s3Cdn) {
      const target = `${s3Cdn}/${key}`;
      const response = NextResponse.redirect(target, 307);
      response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
      return response;
    }

    const signed = await createBunnyS3PresignedRead(key, 300);
    const response = NextResponse.redirect(signed, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (err) {
    console.error("[bunny-s3-file]", err);
    return NextResponse.json({ error: "Storage read unavailable" }, { status: 503 });
  }
}
