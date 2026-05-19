/**
 * Kling AI image-to-video — direct API (platform.klingai.com)
 *
 * Auth: HMAC-SHA256 JWT generated from KLING_ACCESS_KEY + KLING_SECRET_KEY
 * Docs: https://docs.qingque.cn/d/home/eZQByLHnpxuE_S26L7RKJL6Vs
 *
 * Pricing (direct): ~$0.03–0.05 per 5-second clip (no fal.ai markup)
 *
 * Required env vars:
 *   KLING_ACCESS_KEY   — "Access Key" from platform.klingai.com
 *   KLING_SECRET_KEY   — "Secret Key" from platform.klingai.com
 */

const KLING_BASE = "https://api.klingai.com";

// ─── JWT ─────────────────────────────────────────────────────────────────────

function base64urlEncode(buf: ArrayBuffer): string {
  return Buffer.from(new Uint8Array(buf))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Build a short-lived JWT (30 min) signed with KLING_SECRET_KEY.
 * Kling requires this on every API call.
 */
async function buildJwt(): Promise<string> {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error("KLING_ACCESS_KEY and KLING_SECRET_KEY env vars are required");
  }

  const now = Math.floor(Date.now() / 1000);
  const enc = new TextEncoder();
  const header  = base64urlEncode(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })).buffer as ArrayBuffer);
  const payload = base64urlEncode(enc.encode(JSON.stringify({
    iss: accessKey,
    exp: now + 1800,
    nbf: now - 5,
  })).buffer as ArrayBuffer);

  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey).buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(signingInput).buffer as ArrayBuffer);

  return `${signingInput}.${base64urlEncode(sig)}`;
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

export function filmPrompt(eventType: string | null | undefined): string {
  switch (eventType) {
    case "wedding":
      return "Cinematic wedding scene, gentle dolly-in motion, soft golden bokeh, romantic atmosphere, film grain";
    case "birthday":
      return "Joyful celebration, slow zoom in, warm colorful bokeh, festive and happy mood, cinematic";
    case "anniversary":
      return "Romantic couple moment, slow pan, warm candlelight tones, nostalgic cinematic feel";
    case "baptism":
      return "Tender family moment, gentle camera drift, soft natural light, peaceful and serene";
    case "graduation":
      return "Triumphant celebration, rising camera motion, bright hopeful light, cinematic";
    case "party":
      return "Lively party atmosphere, dynamic slow zoom, vibrant lights, energetic cinematic mood";
    default:
      return "Cinematic scene, smooth slow motion, beautiful natural light, film grain aesthetic";
  }
}

// ─── Submit job ───────────────────────────────────────────────────────────────

export interface KlingJobResponse {
  code: number;
  message: string;
  data?: {
    task_id: string;
    task_status: string; // "submitted" | "processing" | "succeed" | "failed"
  };
}

export interface KlingTaskResult {
  code: number;
  data?: {
    task_id: string;
    task_status: string;
    task_result?: {
      videos?: { url: string; duration: string }[];
    };
    task_status_msg?: string;
  };
}

/**
 * Submit one image → video job to Kling.
 * Returns the task_id to poll later.
 *
 * Model used: kling-v1-6  (standard, 5 s, 720p)
 * Cheaper option: kling-v1 if credits are limited
 */
export async function submitKlingJob({
  imageUrl,
  eventType,
}: {
  imageUrl: string;
  eventType?: string | null;
}): Promise<string> {
  const jwt = await buildJwt();

  const res = await fetch(`${KLING_BASE}/v1/videos/image2video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_name: "kling-v1-6",          // best quality
      image: imageUrl,                   // Kling's "image" field accepts a base64 string OR an HTTP URL
      prompt: filmPrompt(eventType),
      negative_prompt: "blurry, low quality, watermark, text",
      cfg_scale: 0.5,
      mode: "std",                        // "std" = standard (cheaper), "pro" = higher quality
      duration: "5",                      // 5 seconds
    }),
  });

  const data = (await res.json()) as KlingJobResponse;

  if (!res.ok || data.code !== 0 || !data.data?.task_id) {
    throw new Error(`Kling API error ${data.code}: ${data.message}`);
  }

  return data.data.task_id;
}

/**
 * Poll a task for its result.
 * Returns { status, videoUrl } — status is "processing"|"done"|"failed".
 */
export async function pollKlingJob(taskId: string): Promise<{
  status: "processing" | "done" | "failed";
  videoUrl?: string;
}> {
  const jwt = await buildJwt();

  const res = await fetch(`${KLING_BASE}/v1/videos/image2video/${taskId}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const data = (await res.json()) as KlingTaskResult;

  if (!res.ok || !data.data) return { status: "failed" };

  const s = data.data.task_status;
  if (s === "succeed") {
    const url = data.data.task_result?.videos?.[0]?.url;
    return { status: "done", videoUrl: url };
  }
  if (s === "failed") return { status: "failed" };
  return { status: "processing" };
}
