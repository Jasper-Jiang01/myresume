"use client";
// TODO：待优化视觉样式
// 只放到首页加载，第一次加载页面时展示，后面不在展示
import { useEffect, useState } from "react";

const DURATION = 2000;
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

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
        setTimeout(() => setVisible(false), 300);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
      style={{ opacity: progress >= 100 ? 0 : 1 }}
      aria-hidden
    >
      <span className="text-6xl font-bold text-primary tabular-nums sm:text-7xl">
        {progress}
      </span>
    </div>
  );
}
