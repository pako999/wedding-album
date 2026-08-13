import React from "react";
import { CamLoveMark } from "./CamLoveMark";

interface CamLoveLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show the camera icon mark */
  showMark?: boolean;
  /** Extra className on the wrapper */
  className?: string;
  /**
   * Color variant. Default `onLight` renders dark "Cam" + amber "Love"
   * for use on white/cream backgrounds. `onDark` renders white "Cam" +
   * yellow "Love" so the wordmark stays readable on dark footers.
   */
  variant?: "onLight" | "onDark";
}

const SIZE_MAP = {
  sm: { text: "text-lg",  markSize: 24 },
  md: { text: "text-2xl", markSize: 32 },
  lg: { text: "text-4xl", markSize: 48 },
};

/**
 * CamLove brand logo.
 * Use `showMark={false}` for text-only (sidebar / header).
 */
export function CamLoveLogo({
  size = "md",
  showMark = true,
  className = "",
  variant = "onLight",
}: CamLoveLogoProps) {
  const { text, markSize } = SIZE_MAP[size];
  const colors =
    variant === "onDark"
      ? { primary: "#FFFFFF", accent: "#F4B400" }
      : { primary: "#111111", accent: "#946D00" };
  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {showMark && <CamLoveMark size={markSize} />}
      <span className={`font-bold leading-none tracking-tight ${text}`} style={{ fontFamily: "var(--font-dm-sans), DM Sans, sans-serif" }}>
        <span style={{ color: colors.primary }}>Cam</span>
        <span style={{ color: colors.accent }}>Love</span>
      </span>
    </span>
  );
}
