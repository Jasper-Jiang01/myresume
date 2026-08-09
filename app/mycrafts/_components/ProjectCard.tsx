/**
 * 作品卡片组件
 * 参考 caiguangxi.com 的作品展示卡片
 *
 * 服务端组件：负责卡片骨架 + 静态文本（标题、分类），无客户端 JS。
 * 动态能力（iframe 缩放计算、视口懒加载）拆给 ProjectCover 客户端组件。
 */

import type { ReactNode } from "react";
import type { ProjectPreview } from "../_content/projects";
import { ProjectCover } from "./ProjectCover";

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
  const CardContent = (
    <article className="group relative flex flex-col">
      {/* 封面容器：16:9 比例，圆角，overflow hidden；动态能力由子组件承担 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card">
        <ProjectCover
          src={previewSrc}
          title={title}
          previewConfig={previewConfig}
        />
      </div>

      {/* 文字信息（静态，可安全留在服务端组件） */}
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
        className="block rounded-card outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
