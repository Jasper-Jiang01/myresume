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
  /** 自定义图标不透明度，0–1 */
  iconOpacity?: number;
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

export function BulletItem({ label, icon: customIcon, iconOpacity, href, previewImage, newTab, internal }: BulletItemProps) {
  const icon = customIcon ? (
    <Image
      src={withBasePath(customIcon)}
      alt=""
      width={16}
      height={16}
      className="size-dot-md shrink-0"
      style={iconOpacity != null ? { opacity: iconOpacity } : undefined}
    />
  ) : (
    <ListDot />
  );

  const textSpan = (
    <span
      className="text-body text-muted"
      style={href ? { textDecorationLine: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "4px" } : undefined}
    >
      {label}
    </span>
  );

  if (href) {
    return (
      <div className="flex items-center gap-2">
        {icon}
        <HoverPreviewCard
          href={internal ? href : withBasePath(href)}
          previewTitle={label}
          previewImage={previewImage}
          newTab={newTab}
          internal={internal}
          className="text-muted no-underline transition-opacity visited:text-muted hover:text-muted hover:opacity-70"
        >
          {textSpan}
        </HoverPreviewCard>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {icon}
      {textSpan}
    </div>
  );
}
