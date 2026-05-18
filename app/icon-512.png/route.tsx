import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#FAF7F2",
          borderRadius: 108,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="320" height="320" viewBox="0 0 32 32" fill="none">
          <rect x="1" y="7" width="30" height="21" rx="4" fill="#C4738A" />
          <circle cx="16" cy="17" r="7" fill="white" opacity="0.2" />
          <circle cx="16" cy="17" r="5" fill="white" />
          <rect x="10" y="5" width="6" height="4" rx="1.5" fill="#C4738A" />
          <rect x="24" y="10" width="4" height="3" rx="1" fill="white" opacity="0.55" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
