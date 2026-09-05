"use client";

import Image from "next/image";
import { withBasePath } from "@/lib/paths";
import { HoverPreviewCard } from "@/components/HoverPreviewCard";

/**
 * 组件名称：子弹项
 * 组件描述：BulletItem 组件是用于显示一个列表项，包含图标和文本。
 * 组件属性：
 *  - label: string，列表项文本
 *  - href: string，跳转链接
 *  - previewImage?: string，预览图片路径
 *  - newTab?: boolean，是否在新标签页打开，仅对非站内路由生效；与 internal=true 同时传入无效
 *  - internal?: boolean，是否为站内路由（用 next/link，不需 withBasePath），默认 false
 */

type BulletItemProps = {
  label: string;
  /** 自定义图标路径，替换默认圆点 */
  icon?: string;
  /** 自定义图标边长（px），默认 16 */
  iconSize?: number;
  /** 自定义图标不透明度，0–1 */
  iconOpacity?: number;
  /** 整行水平偏移（px），负值向左 */
  offsetX?: number;
  /** 若提供，整行渲染为可点击的链接跳转；
   *  若 internal 为 true，应传未经 withBasePath 处理的原始站内路径（如 "/mycrafts"） */
  href?: string;
  /** hover 预览卡片的图片路径 */
  previewImage?: string;
  /** 是否在新标签页打开，仅对非站内路由生效；与 internal=true 同时传入时会被忽略（开发环境会打印警告） */
  newTab?: boolean;
  /** 是否为站内路由，为 true 时使用 next/link 且不对 href 做 withBasePath 处理，默认 false */
  internal?: boolean;
};

/** 列表项左侧圆形圆点；颜色走 --dot-fill，避免 Tailwind 对 CSS 变量做 /opacity 失效 */
export function ListDot() {
  return (
    <span
      className="size-dot-md shrink-0 rounded-full"
      style={{ backgroundColor: "var(--dot-fill)" }}
      aria-hidden
    />
  );
}

export function BulletItem({ label, icon: customIcon, iconSize, iconOpacity, offsetX, href, previewImage, newTab, internal }: BulletItemProps) {
  const size = iconSize ?? 16;
  const icon = customIcon ? (
    <Image
      src={withBasePath(customIcon)}
      alt=""
      width={size}
      height={size}
      className={iconSize != null ? "shrink-0" : "size-dot-md shrink-0"}
      style={{
        ...(iconSize != null ? { width: iconSize, height: iconSize } : {}),
        ...(iconOpacity != null ? { opacity: iconOpacity } : {}),
      }}
    />
  ) : (
    <ListDot />
  );

  const textSpan = (
    <span
      className={`text-body leading-none text-muted ${
        href ? "underline decoration-dotted underline-offset-4" : ""
      }`}
    >
      {label}
    </span>
  );

  const rowStyle = offsetX != null ? { transform: `translateX(${offsetX}px)` } : undefined;

  if (href) {
    return (
      <div className="flex h-full items-center gap-2" style={rowStyle}>
        {icon}
        <HoverPreviewCard
          href={internal ? href : withBasePath(href)}
          previewTitle={label}
          previewImage={previewImage}
          newTab={newTab}
          internal={internal}
          className="inline-flex h-full items-center text-muted no-underline transition-opacity visited:text-muted hover:text-muted hover:opacity-70"
        >
          {textSpan}
        </HoverPreviewCard>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center gap-2" style={rowStyle}>
      {icon}
      {textSpan}
    </div>
  );
}
