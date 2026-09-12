"use client";

import { useEffect } from "react";

export function InteractionLayer() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--mouse-x", `${event.clientX}px`);
        root.style.setProperty("--mouse-y", `${event.clientY}px`);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div className="cursorAura" aria-hidden="true" />;
}
