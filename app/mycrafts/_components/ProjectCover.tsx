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
};

export function ProjectCover({ src, title, previewConfig }: ProjectCoverProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { baseWidth, baseHeight } = previewConfig;
  const zoom = previewConfig.zoom ?? 1;
  const offsetX = previewConfig.offsetX ?? 0;
  const offsetY = previewConfig.offsetY ?? 0;

  useEffect(() => {
    const el = coverRef.current;
    if (!el) return;

    const updateScale = () => {
      const containerWidth = el.clientWidth;
      setScale((containerWidth / baseWidth) * zoom);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth, zoom]);

  return (
    <div ref={coverRef} className="relative h-full w-full">
      <LazyIframe
        src={src}
        title={title}
        width={baseWidth}
        height={baseHeight}
        scale={scale}
        offsetX={offsetX}
        offsetY={offsetY}
      />
    </div>
  );
}
