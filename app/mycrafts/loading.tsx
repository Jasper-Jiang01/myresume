"use client";

import { useEffect, useState } from "react";

const DURATION = 2500;
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 4);

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"counting" | "fading" | "done">("counting");

  useEffect(() => {
    let start = 0;
    let raf = 0;

    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / DURATION, 1);
      setProgress(Math.round(EASE_OUT(t) * 100));

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("fading");
        setTimeout(() => setPhase("done"), 600);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "done") return null;

  const opacity = phase === "fading" ? 0 : 1;
  const translateY = phase === "fading" ? -20 : 0;

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 transition-all duration-500 ease-out"
      style={{ opacity, transform: `translateY(${translateY}px)` }}
      aria-hidden
    >
      {/* 数字 */}
      <div className="flex items-baseline gap-1">
        <span
          className="text-7xl font-light tracking-tight text-primary tabular-nums sm:text-8xl"
          style={{
            fontVariantNumeric: "tabular-nums",
            transition: "transform 0.1s ease-out",
          }}
        >
          {progress}
        </span>
        <span className="text-3xl font-light text-muted sm:text-4xl">%</span>
      </div>

      {/* 进度线 */}
      <div className="h-px w-48 overflow-hidden bg-cardBorder sm:w-64">
        <div
          className="h-full bg-primary transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
