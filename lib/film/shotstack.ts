/**
 * Shotstack montage rendering — combine real album photos into ONE
 * montage video. No AI re-rendering: photos are used as-is (faces
 * untouched), with Ken-Burns motion + crossfade transitions.
 *
 * Uses the stage / sandbox environment.
 * Docs: https://shotstack.io/docs/api/
 *
 * Required env var:
 *   SHOTSTACK_API_KEY — stage/sandbox API key from dashboard.shotstack.io
 */

const SHOTSTACK_BASE = "https://api.shotstack.io/edit/stage";

/** Per-clip duration in seconds. */
const CLIP_LENGTH = 3.5;

/** Hard cap — a montage of hundreds of photos is far too long. */
const MAX_PHOTOS = 60;

/** Ken-Burns motion effects, cycled per clip for visual variety. */
const KEN_BURNS_EFFECTS = [
  "zoomIn",
  "zoomOut",
  "slideLeft",
  "slideRight",
  "slideUp",
] as const;

function apiKey(): string {
  const key = process.env.SHOTSTACK_API_KEY;
  if (!key) throw new Error("SHOTSTACK_API_KEY env var is required");
  return key;
}

// ─── Submit montage render ────────────────────────────────────────────────────

/**
 * Build a Shotstack "Edit" from the given photo URLs and submit it for
 * rendering. Returns the Shotstack render id to poll later.
 */
export async function submitMontage(photoUrls: string[]): Promise<string> {
  // Clamp defensively — the caller already limits, but never exceed the cap.
  const urls = photoUrls.filter(Boolean).slice(0, MAX_PHOTOS);
  if (urls.length === 0) {
    throw new Error("submitMontage: no photo URLs provided");
  }

  const clips = urls.map((url, i) => ({
    asset: {
      type: "image",
      src: url,
    },
    start: Number((i * CLIP_LENGTH).toFixed(2)),
    length: CLIP_LENGTH,
    fit: "cover",
    effect: KEN_BURNS_EFFECTS[i % KEN_BURNS_EFFECTS.length],
    transition: { in: "fade", out: "fade" },
  }));

  const edit = {
    timeline: {
      background: "#000000",
      tracks: [{ clips }],
    },
    output: {
      format: "mp4",
      size: { width: 1280, height: 720 },
    },
  };

  const res = await fetch(`${SHOTSTACK_BASE}/render`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(edit),
  });

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    response?: { id?: string };
  };

  if (!res.ok || !data.response?.id) {
    throw new Error(
      `Shotstack render submit failed (HTTP ${res.status}): ${
        data.message ?? JSON.stringify(data)
      }`,
    );
  }

  return data.response.id;
}

// ─── Poll montage render ──────────────────────────────────────────────────────

/**
 * Poll a Shotstack render by id.
 * Maps Shotstack status:
 *   queued | fetching | rendering | saving → "processing"
 *   done                                   → "done" (+ url)
 *   failed                                 → "failed"
 */
export async function pollMontage(renderId: string): Promise<{
  status: "processing" | "done" | "failed";
  url?: string;
}> {
  const res = await fetch(`${SHOTSTACK_BASE}/render/${renderId}`, {
    headers: { "x-api-key": apiKey() },
  });

  const data = (await res.json().catch(() => ({}))) as {
    message?: string;
    response?: { status?: string; url?: string };
  };

  if (!res.ok || !data.response) {
    throw new Error(
      `Shotstack render poll failed (HTTP ${res.status}): ${
        data.message ?? JSON.stringify(data)
      }`,
    );
  }

  const s = data.response.status;
  if (s === "done") {
    return { status: "done", url: data.response.url };
  }
  if (s === "failed") {
    return { status: "failed" };
  }
  // queued | fetching | rendering | saving (+ any unknown) → still processing
  return { status: "processing" };
}
