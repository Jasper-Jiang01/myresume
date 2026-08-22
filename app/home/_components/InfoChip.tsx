/**
 * Figma: InfoChip
 * 组件名称：InfoChip
 * 组件描述：InfoChip 组件是用于显示信息，包含图标和标签。
 * 组件属性：
 *  - icon: string，图标
 *  - iconSize: number，图标边长（px），默认 14
 *  - label: string，标签
 *  - labelClassName: string，标签类名
 */

import Image from "next/image";
import { withBasePath } from "@/lib/paths";

type InfoChipProps = {
  icon?: string;
  /** 图标边长（px），默认 14 */
  iconSize?: number;
  label: string;
  labelClassName?: string;
};

export function InfoChip({
  icon = "/images/chip-dot.svg",
  iconSize = 14,
  label,
  labelClassName = "text-body",
}: InfoChipProps) {
  return (
    <div className="inline-flex items-center justify-center rounded-chip border border-cardBorder bg-[var(--card-glass)] px-2.5 py-2 shadow-none backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <Image
          src={withBasePath(icon)}
          alt=""
          width={iconSize}
          height={iconSize}
          style={{ width: iconSize, height: iconSize }}
          className="shrink-0"
        />
        <span className={`font-normal text-muted ${labelClassName}`}>
          {label}
        </span>
      </div>
    </div>
  );
}
