/**
 * Kling AI image-to-video via fal.ai queue API.
 *
 * Pricing (May 2026): ~$0.05 per 5-second clip (standard v1.6)
 * Docs: https://fal.ai/models/fal-ai/kling-video/v1.6/standard/image-to-video
 *
 * Required env var: FAL_KEY
 */

const FAL_MODEL = "fal-ai/kling-video/v1.6/standard/image-to-video";
const FAL_QUEUE_URL = `https://queue.fal.run/${FAL_MODEL}`;

export interface KlingQueueResponse {
  request_id: string;
  status: string;
  queue_position?: number;
}

export interface KlingWebhookPayload {
  request_id: string;
  status: "COMPLETED" | "FAILED";
  payload?: {
    video?: { url: string; content_type: string; file_size?: number };
  };
  error?: string;
}

/**
 * Event-type → cinematic motion prompt so the AI adds the right vibe.
 */
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

/**
 * Submit one photo to the fal.ai Kling queue.
 * Returns the fal request_id to store in film_clips.fal_request_id.
 */
export async function queueKlingClip({
  imageUrl,
  eventType,
  webhookUrl,
}: {
  imageUrl: string;
  eventType?: string | null;
  webhookUrl: string;
}): Promise<string> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY env var not set");

  const res = await fetch(FAL_QUEUE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Key ${falKey}`,
      "Content-Type": "application/json",
      "x-fal-webhook-url": webhookUrl,
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: filmPrompt(eventType),
      duration: "5",
      aspect_ratio: "16:9",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fal.ai queue error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as KlingQueueResponse;
  return data.request_id;
}
