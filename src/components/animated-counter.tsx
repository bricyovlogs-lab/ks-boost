"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  suffix?: string;
  durationMs?: number;
};

export function AnimatedCounter({ value, suffix = "", durationMs = 1200 }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(20, Math.floor(durationMs / 16));
    const timer = setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(value * Math.min(1, eased));
      setDisplay(current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, durationMs]);

  return <>{display}{suffix}</>;
}
