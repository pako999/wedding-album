"use client";

import { useState, useEffect } from "react";

interface Props {
  targetDate: string; // ISO date "2025-06-14"
}

export function CountdownTimer({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<null | { days: number; label: string }>(null);

  useEffect(() => {
    const target = new Date(targetDate);
    target.setHours(12, 0, 0, 0); // noon on wedding day

    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        // Wedding happened
        const daysSince = Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24)));
        setTimeLeft({ days: daysSince, label: `${daysSince} dni nazaj` });
      } else {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setTimeLeft({ days, label: `Še ${days} dni` });
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <span className="font-sans text-xs text-[#C9A96E] font-medium">
      {timeLeft.label}
    </span>
  );
}
