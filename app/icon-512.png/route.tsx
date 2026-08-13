import { ImageResponse } from "next/og";

/**
 * PWA manifest icon (512×512). Referenced from public/manifest.json
 * for high-res Android launchers + the maskable-icon fallback. Lives
 * at the literal path `/icon-512.png` because manifest.json points
 * at that exact URL.
 *
 * Color was historically pink (#C4738A) — off-brand. Now matches
 * public/icon.svg exactly (#F4B400 yellow + #8F6900 amber).
 */

export const runtime = "edge";

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
          {/* Ink tile, not cream: at favicon sizes a light ground lets the
              camera's cream interior merge into the background and the mark
              collapses to a thin yellow outline. On ink the body reads at
              10.2:1, and the black figure is unaffected because it sits on
              the opaque cream interior rather than on the tile. Rendered at
              48px and compared against white and yellow grounds before
              choosing. */}
          <rect width="512" height="512" rx="112" fill="#111111" />
          <g transform="translate(28 20) scale(1.06)">
      <path fill="#F4B400" d="M142 91h45l23-30c6-8 15-12 25-12h42c10 0 19 4 25 12l23 30h45c47 0 85 38 85 85v194c0 47-38 85-85 85H142c-47 0-85-38-85-85V176c0-47 38-85 85-85Z" />
      <path fill="#FFF9E8" d="M145 121h57l28-36c2-3 6-5 10-5h32c4 0 8 2 10 5l28 36h57c31 0 57 26 57 57v189c0 31-26 57-57 57H145c-31 0-57-26-57-57V178c0-31 26-57 57-57Z" />
      <path fill="#F4B400" d="M256 132c-7-11-20-16-32-13-16 4-26 19-22 34 5 19 27 30 54 46 27-16 49-27 54-46 4-15-6-30-22-34-12-3-25 2-32 13Z" />
      <circle cx="365" cy="177" r="18" fill="#111111" />
      <circle cx="207" cy="250" r="43" fill="#111111" />
      <circle cx="299" cy="244" r="45" fill="#F4B400" />
      <path fill="#111111" d="M129 391c2-67 31-111 83-111 43 0 70 31 78 79l-2 65H151c-12-8-20-19-22-33Z" />
      <path fill="#F4B400" d="M238 424v-62c3-51 25-82 66-82 50 0 78 43 80 111-2 14-10 25-22 33H238Z" />
      <path fill="#F4B400" d="M334 301c-11-10-28-9-38 3-16 19-36 28-57 26-19-2-35-10-50-25-11-11-28-11-39 0-10 11-10 28 1 39 25 25 53 39 85 41 42 3 77-12 101-45 9-12 8-29-3-39Z" />
      <path fill="#FFF9E8" d="M189 305c15 15 31 23 50 25l-17 48c-27-5-51-17-71-37-11-11-11-28-1-39 11-11 28-10 39 3Z" opacity={0.18} />
          </g>
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
