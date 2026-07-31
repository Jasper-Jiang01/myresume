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
 */


type BulletItemProps = {
  label: string;
  /** 若提供，整行渲染为可点击的外链跳转 */
  href?: string;
  /** hover 预览卡片的图片路径 */
  previewImage?: string;
};

export function BulletItem({ label, href, previewImage }: BulletItemProps) {
  const content = (
    <>
      <Image
        src={withBasePath("/images/list-dot.svg")}
        alt=""
        width={14}
        height={14}
        className="size-dot-md shrink-0"
      />
      <span
        className="text-body text-muted"
        style={href ? { textDecorationLine: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "4px" } : undefined}
      >
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <HoverPreviewCard
        href={withBasePath(href)}
        previewTitle={label}
        previewImage={previewImage ? withBasePath(previewImage) : undefined}
        className="flex items-center gap-2 text-muted no-underline transition-opacity visited:text-muted hover:text-muted hover:opacity-70"
      >
        {content}
      </HoverPreviewCard>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}
