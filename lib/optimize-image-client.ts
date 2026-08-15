/**
 * Browser-side image optimisation for APPEARANCE assets (logo, album
 * background, welcome background).
 *
 * Guest photo uploads must stay originals — full quality is the product
 * promise. Appearance assets are the opposite: a background renders at
 * screen size and a logo at ~100px, so shipping a 20 MB camera original
 * to Bunny wastes storage and makes every guest download it. Downscaling
 * and re-encoding in the browser means the server and CDN only ever see
 * the small file.
 *
 * Encoding strategy: WebP q0.82 first; if the browser cannot encode WebP
 * (canvas.toBlob silently falls back to PNG in that case), logos fall
 * back to PNG (keeps transparency) and backgrounds to JPEG q0.85. If
 * anything throws (exotic format, decode failure), the original file is
 * returned unchanged and the server-side validation stays the gate.
 */

export type AppearanceKind = "logo" | "background" | "welcome";

/** Longest edge after downscale. Logos render small; backgrounds at
 *  phone-screen size, where 1920px is already retina-grade. */
const MAX_DIM: Record<AppearanceKind, number> = {
  logo: 512,
  background: 1920,
  welcome: 1920,
};

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function optimizeAppearanceImage(
  file: File,
  kind: AppearanceKind,
): Promise<{ blob: Blob; contentType: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM[kind] / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    let out = await toBlob(canvas, "image/webp", 0.82);
    if (!out || out.type !== "image/webp") {
      out = kind === "logo"
        ? await toBlob(canvas, "image/png")
        : await toBlob(canvas, "image/jpeg", 0.85);
    }
    // Only use the re-encode when it actually helps; a small, already
    // optimised WebP should pass through untouched.
    if (out && (out.size < file.size || scale < 1)) {
      return { blob: out, contentType: out.type };
    }
  } catch {
    // fall through to the original
  }
  return { blob: file, contentType: file.type };
}
