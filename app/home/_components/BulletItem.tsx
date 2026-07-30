import Image from "next/image";
import { withBasePath } from "@/lib/paths";

type BulletItemProps = {
  label: string;
  /** 若提供，整行渲染为可点击的外链跳转 */
  href?: string;
};

export function BulletItem({ label, href }: BulletItemProps) {
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
      <a
        href={withBasePath(href)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-muted no-underline transition-opacity visited:text-muted hover:text-muted hover:opacity-70"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-2">{content}</div>;
}
