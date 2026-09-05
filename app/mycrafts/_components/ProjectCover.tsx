/**
 * 作品封面（客户端组件）
 * 负责两项动态能力：
 *   1. 根据卡片实际宽度换算 iframe 缩放比例（ResizeObserver）
 *   2. 视口懒加载 iframe（IntersectionObserver 包裹的 LazyIframe）
 *
 * 单独抽成客户端组件，是为了让 ProjectCard 本身保持为服务端组件，
 * 避免每张卡都带 "use client" 标记导致整卡 JS 下发到客户端。
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectPreview } from "../_content/projects";
import { LazyIframe } from "./LazyIframe";

type ProjectCoverProps = {
  src: string;
  title: string;
  previewConfig: ProjectPreview;
  /** 为 false 时不挂 iframe */
  enabled?: boolean;
};

const HOVER_SCALE = 1.1;

export function ProjectCover({
  src,
  title,
  previewConfig,
  enabled = true,
}: ProjectCoverProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const { baseWidth, baseHeight } = previewConfig;
  const zoom = previewConfig.zoom ?? 1;
  const offsetX = previewConfig.offsetX ?? 0;
  const offsetY = previewConfig.offsetY ?? 0;

  useEffect(() => {
    const el = coverRef.current;
    if (!el) return;

    const updateScale = () => {
      const containerWidth = el.clientWidth;
      // 防御：容器宽度或基准宽度为 0 时跳过，避免产生 NaN/Infinity
      if (containerWidth > 0 && baseWidth > 0) {
        setScale((containerWidth / baseWidth) * zoom);
      }
    };

    updateScale();

    // 特性检测：不支持 ResizeObserver 时仅执行一次 updateScale 作为兜底
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth, zoom]);

  return (
    <div
      ref={coverRef}
      className="relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="h-full w-full transition-transform duration-500 ease-out"
        style={{
          transform: isHovered ? `scale(${HOVER_SCALE})` : "scale(1)",
        }}
      >
        <LazyIframe
          src={src}
          title={title}
          width={baseWidth}
          height={baseHeight}
          scale={scale}
          offsetX={offsetX}
          offsetY={offsetY}
          enabled={enabled}
        />
      </div>
    </div>
  );
}
