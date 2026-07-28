/**
 * 懒加载 iframe：仅在容器进入视口时才真正加载 src，
 * 避免首屏同时加载多个完整文档（每个 cssdoodle demo 都是独立 HTML 页面）。
 */

"use client";

import { useEffect, useRef, useState } from "react";

type LazyIframeProps = {
  src: string;
  title: string;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  /** 提前多少 px 开始加载（默认 200），让用户滚到时已就绪 */
  rootMargin?: string;
};

export function LazyIframe({
  src,
  title,
  width,
  height,
  scale,
  offsetX,
  offsetY,
  rootMargin = "200px",
}: LazyIframeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 不可见时挂一个轻量占位，可见时再挂 iframe
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className="relative h-full w-full">
      {visible ? (
        <iframe
          src={src}
          title={title}
          className="pointer-events-none absolute left-1/2 top-1/2 origin-center border-0 transition-transform duration-500 ease-out"
          style={{
            width,
            height,
            transform: `translate(-50%, -50%) scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
          }}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          tabIndex={-1}
        />
      ) : (
        // 占位：与容器相同的渐变背景，避免布局抖动
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#e5e5e5] to-[#d0d0d0]" />
      )}
    </div>
  );
}
