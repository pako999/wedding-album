/**
 * Google Drive integration — OAuth 2.0 + Drive REST API.
 * Uses the narrow drive.file scope: Guestcam can only touch files it creates.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function driveConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function stateSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("GOOGLE_CLIENT_SECRET is required");
  return secret;
}

function signState(payload: string): string {
  return createHmac("sha256", stateSecret()).update(payload).digest("base64url");
}

/** Short-lived OAuth state bound to both album and signed-in Clerk user. */
export function createDriveState(slug: string, userId: string): string {
  const payload = Buffer.from(JSON.stringify({
    slug,
    userId,
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    nonce: randomBytes(12).toString("base64url"),
  })).toString("base64url");
  return `${payload}.${signState(payload)}`;
}

export function verifyDriveState(state: string): { slug: string; userId: string } | null {
  try {
    const [payload, sig] = state.split(".", 2);
    if (!payload || !sig) return null;
    const expected = signState(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      slug?: unknown; userId?: unknown; exp?: unknown;
    };
    if (typeof data.slug !== "string" || typeof data.userId !== "string" || typeof data.exp !== "number") return null;
    if (data.exp <= Math.floor(Date.now() / 1000)) return null;
    if (data.exp > Math.floor(Date.now() / 1000) + 11 * 60) return null;
    return { slug: data.slug, userId: data.userId };
  } catch {
    return null;
  }
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: DRIVE_SCOPE,
    access_type: "online",
    prompt: "select_account consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token response had no access_token");
  return json.access_token;
}

export async function createFolder(token: string, name: string): Promise<string> {
  const res = await fetch(DRIVE_FILES_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder" }),
  });
  if (!res.ok) throw new Error(`Drive folder creation failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { id: string }).id;
}

/**
 * Resumable Drive upload that streams source bytes instead of buffering a whole
 * 50–500 MB photo/video in Vercel memory.
 */
export async function uploadResponseToDrive(
  token: string,
  folderId: string,
  name: string,
  source: Response,
  mimeType: string,
): Promise<void> {
  if (!source.body) throw new Error("Source response has no body");

  const initHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type": mimeType,
  };
  const sourceLength = source.headers.get("content-length");
  if (sourceLength) initHeaders["X-Upload-Content-Length"] = sourceLength;

  const init = await fetch(`${DRIVE_UPLOAD_URL}?uploadType=resumable`, {
    method: "POST",
    headers: initHeaders,
    body: JSON.stringify({ name, parents: [folderId] }),
  });
  if (!init.ok) throw new Error(`Drive resumable init failed: ${init.status} ${await init.text()}`);
  const location = init.headers.get("location");
  if (!location) throw new Error("Drive resumable upload returned no Location header");

  const uploadHeaders: Record<string, string> = { "Content-Type": mimeType };
  if (sourceLength) uploadHeaders["Content-Length"] = sourceLength;

  const res = await fetch(location, {
    method: "PUT",
    headers: uploadHeaders,
    body: source.body,
    // Node/undici requires duplex when forwarding a ReadableStream.
    // @ts-expect-error duplex is supported by Node fetch but missing from some lib.dom types
    duplex: "half",
  });
  if (!res.ok) throw new Error(`Drive upload failed: ${res.status} ${await res.text()}`);
}

/** Kept for older call sites; new gallery export uses streaming above. */
export async function uploadToDrive(
  token: string,
  folderId: string,
  name: string,
  bytes: ArrayBuffer,
  mimeType: string,
): Promise<void> {
  const source = new Response(bytes, {
    headers: { "Content-Type": mimeType, "Content-Length": String(bytes.byteLength) },
  });
  await uploadResponseToDrive(token, folderId, name, source, mimeType);
}

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/heic": "heic", "image/heif": "heif", "image/gif": "gif",
  "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm",
  "video/mpeg": "mpeg", "video/3gpp": "3gp", "video/avi": "avi",
};

export function extForMime(mimeType: string | null | undefined): string {
  return MIME_EXT[mimeType ?? ""] ?? (mimeType?.startsWith("video/") ? "mp4" : "jpg");
}
