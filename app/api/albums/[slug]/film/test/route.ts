import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

/**
 * GET /api/albums/[slug]/film/test
 * Tests the Kling API connection by calling their account/balance endpoint.
 * Returns detailed error info so we can see exactly what's wrong.
 */
export async function GET(_req: NextRequest) {
  let userId: string | null = null;
  try { userId = (await auth()).userId; } catch { /* */ }
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;

  if (!accessKey || !secretKey) {
    return NextResponse.json({
      ok: false,
      error: "Env vars missing",
      detail: `KLING_ACCESS_KEY: ${accessKey ? "✅ set" : "❌ MISSING"}, KLING_SECRET_KEY: ${secretKey ? "✅ set" : "❌ MISSING"}`,
    });
  }

  // Build JWT
  try {
    const enc = new TextEncoder();
    const now = Math.floor(Date.now() / 1000);

    const b64url = (buf: ArrayBuffer) =>
      Buffer.from(new Uint8Array(buf)).toString("base64")
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const header  = b64url(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })).buffer as ArrayBuffer);
    const payload = b64url(enc.encode(JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })).buffer as ArrayBuffer);
    const signingInput = `${header}.${payload}`;
    const key = await crypto.subtle.importKey("raw", enc.encode(secretKey).buffer as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signingInput).buffer as ArrayBuffer);
    const jwt = `${signingInput}.${b64url(sig)}`;

    // Call Kling account info endpoint
    const res = await fetch("https://api.klingai.com/account/costs", {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = text; }

    return NextResponse.json({
      ok: res.ok,
      httpStatus: res.status,
      klingResponse: json,
      jwtPreview: `${jwt.slice(0, 40)}...`,
      accessKeyPreview: `${accessKey.slice(0, 8)}...`,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) });
  }
}
