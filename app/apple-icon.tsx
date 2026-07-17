import { ImageResponse } from "next/og";

/**
 * Apple touch icon for iOS Home Screen + Safari pinned tabs.
 *
 * 180×180 is Apple's current recommended size. Next.js emits
 * `<link rel="apple-touch-icon" sizes="180x180">` automatically.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg
          width="180"
          height="180"
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
