"use client";

import { useState, useEffect } from "react";
import type { Translations } from "@/lib/i18n/translations";

interface Props {
  targetDate: string; // ISO date "2025-06-14"
  targetTime?: string | null; // optional local time "18:30"
  translations: Translations;
  /** Event-specific accent color for the countdown label. */
  accent?: string;
}

export function CountdownTimer({ targetDate, targetTime, translations: t, accent = "#C9820A" }: Props) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    const timeMatch = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(targetTime ?? "")
      ? targetTime!.split(":").map(Number)
      : null;
    target.setHours(timeMatch?.[0] ?? 12, timeMatch?.[1] ?? 0, 0, 0);

    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      const days = Math.abs(Math.round(diff / (1000 * 60 * 60 * 24)));

      if (Math.abs(diff) < 1000 * 60 * 60 * 12) {
        setLabel(t.today);
      } else if (diff > 0) {
        setLabel(t.daysUntil(days));
      } else {
        setLabel(t.daysSince(days));
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime, t]);

  if (!label) return null;

  return (
    <span className="font-sans text-xs font-semibold tracking-wide" style={{ color: accent }}>{label}</span>
  );
}
