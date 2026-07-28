/**
 * 作品卡片组件
 * 参考 caiguangxi.com 的作品展示卡片
 * 用 iframe 实时渲染 cssdoodle 效果作为封面，hover 时有动效
 */

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ProjectPreview } from "../_content/projects";

type ProjectCardProps = {
  title: string;
  category: string;
  previewSrc: string;
  previewConfig: ProjectPreview;
  href?: string;
  children?: ReactNode;
};

export function ProjectCard({
  title,
  category,
  previewSrc,
  previewConfig,
  href,
  children,
}: ProjectCardProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const { baseWidth, baseHeight } = previewConfig;
  const zoom = previewConfig.zoom ?? 1;
  const offsetX = previewConfig.offsetX ?? 0;
  const offsetY = previewConfig.offsetY ?? 0;

  useEffect(() => {
    const el = coverRef.current;
    if (!el) return;

    // 根据卡片实际渲染宽度，动态换算 iframe 缩放比例，
    // 让「基准视口尺寸」的项目内容始终按等比缩放铺满卡片
    const updateScale = () => {
      const containerWidth = el.clientWidth;
      setScale((containerWidth / baseWidth) * zoom);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth, zoom]);

  const CardContent = (
    <article className="group relative flex flex-col">
      {/* 封面容器：16:9 比例，圆角，overflow hidden */}
      <div
        ref={coverRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-gradient-to-br from-[#e5e5e5] to-[#d0d0d0]"
      >
        {/* 活体预览：用 iframe 实时渲染 cssdoodle 效果作为封面 */}
        {/* iframe 按各项目的基准尺寸渲染，再整体缩放/偏移以适配卡片 */}
        <iframe
          src={previewSrc}
          title={title}
          className="pointer-events-none absolute left-1/2 top-1/2 origin-center border-0 transition-transform duration-500 ease-out"
          style={{
            width: baseWidth,
            height: baseHeight,
            // 先让 iframe 基准视口居中于容器（无论容器实际宽度是多少），
            // 再叠加缩放与自定义偏移（用于跳过导航栏等非核心区域）
            transform: `translate(-50%, -50%) scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
          }}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          tabIndex={-1}
        />
      </div>

      {/* 文字信息 */}
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-body font-medium text-primary group-hover:underline">
          {title}
        </h3>
        <p className="text-body text-muted">{category}</p>
      </div>

      {/* 自定义内容插槽 */}
      {children}
    </article>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block outline-none"
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
