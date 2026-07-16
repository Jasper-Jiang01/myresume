/**
 * 组件名称：SectionCard
 * 组件描述：SectionCard 组件是用于显示一个 section 的卡片，包含标题和内容。
 * 组件属性：
 *  - children: ReactNode，卡片内容
 *  - className: string，卡片类名
 *  - icon: string，卡片图标
 *  - iconSize: "sm" | "lg"，图标外框大小（白底圆角框）
 *  - iconImageSize: number，图标图形本身边长（px），默认 20
 *  - title: string，卡片标题
 */

import type { ReactNode } from "react";
import { withBasePath } from "@/lib/paths";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  icon?: string;
  iconSize?: "sm" | "lg";
  /** 图标图形边长（px），在这里控制实际显示大小 */
  iconImageSize?: number;
  title: string;
};

export function SectionCard({
  children,
  className = "",
  icon,
  iconSize = "sm",
  iconImageSize = 20,
  title,
}: SectionCardProps) {
  const frameClass =
    iconSize === "lg"
      ? "size-icon-lg rounded-icon-lg"
      : "size-icon rounded-icon";

  return (
    <section
      className={`flex h-full min-h-0 flex-col rounded-card border-card border-cardBorder bg-[#f5f5f5]/70 p-6 backdrop-blur-sm ${className}`}
    >
      <div className="mb-4 flex flex-col gap-2">
        <div
          className={`flex items-center justify-center border border-solid border-cardBorder bg-white shadow-sm ${frameClass}`}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={withBasePath(icon)}
              alt=""
              width={iconImageSize}
              height={iconImageSize}
              style={{ width: iconImageSize, height: iconImageSize }}
              className="object-contain"
            />
          ) : null}
        </div>
        <h2 className="text-section font-medium text-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}
