import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy Vercel Blob upload endpoint.
 *
 * Guestcam now authorizes uploads through /upload-url and persists them through
 * /save-upload. Keeping the old @vercel/blob client-upload handshake exposed
 * would let callers bypass the current album password/permission checks.
 *
 * Return 410 instead of silently accepting old clients. The current UI never
 * receives a `vercel-blob` strategy from /upload-url, so normal uploads are not
 * routed here.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Legacy upload endpoint disabled",
      code: "legacy_upload_disabled",
    },
    { status: 410 },
  );
}
