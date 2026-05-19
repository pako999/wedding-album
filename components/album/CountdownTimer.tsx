"use client";

import { useState, useEffect } from "react";
import type { Translations } from "@/lib/i18n/translations";

interface Props {
  targetDate: string; // ISO date "2025-06-14"
  translations: Translations;
  /** Event-specific accent color for the countdown label. */
  accent?: string;
}

export function CountdownTimer({ targetDate, translations: t, accent = "#1E3A8A" }: Props) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    target.setHours(12, 0, 0, 0);

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
  }, [targetDate, t]);

  if (!label) return null;

  return (
    <span className="font-sans text-xs font-medium" style={{ color: accent }}>{label}</span>
  );
}
