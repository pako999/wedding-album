/**
 * Save-photo helper — mobile-first.
 *
 * The problem this solves (from a guest report):
 *   On iOS Safari, an `<a href="…" download="…">` click opens a "Save in…"
 *   dialog that ONLY offers Files and Google Drive — no Photos (camera
 *   roll). Guests reasonably expect the image to land in their gallery.
 *
 * The fix: on browsers that support the Web Share API level 2
 * (`navigator.canShare({ files })`), fetch the image, wrap it in a File,
 * and call `navigator.share`. That opens the OS-native share sheet,
 * which on iOS includes "Save Image" (→ Photos) and on Android includes
 * "Save to device". No permission prompts, no extra taps.
 *
 * Desktop, older iOS, or share-cancelled: fall back to the classic
 * blob-URL + `<a download>` trick.
 */

const isBrowser = () => typeof window !== "undefined";

/**
 * Best-effort mime-type from a filename. Only used to construct the File
 * blob for the share sheet — falls back to a generic image/octet type
 * that iOS still handles correctly.
 */
function mimeFromFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png":  return "image/png";
    case "webp": return "image/webp";
    case "heic": return "image/heic";
    case "gif":  return "image/gif";
    case "mp4":  return "video/mp4";
    case "mov":  return "video/quicktime";
    case "webm": return "video/webm";
    default:     return "application/octet-stream";
  }
}

/**
 * Try to open the OS share sheet with the given file (Photos / Save to
 * device / etc). Returns `true` on success, `false` if the environment
 * can't share files at all — in which case the caller should fall back
 * to a plain download.
 *
 * A user cancel counts as a successful open (we return true) — we do NOT
 * want to also trigger a download after the user chose "Cancel", because
 * that would surprise them.
 */
async function tryShareFile(url: string, filename: string): Promise<boolean> {
  if (!isBrowser()) return false;
  // `navigator.canShare` isn't in older TS lib.dom — guard through unknown.
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData & { files?: File[] }) => boolean;
    share?:    (data: ShareData & { files?: File[] }) => Promise<void>;
  };
  if (typeof nav.canShare !== "function" || typeof nav.share !== "function") return false;

  try {
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) return false;
    const blob = await res.blob();
    const file = new File([blob], filename, {
      type: blob.type || mimeFromFilename(filename),
    });
    if (!nav.canShare({ files: [file] })) return false;
    await nav.share({ files: [file], title: filename });
    return true;
  } catch (err) {
    // AbortError = user hit "Cancel" — treat as handled so we don't also
    // download. Anything else falls through to the fallback path.
    if (err instanceof Error && err.name === "AbortError") return true;
    console.warn("[share] share failed, falling back to download:", err);
    return false;
  }
}

/**
 * Kick off a plain browser download. Works on desktop and on iOS ≤ 12
 * (the "Save in…" sheet the user was seeing) — not ideal on mobile but
 * still a valid escape hatch.
 */
async function triggerDownload(url: string, filename: string): Promise<void> {
  try {
    // Fetch → blob → object URL. Doing this instead of a direct `<a href>`
    // means CORS-safe cross-origin URLs (e.g. Bunny CDN) still respect
    // the `download` attribute; Safari otherwise ignores it and just
    // navigates to the URL.
    const res = await fetch(url, { credentials: "omit" });
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Free the object URL on the next tick — Safari sometimes needs the
    // URL to still be alive while the download dialog is opening.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
  } catch (err) {
    // Absolute last resort: navigate to the URL and let the browser
    // decide what to do (open image → user long-presses → Save Image).
    console.warn("[download] blob fetch failed, opening URL:", err);
    window.open(url, "_blank", "noopener");
  }
}

/**
 * Save this image to the guest's device. Prefers the OS share sheet
 * (Photos-friendly) and falls back to a normal download.
 */
export async function saveImageToDevice(url: string, filename: string): Promise<void> {
  const shared = await tryShareFile(url, filename);
  if (!shared) await triggerDownload(url, filename);
}
