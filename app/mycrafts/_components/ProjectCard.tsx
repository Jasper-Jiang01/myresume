/**
 * 作品卡片组件
 * 参考 caiguangxi.com 的作品展示卡片
 * 包含图片、标题、分类，hover 时有动效
 */

import Image from "next/image";
import type { ReactNode } from "react";

type ProjectCardProps = {
  title: string;
  category: string;
  image: string;
  href?: string;
  children?: ReactNode;
};

export function ProjectCard({
  title,
  category,
  image,
  href,
  children,
}: ProjectCardProps) {
  const CardContent = (
    <article className="group relative flex flex-col">
      {/* 图片容器：16:9 比例，圆角，overflow hidden */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-[#e5e5e5]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
