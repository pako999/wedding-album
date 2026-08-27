import { redirect } from "next/navigation";

/**
 * Backward-compatible demo URL.
 *
 * The actual marketing interaction is the historical QR popup on the homepage.
 * A temporary redirect avoids browser-caching the old permanent redirect and
 * lets bookmarked /demo URLs reopen that popup through the demo query flag.
 */
export default function DemoPage() {
  redirect("/?demo=1");
}
