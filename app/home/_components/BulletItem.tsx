import Image from "next/image";
import { withBasePath } from "@/lib/paths";
import { HoverPreviewCard } from "./HoverPreviewCard";

type BulletItemProps = {
  label: string;
  /** 若提供，整行渲染为可点击的外链跳转 */
  href?: string;
  /** hover 预览卡片的描述文案，仅在 href 存在时生效 */
  previewDescription?: string;
};

export function BulletItem({ label, href, previewDescription }: BulletItemProps) {
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
        previewDescription={previewDescription}
        className="flex items-center gap-2 text-muted no-underline transition-opacity visited:text-muted hover:text-muted hover:opacity-70"
      >
        {content}
      </HoverPreviewCard>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}
