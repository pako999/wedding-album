import React from "react";

interface GuestcamLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the camera icon mark */
  showMark?: boolean;
  /** Extra className on the wrapper */
  className?: string;
}

const SIZE_MAP = {
  sm: { text: "text-lg",  markSize: 24 },
  md: { text: "text-2xl", markSize: 32 },
  lg: { text: "text-4xl", markSize: 48 },
};

/** Inline camera icon mark (SVG) */
function CamMark({ size }: { size: number }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <rect x="1" y="7" width="30" height="21" rx="4" fill="#FFC94D" />
      {/* Lens ring */}
      <circle cx="16" cy="17" r="7" fill="white" opacity="0.2" />
      {/* Lens */}
      <circle cx="16" cy="17" r="5" fill="white" />
      {/* Viewfinder bump */}
      <rect x="10" y="5" width="6" height="4" rx="1.5" fill="#F0B429" />
      {/* Flash */}
      <rect x="24" y="10" width="4" height="3" rx="1" fill="white" opacity="0.55" />
    </svg>
  );
}

/**
 * Guestcam brand logo.
 * Use `showMark={false}` for text-only (sidebar / header).
 */
export function GuestcamLogo({ size = "md", showMark = true, className = "" }: GuestcamLogoProps) {
  const { text, markSize } = SIZE_MAP[size];
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {showMark && <CamMark size={markSize} />}
      <span className={`font-bold leading-none tracking-tight ${text}`} style={{ fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
        <span style={{ color: "#0F1729" }}>Guest</span>
        <span style={{ color: "#C9820A" }}>cam</span>
      </span>
    </span>
  );
}
