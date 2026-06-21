import { ImageResponse } from "next/og";

/**
 * Browser tab + Google SERP favicon.
 *
 * Next.js auto-routes this to `/icon` and emits the right
 * `<link rel="icon">` tags in HTML. Replaces the old `app/favicon.ico`
 * (which was rendering an off-brand pink camera) with the same
 * yellow design as `public/icon.svg` and the rest of the brand.
 *
 * 48×48 is the smallest size Google accepts for SERP favicons —
 * Google requires a multiple of 48px × 48px (32px was rejected).
 * Higher sizes (apple-icon for iOS, icon-192/512 for the PWA manifest)
 * live in their own routes.
 */

export const runtime = "edge";
export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Mirrors public/icon.svg exactly — brand yellow #FFC94D
            background with a white camera + amber lens. */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="512" height="512" rx="112" fill="#FFC94D" />
          <rect x="221" y="150" width="70" height="42" rx="14" fill="#ffffff" />
          <rect x="96" y="172" width="320" height="214" rx="40" fill="#ffffff" />
          <circle cx="256" cy="279" r="80" fill="#C9820A" opacity="0.16" />
          <circle cx="256" cy="279" r="55" fill="#C9820A" />
          <circle cx="362" cy="214" r="13" fill="#C9820A" opacity="0.5" />
        </svg>
      </div>
    ),
    size,
  );
}
