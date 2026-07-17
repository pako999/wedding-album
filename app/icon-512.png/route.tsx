import { ImageResponse } from "next/og";

/**
 * PWA manifest icon (512×512). Referenced from public/manifest.json
 * for high-res Android launchers + the maskable-icon fallback. Lives
 * at the literal path `/icon-512.png` because manifest.json points
 * at that exact URL.
 *
 * Color was historically pink (#C4738A) — off-brand. Now matches
 * public/icon.svg exactly (#FFC94D yellow + #C9820A amber).
 */


export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 512,
          height: 512,
        }}
      >
        <svg
          width="512"
          height="512"
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
    { width: 512, height: 512 },
  );
}
