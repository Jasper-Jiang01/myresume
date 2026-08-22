"use client";

/**
 * 组件名称：ProjectCard
 * 组件描述：可复用的项目卡片组件，点击头部 toggle 展开/收起详情。
 *          封面图下方展示标题与描述两行文字，
 *          收起态展示封面图+文字，展开态额外展示更多图片。图片未提供时用占位容器代替。
 * 组件属性：
 *  - title: string，项目标题，展示于封面图下方
 *  - description?: string，项目描述，展示于标题下方
 *  - coverImage?: string，封面图片路径；未提供时展示占位容器
 *  - images?: string[]，展开后显示的更多图片；未提供时展示占位容器
 *  - defaultOpen?: boolean，是否默认展开，默认 false
 *  - className?: string，追加在最外层容器上的样式类（如横向布局下的宽度控制）
 *  - revealIndex?: number，卡片在列表中的序号，用于滚动进场动画的 stagger 错开延迟
 */

import { useState } from "react";
import Image from "next/image";
import { withBasePath } from "@/lib/paths";
import { useScrollReveal } from "../_hooks/useScrollReveal";

type ProjectCardProps = {
  title: string;
  category?: string;
  description?: string;
  coverImage?: string;
  images?: string[];
  defaultOpen?: boolean;
  className?: string;
  revealIndex?: number;
};

function ImagePlaceholder({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div
      className={`flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-cardBorder bg-card text-body text-muted ${className}`}
    >
      {label ?? "Image"}
    </div>
  );
}

export function ProjectCard({
  title,
  description,
  coverImage,
  images,
  defaultOpen = false,
  className = "",
  revealIndex = 0,
}: ProjectCardProps) {
  const [open] = useState(defaultOpen);
  // 多张卡片依次错开进场，每张间隔 80ms，呼应原站画廊逐项浮现的观感
  const revealRef = useScrollReveal<HTMLDivElement>({ delay: revealIndex * 0.08 });

  return (
    <div ref={revealRef} className={`overflow-hidden ${className}`}>
     
      {/* 收起态封面图：始终展示，hover 时轻微放大+上浮，模拟原站悬停命中局部放大的手感 */}
      <div className="px-4 sm:px-6">
        {coverImage ? (
          <div className="group relative aspect-video w-full overflow-hidden rounded-2xl">
            <Image
              src={withBasePath(coverImage)}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <ImagePlaceholder className="transition-transform duration-500 ease-expo-out hover:-translate-y-0.5 hover:scale-[1.03]" />
        )}
      </div>

      {/* 封面图下方文字：标题 + 描述，各占一行 */}
      <div className="flex flex-col gap-1 px-4 pt-3 sm:px-6">
        <h3 className="truncate text-title font-semibold text-primary">{title}</h3>
        {description ? (
          <p className="truncate text-body text-muted">{description}</p>
        ) : null}
      </div>

      {/* 展开态内容：仅展示更多图片，文字先隐藏，用贝塞尔曲线过渡做带阻尼感的平滑展开 */}
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-expo-out ${
          open ? "grid-rows-[0.5fr]" : "grid-rows-[1fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-4 p-4 pt-4 sm:p-6 sm:pt-4">
            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {images.map((src, index) => (
                  <div key={src} className="relative aspect-video overflow-hidden rounded-2xl">
                    <Image
                      src={withBasePath(src)}
                      alt={`${title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
